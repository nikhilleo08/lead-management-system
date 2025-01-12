echo "name of the service is: backend dev"

copilot init -a "backend" -t "Load Balanced Web Service" -n "backend" -d ./Dockerfile

copilot env init --name dev --profile default --default-config

copilot storage init -n "lead-management-dev-cluster" -t Aurora -w "backend" --engine PostgreSQL --initial-db "lead_management"

copilot deploy --name "backend-svc" -e "dev"