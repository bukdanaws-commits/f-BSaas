#!/bin/bash

# ===========================================
# EVENTIFY - GCP Deployment Script
# ===========================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ID="eventify-app"
REGION="asia-southeast1"
FRONTEND_SERVICE="eventify-frontend"
BACKEND_SERVICE="eventify-backend"

echo -e "${BLUE}=====================================${NC}"
echo -e "${BLUE}   EVENTIFY GCP Deployment Script    ${NC}"
echo -e "${BLUE}=====================================${NC}"

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}Error: gcloud CLI is not installed.${NC}"
    echo "Please install from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Check if authenticated
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | head -n 1 &> /dev/null; then
    echo -e "${YELLOW}Not authenticated. Please login...${NC}"
    gcloud auth login
fi

# Set project
echo -e "${GREEN}Setting project to: ${PROJECT_ID}${NC}"
gcloud config set project $PROJECT_ID

# Enable required APIs
echo -e "${GREEN}Enabling required APIs...${NC}"
gcloud services enable \
    run.googleapis.com \
    cloudbuild.googleapis.com \
    containerregistry.googleapis.com \
    secretmanager.googleapis.com \
    sqladmin.googleapis.com \
    artifactregistry.googleapis.com

# Create secrets (if not exists)
echo -e "${GREEN}Setting up secrets...${NC}"
create_secret() {
    local secret_name=$1
    local secret_value=$2
    
    if gcloud secrets describe $secret_name &> /dev/null; then
        echo -e "${YELLOW}Secret ${secret_name} already exists${NC}"
    else
        echo -n $secret_value | gcloud secrets create $secret_name --data-file=-
        echo -e "${GREEN}Created secret: ${secret_name}${NC}"
    fi
}

# Prompt for secrets if not set
read -p "Enter DATABASE_URL: " DB_URL
read -p "Enter JWT_SECRET: " JWT_SECRET
read -p "Enter GOOGLE_CLIENT_ID: " GOOGLE_CLIENT_ID
read -p "Enter GOOGLE_CLIENT_SECRET: " GOOGLE_CLIENT_SECRET
read -p "Enter MIDTRANS_SERVER_KEY: " MIDTRANS_SERVER_KEY
read -p "Enter MIDTRANS_CLIENT_KEY: " MIDTRANS_CLIENT_KEY
read -p "Enter NEXTAUTH_SECRET: " NEXTAUTH_SECRET
read -p "Enter FRONTEND_URL (e.g., https://fnb.eventku.co.id): " FRONTEND_URL
read -p "Enter API_URL (e.g., https://api.eventku.co.id): " API_URL
read -p "Enter SUPABASE_URL: " SUPABASE_URL
read -p "Enter SUPABASE_ANON_KEY: " SUPABASE_ANON_KEY

create_secret "database-url" "$DB_URL"
create_secret "jwt-secret" "$JWT_SECRET"
create_secret "google-client-id" "$GOOGLE_CLIENT_ID"
create_secret "google-client-secret" "$GOOGLE_CLIENT_SECRET"
create_secret "midtrans-server-key" "$MIDTRANS_SERVER_KEY"
create_secret "midtrans-client-key" "$MIDTRANS_CLIENT_KEY"
create_secret "nextauth-secret" "$NEXTAUTH_SECRET"

# Build and deploy using Cloud Build
echo -e "${GREEN}Triggering Cloud Build...${NC}"
gcloud builds submit \
    --config cloudbuild.yaml \
    --substitutions=_REGION=$REGION,_FRONTEND_SERVICE=$FRONTEND_SERVICE,_BACKEND_SERVICE=$BACKEND_SERVICE,_DATABASE_URL=$DB_URL,_JWT_SECRET=$JWT_SECRET,_GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID,_GOOGLE_CLIENT_SECRET=$GOOGLE_CLIENT_SECRET,_FRONTEND_URL=$FRONTEND_URL,_API_URL=$API_URL,_SUPABASE_URL=$SUPABASE_URL,_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY,_MIDTRANS_SERVER_KEY=$MIDTRANS_SERVER_KEY,_MIDTRANS_CLIENT_KEY=$MIDTRANS_CLIENT_KEY \
    .

echo -e "${GREEN}=====================================${NC}"
echo -e "${GREEN}   Deployment Complete!              ${NC}"
echo -e "${GREEN}=====================================${NC}"

# Get service URLs
FRONTEND_URL=$(gcloud run services describe $FRONTEND_SERVICE --region=$REGION --format='value(status.url)')
BACKEND_URL=$(gcloud run services describe $BACKEND_SERVICE --region=$REGION --format='value(status.url)')

echo -e "${BLUE}Frontend URL: ${FRONTEND_URL}${NC}"
echo -e "${BLUE}Backend URL: ${BACKEND_URL}${NC}"
