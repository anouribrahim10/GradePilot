variable "project_id" {
  description = "The Google Cloud project ID"
  type        = string
}

variable "region" {
  description = "The Google Cloud region"
  type        = string
  default     = "us-east1"
}

variable "service_name" {
  description = "The Cloud Run service name"
  type        = string
  default     = "gradepilot-anour"
}
