# EVENTIFY - Makefile for GCP Deployment

.PHONY: help deploy deploy-backend deploy frontend logs logs-backend logs-frontend clean secrets

PROJECT_ID ?= eventify-app
REGION ?= asia-southeast1

help:
	@echo "EVENTIFY - GCP Deployment Commands"
	@echo ""
	@echo "Deployment:"
	@echo "  make deploy          - Deploy both frontend and backend"
	@echo "  make deploy-backend  - Deploy backend only"
	@echo "  make deploy-frontend - Deploy frontend only"
	@echo ""
	@echo "Monitoring:"
	@echo "  make logs            - View recent logs (all)"
	@echo "  make logs-backend    - View backend logs"
	@echo "  make logs-frontend   - View frontend logs"
	@echo ""
	@echo "Management:"
	@echo "  make secrets         - Create secrets from .env file"
	@echo "  make clean           - Remove local build artifacts"

# Deployment
deploy:
	@echo "Deploying EVENTIFY to GCP..."
	gcloud builds submit --config cloudbuild.yaml .

deploy-backend:
	@echo "Deploying backend..."
	cd backend && gcloud builds submit --tag gcr.io/$(PROJECT_ID)/eventify-backend
	gcloud run deploy eventify-backend \
		--image gcr.io/$(PROJECT_ID)/eventify-backend \
		--region $(REGION) \
		--platform managed \
		--allow-unauthenticated \
		--port 8080 \
		--memory 512Mi \
		--set-secrets "DATABASE_URL=database-url:latest,JWT_SECRET=jwt-secret:latest"

deploy-frontend:
	@echo "Deploying frontend..."
	gcloud builds submit --tag gcr.io/$(PROJECT_ID)/eventify-frontend
	gcloud run deploy eventify-frontend \
		--image gcr.io/$(PROJECT_ID)/eventify-frontend \
		--region $(REGION) \
		--platform managed \
		--allow-unauthenticated \
		--port 3000 \
		--memory 1Gi \
		--set-env-vars "NODE_ENV=production" \
		--set-secrets "NEXTAUTH_SECRET=nextauth-secret:latest"

# Logs
logs:
	gcloud logging read "resource.type=cloud_run_revision" --limit 50 --format="table(timestamp,resource.labels.service_name,textPayload)"

logs-backend:
	gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=eventify-backend" --limit 50

logs-frontend:
	gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=eventify-frontend" --limit 50

# Secrets
secrets:
	@echo "Creating secrets from environment..."
	@read -p "DATABASE_URL: " db_url; \
		echo -n "$$db_url" | gcloud secrets create database-url --data-file=- || true
	@read -p "JWT_SECRET: " jwt; \
		echo -n "$$jwt" | gcloud secrets create jwt-secret --data-file=- || true
	@read -p "NEXTAUTH_SECRET: " na; \
		echo -n "$$na" | gcloud secrets create nextauth-secret --data-file=- || true

# Clean
clean:
	rm -rf .next node_modules
	rm -rf backend/main
	@echo "Clean complete"
