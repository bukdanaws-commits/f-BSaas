# EVENTIFY - Step-by-Step Deployment Guide

## Prerequisites

Before starting, prepare these credentials:

| Credential | Where to Get |
|------------|--------------|
| Google Client ID | Google Cloud Console > APIs & Services > Credentials |
| Google Client Secret | Google Cloud Console > APIs & Services > Credentials |
| Midtrans Merchant ID | Midtrans Dashboard |
| Midtrans Server Key | Midtrans Dashboard |
| Midtrans Client Key | Midtrans Dashboard |

## Configuration

| Item | Value |
|------|-------|
| GCP Project ID | `project-78b77615-0318-4252-b83` |
| GCP Project Number | `179302194780` |
| Region | `asia-southeast1` (Singapore) |

---

## Step 1: Install & Login gcloud CLI

```bash
# macOS
brew install google-cloud-sdk

# Initialize and login
gcloud init
gcloud auth login
```

---

## Step 2: Set Project

```bash
gcloud config set project project-78b77615-0318-4252-b83
```

---

## Step 3: Enable APIs

```bash
gcloud services enable \
    run.googleapis.com \
    cloudbuild.googleapis.com \
    sqladmin.googleapis.com \
    secretmanager.googleapis.com \
    artifactregistry.googleapis.com \
    compute.googleapis.com
```

---

## Step 4: Create Cloud SQL Instance

```bash
# Create instance (db-f1-micro ~ $7/month)
gcloud sql instances create eventify-db \
    --database-version=POSTGRES_15 \
    --tier=db-f1-micro \
    --region=asia-southeast1 \
    --storage-type=SSD \
    --storage-size=10GB \
    --storage-auto-increase \
    --backup-start-time=02:00

# Create database
gcloud sql databases create eventify --instance=eventify-db

# Create user (save the password!)
gcloud sql users create eventify_user \
    --instance=eventify-db \
    --password="YOUR_SECURE_PASSWORD_HERE"

# Get connection name
gcloud sql instances describe eventify-db --format='value(connectionName)'
# Output: project-78b77615-0318-4252-b83:asia-southeast1:eventify-db
```

---

## Step 5: Create GCS Bucket

```bash
# Create bucket
gsutil mb -l asia-southeast1 gs://eventify-uploads-179302194780

# Make public
gsutil iam ch allUsers:objectViewer gs://eventify-uploads-179302194780
```

---

## Step 6: Create Secrets

```bash
# Set your credentials as environment variables first
export GOOGLE_CLIENT_ID="your-google-client-id"
export GOOGLE_CLIENT_SECRET="your-google-client-secret"
export MIDTRANS_SERVER_KEY="your-midtrans-server-key"
export MIDTRANS_CLIENT_KEY="your-midtrans-client-key"

# Replace YOUR_DB_PASSWORD with the password from Step 4
CONNECTION_NAME="project-78b77615-0318-4252-b83:asia-southeast1:eventify-db"
DB_PASSWORD="YOUR_DB_PASSWORD"

# Database URL
echo -n "postgres://eventify_user:${DB_PASSWORD}@/eventify?host=/cloudsql/${CONNECTION_NAME}" | \
    gcloud secrets create database-url --data-file=-

# JWT Secret
echo -n "$(openssl rand -base64 32)" | gcloud secrets create jwt-secret --data-file=-

# Google Client ID
echo -n "$GOOGLE_CLIENT_ID" | gcloud secrets create google-client-id --data-file=-

# Google Client Secret
echo -n "$GOOGLE_CLIENT_SECRET" | gcloud secrets create google-client-secret --data-file=-

# Midtrans Server Key
echo -n "$MIDTRANS_SERVER_KEY" | gcloud secrets create midtrans-server-key --data-file=-

# NextAuth Secret
echo -n "$(openssl rand -base64 32)" | gcloud secrets create nextauth-secret --data-file=-
```

---

## Step 7: Grant Permissions

```bash
SERVICE_ACCOUNT="179302194780-compute@developer.gserviceaccount.com"

# Cloud SQL Client
gcloud projects add-iam-policy-binding project-78b77615-0318-4252-b83 \
    --member="serviceAccount:$SERVICE_ACCOUNT" \
    --role="roles/cloudsql.client"

# Secret Manager Accessor
gcloud projects add-iam-policy-binding project-78b77615-0318-4252-b83 \
    --member="serviceAccount:$SERVICE_ACCOUNT" \
    --role="roles/secretmanager.secretAccessor"

# Storage Object Admin
gcloud projects add-iam-policy-binding project-78b77615-0318-4252-b83 \
    --member="serviceAccount:$SERVICE_ACCOUNT" \
    --role="roles/storage.objectAdmin"
```

---

## Step 8: Deploy Backend

```bash
cd backend

# Build
gcloud builds submit --tag gcr.io/project-78b77615-0318-4252-b83/eventify-backend

# Deploy (replace YOUR_MIDTRANS_CLIENT_KEY and YOUR_MIDTRANS_MERCHANT_ID)
gcloud run deploy eventify-backend \
    --image gcr.io/project-78b77615-0318-4252-b83/eventify-backend \
    --region asia-southeast1 \
    --platform managed \
    --allow-unauthenticated \
    --port 8080 \
    --memory 512Mi \
    --cpu 1 \
    --min-instances 1 \
    --set-env-vars "STORAGE_TYPE=gcs,GCS_BUCKET_NAME=eventify-uploads-179302194780,GCP_PROJECT_ID=project-78b77615-0318-4252-b83,MIDTRANS_CLIENT_KEY=YOUR_MIDTRANS_CLIENT_KEY,MIDTRANS_MERCHANT_ID=YOUR_MIDTRANS_MERCHANT_ID,MIDTRANS_IS_SANDBOX=true,FRONTEND_URL=https://fnb.eventku.co.id" \
    --set-secrets "DATABASE_URL=database-url:latest,JWT_SECRET=jwt-secret:latest,GOOGLE_CLIENT_ID=google-client-id:latest,GOOGLE_CLIENT_SECRET=google-client-secret:latest,MIDTRANS_SERVER_KEY=midtrans-server-key:latest" \
    --add-cloudsql-instances project-78b77615-0318-4252-b83:asia-southeast1:eventify-db

cd ..

# Get backend URL
gcloud run services describe eventify-backend --region=asia-southeast1 --format='value(status.url)'
```

---

## Step 9: Deploy Frontend

```bash
# Replace BACKEND_URL with the URL from Step 8
BACKEND_URL="https://eventify-backend-XXXXX-uc.a.run.app"

# Replace with your Google Client ID
GOOGLE_CLIENT_ID="your-google-client-id"

# Replace with your Midtrans Client Key
MIDTRANS_CLIENT_KEY="your-midtrans-client-key"

# Build
gcloud builds submit --tag gcr.io/project-78b77615-0318-4252-b83/eventify-frontend

# Deploy
gcloud run deploy eventify-frontend \
    --image gcr.io/project-78b77615-0318-4252-b83/eventify-frontend \
    --region asia-southeast1 \
    --platform managed \
    --allow-unauthenticated \
    --port 3000 \
    --memory 1Gi \
    --cpu 1 \
    --min-instances 1 \
    --set-env-vars "NODE_ENV=production,NEXT_TELEMETRY_DISABLED=1,NEXT_PUBLIC_API_URL=$BACKEND_URL,NEXT_PUBLIC_GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID,NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=$MIDTRANS_CLIENT_KEY,NEXTAUTH_URL=https://fnb.eventku.co.id" \
    --set-secrets "NEXTAUTH_SECRET=nextauth-secret:latest"

# Get frontend URL
gcloud run services describe eventify-frontend --region=asia-southeast1 --format='value(status.url)'
```

---

## Step 10: Run Database Migrations

```bash
# Option A: Connect and run SQL
gcloud sql connect eventify-db --user=eventify_user --database=eventify < database/cloudsql-schema.sql

# Option B: Use Cloud SQL Proxy locally
# 1. Download proxy: https://cloud.google.com/sql/docs/mysql/sql-proxy
# 2. Run: ./cloud_sql_proxy -instances=project-78b77615-0318-4252-b83:asia-southeast1:eventify-db=tcp:5432
# 3. Connect: psql -h localhost -U eventify_user -d eventify -f database/cloudsql-schema.sql
```

---

## Step 11: Configure Google OAuth

1. Go to [Google Cloud Console > Credentials](https://console.cloud.google.com/apis/credentials)
2. Edit the OAuth 2.0 Client
3. Add authorized redirect URIs:
   ```
   https://YOUR_FRONTEND_URL/auth/callback
   ```
4. Save

---

## Step 12: Configure Custom Domain (Optional)

```bash
# Map custom domain to frontend
gcloud run domain-mappings create \
    --service eventify-frontend \
    --domain fnb.eventku.co.id \
    --region asia-southeast1

# Map custom domain to backend
gcloud run domain-mappings create \
    --service eventify-backend \
    --domain api.eventku.co.id \
    --region asia-southeast1

# Add DNS records shown in output to your domain registrar
```

---

## Quick Deploy with Script

For automated deployment, use the provided script:

```bash
# Set credentials as environment variables
export GOOGLE_CLIENT_ID="your-client-id"
export GOOGLE_CLIENT_SECRET="your-client-secret"
export MIDTRANS_MERCHANT_ID="your-merchant-id"
export MIDTRANS_SERVER_KEY="your-server-key"
export MIDTRANS_CLIENT_KEY="your-client-key"

# Run deployment script
chmod +x deploy-gcp-native.sh
./deploy-gcp-native.sh
```

---

## Quick Commands Reference

```bash
# View logs
gcloud logging read "resource.type=cloud_run_revision" --limit 50

# View service status
gcloud run services list --region=asia-southeast1

# Update environment variable
gcloud run services update eventify-backend --region=asia-southeast1 --set-env-vars "KEY=VALUE"

# Scale service
gcloud run services update eventify-backend --region=asia-southeast1 --min-instances 1 --max-instances 20
```

---

## Expected URLs After Deployment

| Service | URL Pattern |
|---------|-------------|
| Frontend | `https://eventify-frontend-XXXXX-uc.a.run.app` |
| Backend | `https://eventify-backend-XXXXX-uc.a.run.app` |

Replace `XXXXX` with a random hash assigned by Cloud Run.

---

## Troubleshooting

### Cloud SQL Connection Issues
```bash
# Check instance status
gcloud sql instances describe eventify-db

# Check service account permissions
gcloud projects get-iam-policy project-78b77615-0318-4252-b83
```

### Build Failures
```bash
# View build logs
gcloud builds list --limit 10
gcloud builds log BUILD_ID
```

### Service Not Starting
```bash
# View service logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=eventify-backend" --limit 100
```
