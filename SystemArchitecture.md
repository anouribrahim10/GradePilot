# GradePilot Architecture

## Step 1 – High-Level Component Diagram

```mermaid
graph TD
    FE[Next.js Frontend]
    API[FastAPI Backend]
    GEMINI[Google Gemini API]
    DB[(Supabase PostgreSQL)]
    AUTH[Supabase Auth]

    FE -->|REST API| API
    API -->|JWT verification| AUTH
    API -->|AI generation| GEMINI
    API -->|read/write| DB
```

The frontend sends REST requests to the FastAPI backend, which validates the user's JWT with Supabase Auth. Depending on the request, the backend either reads or writes data to Supabase PostgreSQL, or calls the Google Gemini API to generate study plans, practice questions, or document summaries.

---

## Step 2 – Entity Diagram

```mermaid
erDiagram
    USER ||--o{ COURSE : owns
    COURSE ||--o{ COURSE_NOTES : has
    COURSE ||--o{ STUDY_PLAN : has
    COURSE_NOTES ||--o{ STUDY_PLAN : "source for"
```

A user can take many courses. Each course can have many notes and many study plans. A study plan is linked to the notes it was generated from, so the system can trace which notes produced which plan.

---

## Step 3 – Call Sequence Diagram

```mermaid
sequenceDiagram
    actor Student
    participant Frontend
    participant Backend
    participant Gemini
    participant Database

    Student->>Frontend: Request study plan
    Frontend->>Backend: POST /classes/{id}/study-plan
    Backend->>Database: Fetch course and notes
    Database-->>Backend: Course and notes data
    Backend->>Gemini: Generate study plan prompt
    Gemini-->>Backend: Study plan JSON
    Backend->>Database: Save study plan
    Backend-->>Frontend: Study plan response
    Frontend-->>Student: Display study plan
```

The student requests a study plan from the dashboard. The backend fetches the relevant course and notes from the database, sends a prompt to Google Gemini, and saves the returned study plan back to the database before returning it to the frontend for display.
