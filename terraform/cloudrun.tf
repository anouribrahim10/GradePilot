resource "google_cloud_run_v2_service" "gradepilot_api" {
  name     = "gradepilot-api"
  location = var.region

  template {
    containers {
      image = var.image

      env {
        name  = "SUPABASE_URL"
        value = var.supabase_url
      }
      env {
        name  = "SUPABASE_JWT_SECRET"
        value = var.supabase_jwt_secret
      }
      env {
        name  = "DATABASE_URL"
        value = var.database_url
      }
      env {
        name  = "GOOGLE_API_KEY"
        value = var.google_api_key
      }
      env {
        name  = "GOOGLE_MODEL"
        value = "gemini-2.5-flash"
      }

      resources {
        limits = {
          cpu    = "1"
          memory = "512Mi"
        }
      }

      ports {
        container_port = 8000
      }
    }

    scaling {
      min_instance_count = 0
      max_instance_count = 3
    }
  }
}

# Allow unauthenticated access to the Cloud Run service
resource "google_cloud_run_v2_service_iam_member" "public_access" {
  project  = var.project_id
  location = var.region
  name     = google_cloud_run_v2_service.gradepilot_api.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

output "service_url" {
  description = "URL of the deployed Cloud Run service"
  value       = google_cloud_run_v2_service.gradepilot_api.uri
}
