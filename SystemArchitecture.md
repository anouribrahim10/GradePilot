# GradePilot Architecture

## Overview
GradePilot is an autonomous academic planning agent. The system is designed to allow students to upload course materials, extract and prioritize tasks, generate study plans, and synchronize with Google Calendar.

## Architecture Diagram

```mermaid
flowchart TD
    Client[Client Browser] --> Frontend[Frontend: React + Vite SPA]
    Frontend --> Backend[Backend: FastAPI (Python 3.12)]
    
    subgraph "GCP Cloud Run"
        Backend
        LangChain[AI Pipeline: LangChain]
        LangGraph[Stateful Agent: LangGraph]
    end
    
    Backend <--> LangChain
    Backend <--> LangGraph
    
    LangChain <--> LLM[LLM Provider: Google Gemini 1.5 Pro]
    LangGraph <--> LLM
    
    Backend <--> DB[(Database: Supabase PostgreSQL)]
    
    Backend <--> GCal[Google Calendar API]
    LangGraph <--> GCal
```

## Components
- **Frontend**: A React and Vite-based Single Page Application providing the student dashboard and admin views.
- **Backend**: A FastAPI server written in Python 3.12, handling REST endpoints, database interactions, and orchestrating AI workflows.
- **AI Orchestration**: 
  - **LangChain**: Used for fixed pipelines like PDF ingestion, RAG over course materials, and task extraction.
  - **LangGraph**: Used as a stateful agent for adaptive re-scheduling, evaluating tasks, and updating external services.
- **LLM Provider**: Google Gemini 1.5 Pro serves as the intelligence layer, abstracted by LangChain to ensure the model provider is swappable.
- **Database**: Supabase (PostgreSQL) handles data storage and authentication. Accessed solely via the backend.
- **External Integrations**: Google Calendar API is used to sync study schedules and deadlines.

## Infrastructure and Deployment
- **Containerization**: Multi-stage Docker builds.
- **Compute**: Deployed to Google Cloud Platform (GCP) Cloud Run.
- **CI/CD**: Managed via GitHub Actions workflows for continuous integration and continuous deployment to Cloud Run.
