# GradePilot Architecture

## Overview
GradePilot is an autonomous academic planning agent. The system is designed to allow students to upload course materials, extract and prioritize tasks, generate study plans, and synchronize with Google Calendar.

## Architecture Diagram

![Architecture Diagram](./docs/step1.webp)

## Architecture Components and Interaction

The GradePilot system architecture consists of four primary layers. The **Client Layer** provides a Next.js Frontend for the student user, containing Dashboard Pages and Upload/Input Forms. This frontend communicates directly with the **Application Layer**, which utilizes Next.js API Routes to handle backend operations such as Authentication Checks and Study Plan Logic. The application layer securely accesses the **Data Layer**, consisting of Supabase Database and Supabase Storage, to retrieve and persist user data and documents. Finally, the **External Services** layer integrates an AI Service that is utilized by the Study Plan Logic to analyze inputs and generate tailored academic content for the users.

## Infrastructure and Deployment
- **Containerization**: Multi-stage Docker builds.
- **Compute**: Deployed to Google Cloud Platform (GCP) Cloud Run.
- **CI/CD**: Managed via GitHub Actions workflows for continuous integration and continuous deployment to Cloud Run.
