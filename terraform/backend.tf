terraform {
  backend "gcs" {
    bucket = "terraform-state-gradepilot-anour"
    prefix = "terraform/state"
  }
}
