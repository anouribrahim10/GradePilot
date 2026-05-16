variable "subscription_id" {
  description = "Azure subscription ID."
  type        = string
}

variable "location" {
  description = "Azure region."
  type        = string
  default     = "canadacentral"
}

variable "resource_group_name" {
  description = "Resource group that owns all GradePilot resources."
  type        = string
  default     = "gradepilot-sushanta-rg"
}

variable "acr_name" {
  description = "Azure Container Registry name (3-50 alphanumeric, globally unique)."
  type        = string
  default     = "gradepilotsushantaacr"
}

variable "container_app_env_name" {
  description = "Container Apps managed environment name."
  type        = string
  default     = "gradepilot-sushanta-cae"
}

variable "container_app_name" {
  description = "Container App name (the running API service)."
  type        = string
  default     = "gradepilot-api"
}

variable "image" {
  description = "Container image (full ACR path with tag) that the Container App runs."
  type        = string
  default     = "gradepilotsushantaacr.azurecr.io/gradepilot-api:latest"
}
