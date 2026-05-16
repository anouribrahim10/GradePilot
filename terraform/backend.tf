terraform {
  backend "azurerm" {
    resource_group_name  = "gradepilot-tfstate-rg"
    storage_account_name = "gradepilotstatesushanta"
    container_name       = "tfstate"
    key                  = "gradepilot.tfstate"
  }
}
