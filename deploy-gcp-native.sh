#!/bin/bash

# ===========================================
# EVENTIFY - GCP Native Deployment Script
# Automated deployment to Google Cloud Platform
# ===========================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration - Set these before running
PROJECT_ID="${GCP_PROJECT_ID:-project-78b77615-0318-4252-b83}"
PROJECT_NUMBER="${GCP_PROJECT_NUMBER:-179302194780}"
REGION="asia-southeast1"
DB_INSTANCE="eventify-db"
DB_NAME="eventify"
DB_USER="eventify_user"
GCS_BUCKET="eventify-uploads-${PROJECT_NUMBER}"
FRONTEND_SERVICE="eventify-frontend"
BACKEND_SERVICE="eventify-backend"

# Credentials - Set via environment variables or prompt
GOOGLE_CLIENT_ID="${GOOGLE_CLIENT_ID:-}"
GOOGLE_CLIENT_SECRET="${GOOGLE_CLIENT_SECRET:-}"
MIDTRANS_MERCHANT_ID="${MIDTRANS_MERCHANT_ID:-}"
MIDTRANS_SERVER_KEY="${MIDTRANS_SERVER_KEY:-}"
MIDTRANS_CLIENT_KEY="${MIDTRANS_CLIENT_KEY:-}"

# Check for required credentials
if [ -z "$GOOGLE_CLIENT_ID" ] || [ -z "$GOOGLE_CLIENT_SECRET" ]; then
    echo -e "${RED}Error: Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables${NC}"
    echo "Example: export GOOGLE_CLIENT_ID='your-client-id.apps.googleusercontent.com'"
    exit 1
fi

if [ -z "$MIDTRANS_SERVER_KEY" ] || [ -z "$MIDTRANS_CLIENT_KEY" ]; then
    echo -e "${RED}Error: Please set MIDTRANS_SERVER_KEY and MIDTRANS_CLIENT_KEY environment variables${NC}"
    exit 1
fi

echo -e "${BLUE}=====================================${NC}"
echo -e "${BLUE}   EVENTIFY GCP Native Deployment    ${NC}"
echo -e "${BLUE}=====================================${NC}"
echo ""
echo -e "Project ID: ${GREEN}${PROJECT_ID}${NC}"
echo -e "Region: ${GREEN}${REGION}${NC}"
echo ""

# Step 1: Set Project
echo -e "${YELLOW}[1/9] Setting GCP Project...${NC}"
gcloud config set project $PROJECT_ID

# Step 2: Enable APIs
echo -e "${YELLOW}[2/9] Enabling required APIs...${NC}"
gcloud services enable \
    run.googleapis.com \
    cloudbuild.googleapis.com \
    sqladmin.googleapis.com \
    secretmanager.googleapis.com \
    artifactregistry.googleapis.com \
    compute.googleapis.com \
    --quiet

# Step 3: Create Cloud SQL Instance
echo -e "${YELLOW}[3/9] Creating Cloud SQL instance...${NC}"
if gcloud sql instances describe $DB_INSTANCE --region=$REGION 2>/dev/null; then
    echo -e "${GREEN}Cloud SQL instance already exists${NC}"
else
    echo "Creating new Cloud SQL instance..."
    
    # Generate random password
    DB_PASSWORD=$(openssl rand -base64 24 | tr -d '=/+')
    
    gcloud sql instances create $DB_INSTANCE \
        --database-version=POSTGRES_15 \
        --tier=db-f1-micro \
        --region=$REGION \
        --storage-type=SSD \
        --storage-size=10GB \
        --storage-auto-increase \
        --backup-start-time=02:00 \
        --database-flags=max_connections=100
    
    # Create database
    gcloud sql databases create $DB_NAME --instance=$DB_INSTANCE
    
    # Create user
    gcloud sql users create $DB_USER \
        --instance=$DB_INSTANCE \
        --password="$DB_PASSWORD"
    
    echo -e "${GREEN}Database password: $DB_PASSWORD${NC}"
    echo -e "${YELLOW}Save this password!${NC}"
fi

# Get Cloud SQL connection name
CONNECTION_NAME=$(gcloud sql instances describe $DB_INSTANCE --format='value(connectionName)')
echo -e "Connection Name: ${GREEN}${CONNECTION_NAME}${NC}"

# Step 4: Create GCS Bucket
echo -e "${YELLOW}[4/9] Creating GCS bucket...${NC}"
if gsutil ls gs://$GCS_BUCKET 2>/dev/null; then
    echo -e "${GREEN}GCS bucket already exists${NC}"
else
    gsutil mb -l $REGION gs://$GCS_BUCKET
    # Make public for file access
    gsutil iam ch allUsers:objectViewer gs://$GCS_BUCKET
    echo -e "${GREEN}GCS bucket created and made public${NC}"
fi

# Step 5: Create Secrets
echo -e "${YELLOW}[5/9] Creating secrets in Secret Manager...${NC}"

# Get DB password from instance or prompt
DB_PASSWORD=$(gcloud sql users describe $DB_USER --instance=$DB_INSTANCE 2>/dev/null | grep -oP 'password: \K.*' || echo "")

if [ -z "$DB_PASSWORD" ]; then
    echo -e "${YELLOW}Enter database password: ${NC}"
    read -s DB_PASSWORD
fi

# Database URL
DB_URL="postgres://${DB_USER}:${DB_PASSWORD}@/${DB_NAME}?host=/cloudsql/${CONNECTION_NAME}"
echo -n "$DB_URL" | gcloud secrets create database-url --data-file=- 2>/dev/null || \
    echo -n "$DB_URL" | gcloud secrets versions add database-url --data-file=-

# JWT Secret
JWT_SECRET=$(openssl rand -base64 32)
echo -n "$JWT_SECRET" | gcloud secrets create jwt-secret --data-file=- 2>/dev/null || \
    echo -n "$JWT_SECRET" | gcloud secrets versions add jwt-secret --data-file=-

# Google Client ID
echo -n "$GOOGLE_CLIENT_ID" | gcloud secrets create google-client-id --data-file=- 2>/dev/null || \
    echo -n "$GOOGLE_CLIENT_ID" | gcloud secrets versions add google-client-id --data-file=-

# Google Client Secret
echo -n "$GOOGLE_CLIENT_SECRET" | gcloud secrets create google-client-secret --data-file=- 2>/dev/null || \
    echo -n "$GOOGLE_CLIENT_SECRET" | gcloud secrets versions add google-client-secret --data-file=-

# Midtrans Server Key
echo -n "$MIDTRANS_SERVER_KEY" | gcloud secrets create midtrans-server-key --data-file=- 2>/dev/null || \
    echo -n "$MIDTRANS_SERVER_KEY" | gcloud secrets versions add midtrans-server-key --data-file=-

# NextAuth Secret
NEXTAUTH_SECRET=$(openssl rand -base64 32)
echo -n "$NEXTAUTH_SECRET" | gcloud secrets create nextauth-secret --data-file=- 2>/dev/null || \
    echo -n "$NEXTAUTH_SECRET" | gcloud secrets versions add nextauth-secret --data-file=-

echo -e "${GREEN}All secrets created${NC}"

# Step 6: Grant Permissions
echo -e "${YELLOW}[6/9] Granting permissions to service account...${NC}"
SERVICE_ACCOUNT="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"

# Cloud SQL Client
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SERVICE_ACCOUNT" \
    --role="roles/cloudsql.client" --quiet

# Secret Manager Accessor
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SERVICE_ACCOUNT" \
    --role="roles/secretmanager.secretAccessor" --quiet

# Storage Object Admin
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SERVICE_ACCOUNT" \
    --role="roles/storage.objectAdmin" --quiet

echo -e "${GREEN}Permissions granted${NC}"

# Step 7: Deploy Backend
echo -e "${YELLOW}[7/9] Deploying backend to Cloud Run...${NC}"

cd backend

# Build and push
gcloud builds submit --tag gcr.io/$PROJECT_ID/$BACKEND_SERVICE --quiet

# Deploy
gcloud run deploy $BACKEND_SERVICE \
    --image gcr.io/$PROJECT_ID/$BACKEND_SERVICE \
    --region $REGION \
    --platform managed \
    --allow-unauthenticated \
    --port 8080 \
    --memory 512Mi \
    --cpu 1 \
    --min-instances 1 \
    --max-instances 10 \
    --set-env-vars "STORAGE_TYPE=gcs,GCS_BUCKET_NAME=$GCS_BUCKET,GCP_PROJECT_ID=$PROJECT_ID,MIDTRANS_CLIENT_KEY=$MIDTRANS_CLIENT_KEY,MIDTRANS_MERCHANT_ID=$MIDTRANS_MERCHANT_ID,MIDTRANS_IS_SANDBOX=true,FRONTEND_URL=https://fnb.eventku.co.id" \
    --set-secrets "DATABASE_URL=database-url:latest,JWT_SECRET=jwt-secret:latest,GOOGLE_CLIENT_ID=google-client-id:latest,GOOGLE_CLIENT_SECRET=google-client-secret:latest,MIDTRANS_SERVER_KEY=midtrans-server-key:latest" \
    --add-cloudsql-instances $CONNECTION_NAME \
    --quiet

cd ..

# Get backend URL
BACKEND_URL=$(gcloud run services describe $BACKEND_SERVICE --region=$REGION --format='value(status.url)')
echo -e "${GREEN}Backend deployed: $BACKEND_URL${NC}"

# Step 8: Deploy Frontend
echo -e "${YELLOW}[8/9] Deploying frontend to Cloud Run...${NC}"

# Build and push
gcloud builds submit --tag gcr.io/$PROJECT_ID/$FRONTEND_SERVICE --quiet

# Deploy
gcloud run deploy $FRONTEND_SERVICE \
    --image gcr.io/$PROJECT_ID/$FRONTEND_SERVICE \
    --region $REGION \
    --platform managed \
    --allow-unauthenticated \
    --port 3000 \
    --memory 1Gi \
    --cpu 1 \
    --min-instances 1 \
    --max-instances 10 \
    --set-env-vars "NODE_ENV=production,NEXT_TELEMETRY_DISABLED=1,NEXT_PUBLIC_API_URL=$BACKEND_URL,NEXT_PUBLIC_GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID,NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=$MIDTRANS_CLIENT_KEY,NEXTAUTH_URL=https://fnb.eventku.co.id" \
    --set-secrets "NEXTAUTH_SECRET=nextauth-secret:latest" \
    --quiet

# Get frontend URL
FRONTEND_URL=$(gcloud run services describe $FRONTEND_SERVICE --region=$REGION --format='value(status.url)')
echo -e "${GREEN}Frontend deployed: $FRONTEND_URL${NC}"

# Step 9: Database Migration Instructions
echo -e "${YELLOW}[9/9] Database migration instructions...${NC}"

# Summary
echo ""
echo -e "${GREEN}=====================================${NC}"
echo -e "${GREEN}   DEPLOYMENT COMPLETE!              ${NC}"
echo -e "${GREEN}=====================================${NC}"
echo ""
echo -e "Frontend URL: ${BLUE}$FRONTEND_URL${NC}"
echo -e "Backend URL:  ${BLUE}$BACKEND_URL${NC}"
echo -e "Database:     ${BLUE}$DB_INSTANCE${NC}"
echo -e "GCS Bucket:   ${BLUE}$GCS_BUCKET${NC}"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Run database migrations:"
echo "   gcloud sql connect $DB_INSTANCE --user=$DB_USER --database=$DB_NAME < database/cloudsql-schema.sql"
echo ""
echo "2. Update Google OAuth redirect URLs:"
echo "   Add $FRONTEND_URL/auth/callback to authorized redirect URIs"
echo ""
echo "3. Configure custom domain (optional):"
echo "   gcloud run domain-mappings create --service $FRONTEND_SERVICE --domain fnb.eventku.co.id --region $REGION"
