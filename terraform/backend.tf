terraform {
  backend "gcs" {
    bucket = "terraform-state-gradepilot-kimiwa"
    prefix = "terraform/state"
  }
}
