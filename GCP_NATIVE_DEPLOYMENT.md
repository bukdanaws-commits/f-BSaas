# EVENTIFY - GCP Native Deployment Guide

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         GCP NATIVE ARCHITECTURE                                  │
│                         (No Supabase Dependencies)                               │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌────────────────────────────────────────────────────────────────────────────┐ │
│  │                         GOOGLE CLOUD PLATFORM                               │ │
│  │                         Region: asia-southeast1 (Singapore)                 │ │
│  ├────────────────────────────────────────────────────────────────────────────┤ │
│  │                                                                             │ │
│  │   ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────────┐  │ │
│  │   │   Cloud DNS     │────▶│  Load Balancer  │────▶│    Cloud Run        │  │ │
│  │   │   (Domain)      │     │  (HTTPS/SSL)    │     │                     │  │ │
│  │   └─────────────────┘     └─────────────────┘     │  ┌───────────────┐  │  │ │
│  │                                                   │  │   Frontend    │  │  │ │
│  │                                                   │  │   (Next.js)   │  │  │ │
│  │                                                   │  │   Port: 3000  │  │  │ │
│  │                                                   │  └───────────────┘  │  │ │
│  │                                                   │         │           │  │ │
│  │                                                   │         ▼           │  │ │
│  │                                                   │  ┌───────────────┐  │  │ │
│  │                                                   │  │   Backend     │  │  │ │
│  │                                                   │  │   (Golang)    │  │  │ │
│  │                                                   │  │   Port: 8080  │  │  │ │
│  │                                                   │  └───────┬───────┘  │  │ │
│  │                                                   └──────────│──────────┘  │ │
│  │                                                              │             │ │
│  │   ┌──────────────────────────────────────────────────────────┼─────────────┐ │ │
│  │   │                                                          │             │ │
│  │   │   ┌──────────────────────┐    ┌──────────────────────┐   │             │ │
│  │   │   │      Cloud SQL       │    │    Cloud Storage     │   │             │ │
│  │   │   │     (PostgreSQL)     │    │       (GCS)          │   │             │ │
│  │   │   │                      │    │                      │   │             │ │
│  │   │   │  Instance: db-f1     │    │  Bucket: uploads     │   │             │ │
│  │   │   │  Storage: 10GB SSD   │    │  Public Read         │   │             │ │
│  │   │   │  Auto-backup: Yes    │    │                      │   │             │ │
│  │   │   │                      │    │                      │◀──┘             │ │
│  │   │   │  Cost: ~$7/month     │    │  Cost: ~$1-3/month   │                 │ │
│  │   │   └──────────────────────┘    └──────────────────────┘                 │ │
│  │   │                                                                          │ │
│  │   └──────────────────────────────────────────────────────────────────────────┘ │
│  │                                                                                │ │
│  │   ┌──────────────────────┐    ┌──────────────────────┐                        │ │
│  │   │   Secret Manager     │    │    Cloud Build       │                        │ │
│  │   │   (6 secrets)        │    │    (CI/CD)           │                        │ │
│  │   │   Cost: ~$0.10/month │    │                      │                        │ │
│  │   └──────────────────────┘    └──────────────────────┘                        │ │
│  │                                                                                │ │
│  └────────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                  │
│  EXTERNAL SERVICES:                                                              │
│  ┌─────────────────┐    ┌─────────────────┐                                      │
│  │  Google OAuth   │    │    Midtrans     │                                      │
│  │  (Auth)         │    │   (Payment)     │                                      │
│  │  FREE           │    │  Pay per use    │                                      │
│  └─────────────────┘    └─────────────────┘                                      │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Cost Breakdown (Monthly)

| Service | Configuration | Cost |
|---------|--------------|------|
| Cloud Run (Frontend) | 1Gi RAM, 1 CPU | $5-15 |
| Cloud Run (Backend) | 512Mi RAM, 1 CPU | $5-15 |
| Cloud SQL | db-f1-micro, 10GB | $7-10 |
| Cloud Storage | 10GB, public read | $1-3 |
| Secret Manager | 6 secrets | $0.10 |
| Cloud DNS | 1 zone | $0.50 |
| Network Egress | ~20GB | $2-5 |
| **TOTAL** | | **$20-50/month** |

---

## Prerequisites

1. **GCP Account** with billing enabled
2. **Domain name** (optional, for custom domain)
3. **Google OAuth credentials** from Google Cloud Console
4. **Midtrans account** for payments

---

## Step 1: Setup GCP Project

```bash
# Install gcloud CLI
# macOS:
brew install google-cloud-sdk

# Login
gcloud auth login

# Create project
gcloud projects create eventify-app --name="EVENTIFY"
gcloud config set project eventify-app

# Link billing account
gcloud beta billing projects link eventify-app --billing-account=YOUR_BILLING_ACCOUNT_ID

# Enable APIs
gcloud services enable \
    run.googleapis.com \
    cloudbuild.googleapis.com \
    sqladmin.googleapis.com \
    secretmanager.googleapis.com \
    artifactregistry.googleapis.com \
    compute.googleapis.com
```

---

## Step 2: Create Cloud SQL Instance

```bash
# Create instance
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

# Create user
gcloud sql users create eventify_user \
    --instance=eventify-db \
    --password=YOUR_SECURE_PASSWORD

# Get connection name
gcloud sql instances describe eventify-db --format='value(connectionName)'
# Output: project-id:asia-southeast1:eventify-db
```

---

## Step 3: Create GCS Bucket

```bash
# Create bucket
gsutil mb -l asia-southeast1 gs://eventify-uploads

# Make public (for public file access)
gsutil iam ch allUsers:objectViewer gs://eventify-uploads

# Set CORS (optional, for direct uploads)
cat > cors.json << 'EOF'
[
  {
    "origin": ["*"],
    "method": ["GET", "HEAD", "PUT", "POST"],
    "responseHeader": ["Content-Type", "Access-Control-Allow-Origin"],
    "maxAgeSeconds": 3600
  }
]
EOF
gsutil cors set cors.json gs://eventify-uploads
```

---

## Step 4: Setup Secrets

```bash
# Database URL
echo -n "postgres://eventify_user:YOUR_PASSWORD@/eventify?host=/cloudsql/project-id:asia-southeast1:eventify-db" | \
    gcloud secrets create database-url --data-file=-

# JWT Secret (generate: openssl rand -base64 32)
echo -n "your-jwt-secret-here" | gcloud secrets create jwt-secret --data-file=-

# Google OAuth
echo -n "your-client-id.apps.googleusercontent.com" | \
    gcloud secrets create google-client-id --data-file=-
echo -n "your-client-secret" | gcloud secrets create google-client-secret --data-file=-

# Midtrans
echo -n "your-midtrans-server-key" | gcloud secrets create midtrans-server-key --data-file=-

# NextAuth
echo -n "your-nextauth-secret" | gcloud secrets create nextauth-secret --data-file=-
```

---

## Step 5: Grant Permissions

```bash
# Get Cloud Run service account
PROJECT_NUMBER=$(gcloud projects describe eventify-app --format='value(projectNumber)')
SERVICE_ACCOUNT=$PROJECT_NUMBER-compute@developer.gserviceaccount.com

# Grant Cloud SQL access
gcloud projects add-iam-policy-binding eventify-app \
    --member="serviceAccount:$SERVICE_ACCOUNT" \
    --role="roles/cloudsql.client"

# Grant Secret Manager access
gcloud projects add-iam-policy-binding eventify-app \
    --member="serviceAccount:$SERVICE_ACCOUNT" \
    --role="roles/secretmanager.secretAccessor"

# Grant Storage access
gcloud projects add-iam-policy-binding eventify-app \
    --member="serviceAccount:$SERVICE_ACCOUNT" \
    --role="roles/storage.objectAdmin"
```

---

## Step 6: Deploy

### Option A: Automated with Cloud Build

```bash
gcloud builds submit --config cloudbuild-gcp-native.yaml \
    --substitutions=_REGION=asia-southeast1 \
    .
```

### Option B: Manual Deployment

```bash
# ==========================================
# DEPLOY BACKEND
# ==========================================

cd backend

# Build and push
gcloud builds submit --tag gcr.io/eventify-app/eventify-backend

# Deploy to Cloud Run with Cloud SQL connection
gcloud run deploy eventify-backend \
    --image gcr.io/eventify-app/eventify-backend \
    --region asia-southeast1 \
    --platform managed \
    --allow-unauthenticated \
    --port 8080 \
    --memory 512Mi \
    --cpu 1 \
    --min-instances 1 \
    --set-env-vars "STORAGE_TYPE=gcs,GCS_BUCKET_NAME=eventify-uploads,GCP_PROJECT_ID=eventify-app" \
    --set-secrets "DATABASE_URL=database-url:latest,JWT_SECRET=jwt-secret:latest,GOOGLE_CLIENT_ID=google-client-id:latest,GOOGLE_CLIENT_SECRET=google-client-secret:latest" \
    --add-cloudsql-instances eventify-app:asia-southeast1:eventify-db

cd ..

# ==========================================
# DEPLOY FRONTEND
# ==========================================

# Build and push
gcloud builds submit --tag gcr.io/eventify-app/eventify-frontend

# Get backend URL
BACKEND_URL=$(gcloud run services describe eventify-backend --region=asia-southeast1 --format='value(status.url)')

# Deploy frontend
gcloud run deploy eventify-frontend \
    --image gcr.io/eventify-app/eventify-frontend \
    --region asia-southeast1 \
    --platform managed \
    --allow-unauthenticated \
    --port 3000 \
    --memory 1Gi \
    --cpu 1 \
    --min-instances 1 \
    --set-env-vars "NODE_ENV=production,NEXT_PUBLIC_API_URL=$BACKEND_URL" \
    --set-secrets "NEXTAUTH_SECRET=nextauth-secret:latest"
```

---

## Step 7: Configure Custom Domain (Optional)

```bash
# Map frontend domain
gcloud run domain-mappings create \
    --service eventify-frontend \
    --domain fnb.eventku.co.id \
    --region asia-southeast1

# Map backend API domain
gcloud run domain-mappings create \
    --service eventify-backend \
    --domain api.eventku.co.id \
    --region asia-southeast1

# Add DNS records shown in output to your domain registrar
```

---

## Environment Variables Reference

### Backend

| Variable | Description | Source |
|----------|-------------|--------|
| DATABASE_URL | Cloud SQL connection string | Secret Manager |
| JWT_SECRET | JWT signing key | Secret Manager |
| GOOGLE_CLIENT_ID | Google OAuth Client ID | Secret Manager |
| GOOGLE_CLIENT_SECRET | Google OAuth Secret | Secret Manager |
| STORAGE_TYPE | Storage type (gcs/local) | Environment |
| GCS_BUCKET_NAME | GCS bucket name | Environment |
| GCP_PROJECT_ID | GCP Project ID | Environment |
| MIDTRANS_SERVER_KEY | Midtrans Server Key | Secret Manager |
| MIDTRANS_CLIENT_KEY | Midtrans Client Key | Environment |
| FRONTEND_URL | Frontend URL | Environment |

### Frontend

| Variable | Description | Source |
|----------|-------------|--------|
| NEXT_PUBLIC_API_URL | Backend API URL | Environment |
| NEXT_PUBLIC_GOOGLE_CLIENT_ID | Google OAuth Client ID | Environment |
| NEXTAUTH_SECRET | NextAuth secret | Secret Manager |
| NEXTAUTH_URL | Frontend URL | Environment |
| NEXT_PUBLIC_MIDTRANS_CLIENT_KEY | Midtrans Client Key | Environment |

---

## Database Migration

Run migrations after first deployment:

```bash
# Connect to Cloud SQL
gcloud sql connect eventify-db --user=eventify_user --database=eventify

# Or use Cloud SQL Proxy locally
./cloud_sql_proxy -instances=eventify-app:asia-southeast1:eventify-db=tcp:5432

# Run migrations
psql -h localhost -U eventify_user -d eventify -f supabase/COMPLETE_SCHEMA.sql
```

---

## Monitoring

```bash
# View logs
gcloud logging read "resource.type=cloud_run_revision" --limit 50

# View Cloud SQL logs
gcloud logging read "resource.type=cloudsql_database" --limit 50

# View metrics
gcloud monitoring dashboards list
```

---

## Troubleshooting

### Cloud SQL Connection Issues

```bash
# Check instance status
gcloud sql instances describe eventify-db

# Check service account permissions
gcloud projects get-iam-policy eventify-app

# Test connection from Cloud Run
# Add to backend: health check with DB ping
```

### GCS Upload Issues

```bash
# Check bucket permissions
gsutil iam get gs://eventify-uploads

# Check service account
gcloud projects get-iam-policy eventify-app \
    --filter="bindings.members:$SERVICE_ACCOUNT"
```

### Cloud Run Errors

```bash
# View recent logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=eventify-backend" --limit 100

# Check service configuration
gcloud run services describe eventify-backend --region=asia-southeast1
```

---

## Scaling

```bash
# Scale backend
gcloud run services update eventify-backend \
    --region asia-southeast1 \
    --min-instances 1 \
    --max-instances 20 \
    --memory 1Gi \
    --cpu 2

# Scale database (requires recreation)
gcloud sql instances patch eventify-db --tier=db-g1-small
```

---

## Backup & Recovery

```bash
# Create on-demand backup
gcloud sql backups create --instance=eventify-db

# List backups
gcloud sql backups list --instance=eventify-db

# Restore from backup
gcloud sql backups restore BACKUP_ID --restore-instance=eventify-db
```

---

## Quick Reference

| Task | Command |
|------|---------|
| Deploy all | `gcloud builds submit --config cloudbuild-gcp-native.yaml .` |
| View logs | `gcloud logging read "resource.type=cloud_run_revision" --limit 50` |
| Connect to DB | `gcloud sql connect eventify-db --user=eventify_user` |
| Update secret | `echo -n "new-value" \| gcloud secrets versions add secret-name --data-file=-` |
| Scale service | `gcloud run services update SERVICE --min-instances N --max-instances M` |
