# EVENTIFY - GCP Deployment Guide

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        GOOGLE CLOUD PLATFORM                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────┐     ┌──────────────────┐     ┌──────────────────┐ │
│  │ Cloud DNS    │────▶│ Load Balancer    │────▶│ Cloud Run        │ │
│  │ (Domain)     │     │ (HTTPS/SSL Auto) │     │                  │ │
│  └──────────────┘     └──────────────────┘     │  ┌────────────┐  │ │
│                                                │  │ Frontend   │  │ │
│                                                │  │ (Next.js)  │  │ │
│                                                │  │ Port: 3000 │  │ │
│                                                │  └────────────┘  │ │
│                                                │         │        │ │
│                                                │         ▼        │ │
│                                                │  ┌────────────┐  │ │
│                                                │  │ Backend    │  │ │
│                                                │  │ (Golang)   │  │ │
│                                                │  │ Port: 8080 │  │ │
│                                                │  └────────────┘  │ │
│                                                └─────────┬────────┘ │
│                                                          │          │
│                                                          ▼          │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │              Supabase PostgreSQL (External)                  │   │
│  │         OR Cloud SQL (Managed PostgreSQL)                    │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  Supporting Services:                                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │
│  │ Secret       │  │ Cloud Build  │  │ Container Registry       │  │
│  │ Manager      │  │ (CI/CD)      │  │ (GCR)                    │  │
│  └──────────────┘  └──────────────┘  └──────────────────────────┘  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Prerequisites

1. **GCP Account** with billing enabled
2. **gcloud CLI** installed
3. **GitHub repository** connected
4. **Domain name** (optional, for custom domain)

---

## Step 1: Setup GCP Project

```bash
# Install gcloud CLI (if not installed)
# macOS:
brew install google-cloud-sdk

# Linux:
curl https://sdk.cloud.google.com | bash
exec -l $SHELL

# Login to GCP
gcloud auth login

# Create new project
gcloud projects create eventify-app --name="EVENTIFY"
gcloud config set project eventify-app

# Link billing account (required)
gcloud beta billing projects link eventify-app --billing-account=BILLING_ACCOUNT_ID

# Enable required APIs
gcloud services enable \
    run.googleapis.com \
    cloudbuild.googleapis.com \
    containerregistry.googleapis.com \
    secretmanager.googleapis.com \
    artifactregistry.googleapis.com
```

---

## Step 2: Configure Secrets

Store sensitive data in Secret Manager:

```bash
# Create secrets
echo -n "postgresql://postgres:password@db.xxx.supabase.co:5432/postgres" | \
    gcloud secrets create database-url --data-file=-

echo -n "your-jwt-secret-key-min-32-characters" | \
    gcloud secrets create jwt-secret --data-file=-

echo -n "your-google-client-id.apps.googleusercontent.com" | \
    gcloud secrets create google-client-id --data-file=-

echo -n "your-google-client-secret" | \
    gcloud secrets create google-client-secret --data-file=-

echo -n "your-midtrans-server-key" | \
    gcloud secrets create midtrans-server-key --data-file=-

echo -n "your-nextauth-secret-min-32-chars" | \
    gcloud secrets create nextauth-secret --data-file=-
```

---

## Step 3: Deploy Using Cloud Build

### Option A: Automated Deployment (Recommended)

```bash
# Submit to Cloud Build
gcloud builds submit --config cloudbuild.yaml \
    --substitutions=_REGION=asia-southeast1 \
    .
```

### Option B: Manual Deployment

```bash
# Make scripts executable
chmod +x deploy-gcp.sh deploy-gcp-manual.sh

# Run deployment
./deploy-gcp-manual.sh
```

### Option C: Step-by-Step Manual

```bash
# Set variables
PROJECT_ID="eventify-app"
REGION="asia-southeast1"

# ===========================================
# DEPLOY BACKEND
# ===========================================

# Build and push backend
cd backend
gcloud builds submit --tag gcr.io/$PROJECT_ID/eventify-backend

# Deploy backend to Cloud Run
gcloud run deploy eventify-backend \
    --image gcr.io/$PROJECT_ID/eventify-backend \
    --region $REGION \
    --platform managed \
    --allow-unauthenticated \
    --port 8080 \
    --memory 512Mi \
    --cpu 1 \
    --min-instances 1 \
    --max-instances 10 \
    --set-secrets "DATABASE_URL=database-url:latest,JWT_SECRET=jwt-secret:latest"

# Get backend URL
BACKEND_URL=$(gcloud run services describe eventify-backend --region=$REGION --format='value(status.url)')
echo "Backend URL: $BACKEND_URL"

cd ..

# ===========================================
# DEPLOY FRONTEND
# ===========================================

# Build and push frontend
gcloud builds submit --tag gcr.io/$PROJECT_ID/eventify-frontend

# Deploy frontend to Cloud Run
gcloud run deploy eventify-frontend \
    --image gcr.io/$PROJECT_ID/eventify-frontend \
    --region $REGION \
    --platform managed \
    --allow-unauthenticated \
    --port 3000 \
    --memory 1Gi \
    --cpu 1 \
    --min-instances 1 \
    --max-instances 10 \
    --set-env-vars "NODE_ENV=production,NEXT_PUBLIC_API_URL=$BACKEND_URL" \
    --set-secrets "NEXTAUTH_SECRET=nextauth-secret:latest"

# Get frontend URL
FRONTEND_URL=$(gcloud run services describe eventify-frontend --region=$REGION --format='value(status.url)')
echo "Frontend URL: $FRONTEND_URL"
```

---

## Step 4: Configure Custom Domain (Optional)

### Map Domain to Cloud Run

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
```

### Add DNS Records

GCP will provide DNS records to add to your domain registrar:

```
# For fnb.eventku.co.id
A     216.239.32.21
A     216.239.34.21
A     216.239.36.21
A     216.239.38.21

# For api.eventku.co.id
A     216.239.32.21
A     216.239.34.21
A     216.239.36.21
A     216.239.38.21
```

---

## Step 5: Setup CI/CD with GitHub

### Create Cloud Build Trigger

```bash
# Connect GitHub repository
gcloud builds connections create github \
    --region=us-central1 \
    --name=github-connection

# Create trigger for master branch
gcloud builds triggers create github \
    --name="deploy-on-push" \
    --region=us-central1 \
    --repo-name="f-BSaas" \
    --repo-owner="bukdanaws-commits" \
    --branch-pattern="^master$" \
    --build-config="cloudbuild.yaml"
```

### Or via GCP Console:

1. Go to **Cloud Build > Triggers**
2. Click **Create Trigger**
3. Select **GitHub** as source
4. Authenticate and select repository: `bukdanaws-commits/f-BSaas`
5. Set branch: `^master$`
6. Build configuration: `cloudbuild.yaml`

---

## Environment Variables Reference

### Backend (.env)

| Variable | Description | Source |
|----------|-------------|--------|
| DATABASE_URL | PostgreSQL connection string | Secret Manager |
| JWT_SECRET | JWT signing key | Secret Manager |
| GOOGLE_CLIENT_ID | Google OAuth Client ID | Secret Manager |
| GOOGLE_CLIENT_SECRET | Google OAuth Secret | Secret Manager |
| SERVER_PORT | Server port (8080) | Default |
| FRONTEND_URL | Frontend URL for CORS | Environment |
| USE_SUPABASE | Use Supabase (true/false) | Environment |
| MIDTRANS_SERVER_KEY | Midtrans Server Key | Secret Manager |
| MIDTRANS_CLIENT_KEY | Midtrans Client Key | Environment |

### Frontend

| Variable | Description | Source |
|----------|-------------|--------|
| NEXT_PUBLIC_API_URL | Backend API URL | Environment |
| NEXT_PUBLIC_SUPABASE_URL | Supabase URL | Environment |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Supabase Anon Key | Environment |
| NEXT_PUBLIC_MIDTRANS_CLIENT_KEY | Midtrans Client Key | Environment |
| NEXTAUTH_SECRET | NextAuth Secret | Secret Manager |
| NEXTAUTH_URL | Frontend URL | Environment |

---

## Monitoring & Logging

### View Logs

```bash
# Frontend logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=eventify-frontend" --limit 50

# Backend logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=eventify-backend" --limit 50
```

### Cloud Monitoring Dashboard

1. Go to **Cloud Run** in GCP Console
2. Click on service name
3. View **Metrics** tab for:
   - Request count
   - Latency
   - Memory usage
   - CPU utilization

---

## Scaling Configuration

### Frontend

```bash
gcloud run services update eventify-frontend \
    --region asia-southeast1 \
    --min-instances 1 \
    --max-instances 10 \
    --memory 1Gi \
    --cpu 1
```

### Backend

```bash
gcloud run services update eventify-backend \
    --region asia-southeast1 \
    --min-instances 1 \
    --max-instances 20 \
    --memory 512Mi \
    --cpu 1
```

---

## Cost Estimation (Monthly)

| Service | Configuration | Estimated Cost |
|---------|--------------|----------------|
| Cloud Run (Frontend) | 1Gi RAM, 1 CPU | $10-30 |
| Cloud Run (Backend) | 512Mi RAM, 1 CPU | $10-20 |
| Cloud Build | ~50 builds/month | $0-5 |
| Container Registry | ~5GB storage | $0.50 |
| Secret Manager | 6 secrets | $0.06 |
| Network Egress | ~50GB | $5-10 |
| **Total** | | **$25-65/month** |

---

## Troubleshooting

### Common Issues

**1. Build fails - memory limit**
```bash
# Increase build machine type
gcloud builds submit --machine-type=E2_HIGHCPU_8 --config cloudbuild.yaml .
```

**2. Cloud Run service unhealthy**
```bash
# Check logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=eventify-backend" --limit 100

# Check service status
gcloud run services describe eventify-backend --region=asia-southeast1
```

**3. Database connection issues**
```bash
# Verify secret value
gcloud secrets versions access latest --secret=database-url

# Test connection from Cloud Shell
psql "postgresql://postgres:password@db.xxx.supabase.co:5432/postgres"
```

**4. CORS errors**
```bash
# Update backend with correct FRONTEND_URL
gcloud run services update eventify-backend \
    --region asia-southeast1 \
    --set-env-vars "FRONTEND_URL=https://fnb.eventku.co.id"
```

---

## Useful Commands

```bash
# List all services
gcloud run services list --region=asia-southeast1

# Delete service
gcloud run services delete eventify-frontend --region=asia-southeast1

# Update single environment variable
gcloud run services update eventify-backend \
    --region asia-southeast1 \
    --set-env-vars "KEY=VALUE"

# Update multiple env vars
gcloud run services update eventify-backend \
    --region asia-southeast1 \
    --set-env-vars "KEY1=VALUE1,KEY2=VALUE2"

# Add new secret
gcloud run services update eventify-backend \
    --region asia-southeast1 \
    --set-secrets "NEW_SECRET=new-secret:latest"

# SSH into container (for debugging)
gcloud run services update eventify-backend \
    --region asia-southeast1 \
    --command="/bin/sh"
```

---

## Quick Reference

| Task | Command |
|------|---------|
| Deploy Backend | `cd backend && gcloud builds submit --tag gcr.io/$PROJECT_ID/eventify-backend && gcloud run deploy eventify-backend --image gcr.io/$PROJECT_ID/eventify-backend --region asia-southeast1` |
| Deploy Frontend | `gcloud builds submit --tag gcr.io/$PROJECT_ID/eventify-frontend && gcloud run deploy eventify-frontend --image gcr.io/$PROJECT_ID/eventify-frontend --region asia-southeast1` |
| View Logs | `gcloud logging read "resource.type=cloud_run_revision" --limit 50` |
| List Services | `gcloud run services list --region=asia-southeast1` |
| Update Secrets | `echo -n "new-value" \| gcloud secrets versions add secret-name --data-file=-` |
