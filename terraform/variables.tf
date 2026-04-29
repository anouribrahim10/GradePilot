variable "project_id" {
  description = "GCP project ID"
  type        = string
  default     = "gradepilot-494806"
}

variable "region" {
  description = "GCP region"
  type        = string
  default     = "us-central1"
}

variable "image" {
  description = "Docker image to deploy to Cloud Run"
  type        = string
  default     = "us-central1-docker.pkg.dev/gradepilot-494806/gradepilot/gradepilot-api:latest"
}

variable "supabase_url" {
  description = "Supabase project URL"
  type        = string
  sensitive   = true
}

variable "supabase_jwt_secret" {
  description = "Supabase JWT secret"
  type        = string
  sensitive   = true
}

variable "database_url" {
  description = "PostgreSQL connection string"
  type        = string
  sensitive   = true
}

variable "google_api_key" {
  description = "Google Gemini API key"
  type        = string
  sensitive   = true
}
