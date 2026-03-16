# GradePilot: Autonomous Agent Implementation Plan

## 1. Executive Summary
GradePilot is an **autonomous academic planning agent**. Once given a student's context, it continuously monitors deadlines, reasons over course materials, uses tools (calendar, storage, web search), and dynamically adjusts study plans in the background.

## 2. Tech Stack (Aligned with Architecture)

### Frontend
*   **MVP UI:** **Streamlit** for rapid iteration and internal demos.
*   **Production UI:** **React + Vite** for the main student dashboard and admin views.

### Backend (Agent Logic & APIs)
*   **API Framework:** **FastAPI (Python 3.12)** for all HTTP endpoints and integration with the agent loop.
*   **Agent Framework:** **LangChain + LangGraph** for orchestration and stateful agent behaviour (planning, tool selection, re-scheduling).
*   **Background Execution:** Background workers (e.g. Celery/Redis or async tasks) for long-running planning and nightly re-planning jobs.
*   **Database:**
    *   **Relational:** **Supabase (PostgreSQL)** for users, courses, tasks, and schedules.
    *   **Vector Store:** **pgvector on Supabase Postgres** (or an equivalent Postgres vector extension) for embeddings and long-term semantic memory.
*   **Storage:** **Supabase storage** and/or **Google Cloud Storage** for user-uploaded PDFs, notes, and images.

### Agent Tools (APIs the Agent Controls)
*   **LLM Engine:** **Google Gemini 1.5 Pro via LangChain** (configured once as `ChatGoogleGenerativeAI`; all chains and graphs call Gemini through LangChain, not directly).
*   **Web Search / Scraping:** Optional search tools (e.g. Tavily or equivalent) that the agent can invoke when course materials are insufficient.
*   **Calendar Integration:** **Google Calendar API** – the agent creates, updates, and deletes events on the student’s calendar.
*   **Communication:** Optional email/SMS provider (e.g. Resend or Twilio) for proactive notifications.

---

## 3. Feature Recommendations
Potential roadmap features:

1.  **Syllabus Auto-Parser:** Students just upload their course syllabus PDF at the start of the semester. GradePilot automatically extracts all key dates, grading weightings, and textbook requirements, instantly populating their calendar.
2.  **Spaced Repetition Flashcards:** Automatically convert PDF notes into interactive flashcards (like Anki or Quizlet) that adapt to what the student gets wrong.
3.  **Built-in Pomodoro Timer:** A study timer on the dashboard that tracks actual study time vs. planned study time, providing analytics on how focused the student was.
4.  **WhatsApp / SMS Nudges:** Use the Twilio API to send students a friendly text message 30 minutes before a study session or when a deadline is fast approaching.
5.  **"Cram Mode" vs "Chill Mode":** Let users adjust the intensity of the schedule based on their current stress level or unexpected life events.
6.  **Collaborative Study Groups:** Allow users to share their AI-generated study guides and resource links with classmates in the same course.

---

## 4. Step-by-Step Implementation Phases

### Phase 1: Blueprint & Infrastructure Foundation (Weeks 1-3)
*   **Actionable Steps:**
    *   Create UI/UX wireframes, including an "Agent Activity" feed that surfaces background actions.
    *   Initialize the Streamlit MVP and FastAPI backend.
    *   Set up Supabase (PostgreSQL) and configure `pgvector` for the agent's memory.
    *   Set up a background worker queue (e.g. Celery/Redis) or scheduled async tasks for long-running jobs.

### Phase 2: User Context & State Initialization (Weeks 4-5)
*   **Actionable Steps:**
    *   Build the Upload Hub for users to dump PDFs, syllabi, and images.
    *   Implement basic document processing: extract text, chunk it, embed it using an embedding model, and store it in the Vector Database so the agent can query it later.
    *   Collect user availability constraints (e.g., "I only study between 5 PM and 10 PM").

### Phase 3: Building the Autonomous Agent Loop (Weeks 6-8)
*   **Actionable Steps:**
    *   Implement the core planning and tool-using loop using **LangChain + LangGraph** (Gemini accessed only via LangChain).
    *   **Give the Agent Tools:** Write simple Python functions the LLM can trigger (e.g., `search_web_for_topic(query)`, `create_calendar_event(time, task)`, `read_document_chunk(topic_id)`).
    *   Develop the **Planning System:** The agent surveys the upcoming month, identifies gaps in knowledge, and formulates a step-by-step preparation plan.

### Phase 4: Proactive Execution & Dynamic Rescheduling (Weeks 9-10)
*   **Actionable Steps:**
    *   Implement cron jobs that wake the agent up daily.
    *   The agent pulls the user's state: "Did they mark yesterday's study block as complete?"
    *   If no, the agent uses its `update_calendar()` tool to shift the workload forward, prioritizing higher-value tasks to prevent cramming.
    *   If a concept in a PDF is contradictory or vague, the agent autonomously decides to use the web search tool to find clarificaton before building the quiz.

### Phase 5: Practice Evaluation & Memory Feedback (Weeks 11-12)
*   **Actionable Steps:**
    *   The agent generates practice quizzes and evaluates user answers.
    *   **Memory Update:** The agent writes the evaluation results back to its long-term memory (e.g., "Student struggles with Chapter 3 concepts").
    *   The agent incorporates this memory into future planning, automatically scheduling review sessions for weak areas without being explicitly told to do so.
    *   Finalize UI, ensure smooth transitions, and deploy the system.
