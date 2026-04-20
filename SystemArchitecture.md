# GradePilot Architecture

## Step 1 – High-Level Component Diagram

```mermaid
graph TD
    subgraph Client["Client Layer"]
        FE["Next.js Frontend\n(React + Tailwind)"]
    end

    subgraph Backend["Backend – FastAPI (Python 3.12)"]
        MW["CORS Middleware"]
        AR["Auth Router\n/auth/me"]
        CR["Classes Router\n/classes/*"]
        SR["Summarise Router\n/summarise"]
        DEP["Auth Dependency\n(JWT Verification)"]
        SVC_SP["StudyPlan Service"]
        SVC_PQ["Practice Service"]
        SVC_SUM["Summarise Service"]
        CRUD["CRUD Layer\n(SQLAlchemy)"]
    end

    subgraph AI["AI Layer"]
        GEMINI["Google Gemini\n(generativeai SDK)"]
    end

    subgraph Data["Data Layer"]
        SUPA["Supabase\n(PostgreSQL)"]
        SUPA_AUTH["Supabase Auth\n(JWT issuer)"]
    end

    FE -->|"HTTPS REST + Bearer JWT"| MW
    MW --> AR
    MW --> CR
    MW --> SR
    AR --> DEP
    CR --> DEP
    SR --> DEP
    DEP -->|"verify JWT"| SUPA_AUTH
    CR --> SVC_SP
    CR --> SVC_PQ
    SR --> SVC_SUM
    SVC_SP -->|"generate_content()"| GEMINI
    SVC_PQ -->|"generate_content()"| GEMINI
    SVC_SUM -->|"generate_content()"| GEMINI
    CR --> CRUD
    CRUD -->|"SQLAlchemy ORM"| SUPA
```

The GradePilot system is composed of four layers. The **Next.js frontend** (React + Tailwind CSS) runs in the browser and communicates with the backend exclusively over HTTPS REST calls, attaching a Supabase-issued JWT as a Bearer token. The **FastAPI backend** is the central hub: a CORS middleware layer gates all incoming requests, three routers (`/auth`, `/classes`, `/summarise`) handle distinct concerns, and a shared auth dependency validates every JWT against the Supabase Auth JWKS endpoint before any handler executes. Business logic lives in three service modules — `StudyPlanService`, `PracticeService`, and `SummariseService` — each of which calls the **Google Gemini API** (via the `google-generativeai` SDK) to generate structured JSON responses. Persistent data (classes, notes, study plans) is written and read through a SQLAlchemy CRUD layer that connects to **Supabase PostgreSQL**.

---

## Step 2 – Entity Diagram

```mermaid
erDiagram
    USER {
        string id PK
        string email
        string created_at
    }
    COURSE {
        string id PK
        string user_id FK
        string title
        string created_at
    }
    COURSE_NOTES {
        string id PK
        string course_id FK
        string user_id FK
        string notes_text
        string created_at
    }
    STUDY_PLAN {
        string id PK
        string course_id FK
        string user_id FK
        string source_notes_id FK
        string plan_json
        string model
        string created_at
    }
    USER ||--o{ COURSE : "owns"
    COURSE ||--o{ COURSE_NOTES : "has"
    COURSE ||--o{ STUDY_PLAN : "has"
    COURSE_NOTES ||--o{ STUDY_PLAN : "source for"
```

These four entities model the core academic-planning capability of GradePilot. A **USER** (managed by Supabase Auth) can own many **CLASS** records, each representing a course the student is enrolled in. Each class can accumulate many **CLASS_NOTES** entries — raw text the student pastes or uploads from their course materials. A **STUDY_PLAN** is generated from a specific set of notes: it holds a foreign key to both the parent `CLASS` and the `CLASS_NOTES` record that was used as source material (`source_notes_id`), allowing the system to trace which notes produced which plan. The generated schedule is stored as a `JSONB` blob (`plan_json`) alongside the name of the Gemini model that produced it, enabling future model comparisons. All tables carry a `user_id` column so that row-level security policies in Supabase can enforce per-user data isolation at the database layer.

---

## Step 3 – Call Sequence Diagram (Study Plan Generation)

```mermaid
sequenceDiagram
    actor Student
    participant FE as Next.js Frontend
    participant API as FastAPI Backend
    participant Auth as Auth Dependency
    participant SUPA_AUTH as Supabase Auth (JWKS)
    participant CRUD as CRUD / SQLAlchemy
    participant DB as Supabase PostgreSQL
    participant SVC as StudyPlan Service
    participant GEMINI as Google Gemini API

    Student->>FE: Click "Generate Study Plan"
    FE->>API: POST /classes/{id}/study-plan\nAuthorization: Bearer <jwt>
    API->>Auth: get_current_user(credentials)
    Auth->>SUPA_AUTH: Fetch JWKS & verify JWT signature
    SUPA_AUTH-->>Auth: JWT claims (sub = user_id)
    Auth-->>API: CurrentUser(user_id, claims)

    API->>CRUD: get_class(db, user_id, class_id)
    CRUD->>DB: SELECT * FROM classes WHERE id=? AND user_id=?
    DB-->>CRUD: Class row
    CRUD-->>API: Class object

    API->>CRUD: get_latest_notes(db, user_id, class_id)
    CRUD->>DB: SELECT * FROM class_notes WHERE class_id=? ORDER BY created_at DESC LIMIT 1
    DB-->>CRUD: ClassNotes row
    CRUD-->>API: ClassNotes object

    API->>SVC: generate_study_plan(class_title, notes_text)
    SVC->>GEMINI: GenerativeModel.generate_content(prompt, response_mime_type=application/json)
    GEMINI-->>SVC: JSON string (title, goals, schedule)
    SVC->>SVC: json.loads() + StudyPlanAI.model_validate()
    SVC-->>API: (plan_dict, model_name)

    API->>CRUD: create_study_plan(db, user_id, class_id, source_notes_id, plan_json, model)
    CRUD->>DB: INSERT INTO study_plans ...
    DB-->>CRUD: StudyPlan row
    CRUD-->>API: StudyPlan object

    API-->>FE: 200 OK – StudyPlanOut JSON
    FE-->>Student: Render study plan
```

This sequence traces the full lifecycle of a study-plan generation request. The student triggers the flow from the Next.js dashboard; the frontend attaches the Supabase JWT and calls `POST /classes/{id}/study-plan`. The FastAPI auth dependency immediately validates the token against Supabase's JWKS endpoint and extracts the `user_id` from the `sub` claim. The classes router then performs two guarded database reads — first confirming the class belongs to the authenticated user, then fetching the most recent notes for that class. With the notes text in hand, the `StudyPlanService` constructs a structured prompt and calls the Google Gemini API, requesting a JSON response. The raw JSON string is parsed and validated against the `StudyPlanAI` Pydantic schema before being persisted to Supabase via SQLAlchemy. Finally, the serialised `StudyPlanOut` is returned to the frontend for rendering.
