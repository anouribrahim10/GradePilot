terraform {
  backend "gcs" {
    bucket = "terraform-state-gradepilot-sajid867"
    prefix = "terraform/state"
  }
}
