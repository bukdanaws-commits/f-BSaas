#!/bin/bash

# ===========================================
# EVENTIFY - Quick Manual Deployment
# Deploy individual services manually
# ===========================================

set -e

PROJECT_ID="eventify-app"
REGION="asia-southeast1"
FRONTEND_SERVICE="eventify-frontend"
BACKEND_SERVICE="eventify-backend"

echo "Choose deployment option:"
echo "1) Deploy Backend only"
echo "2) Deploy Frontend only"
echo "3) Deploy Both"
read -p "Enter choice (1-3): " choice

case $choice in
    1)
        echo "Deploying Backend..."
        cd backend
        
        # Build
        gcloud builds submit --tag gcr.io/$PROJECT_ID/$BACKEND_SERVICE
        
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
            --set-secrets "DATABASE_URL=database-url:latest,JWT_SECRET=jwt-secret:latest"
        ;;
        
    2)
        echo "Deploying Frontend..."
        
        # Build
        gcloud builds submit --tag gcr.io/$PROJECT_ID/$FRONTEND_SERVICE
        
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
            --set-env-vars "NODE_ENV=production" \
            --set-secrets "NEXTAUTH_SECRET=nextauth-secret:latest"
        ;;
        
    3)
        echo "Deploying Both..."
        
        # Backend
        cd backend
        gcloud builds submit --tag gcr.io/$PROJECT_ID/$BACKEND_SERVICE
        gcloud run deploy $BACKEND_SERVICE \
            --image gcr.io/$PROJECT_ID/$BACKEND_SERVICE \
            --region $REGION \
            --platform managed \
            --allow-unauthenticated \
            --port 8080 \
            --memory 512Mi \
            --set-secrets "DATABASE_URL=database-url:latest,JWT_SECRET=jwt-secret:latest"
        cd ..
        
        # Frontend
        gcloud builds submit --tag gcr.io/$PROJECT_ID/$FRONTEND_SERVICE
        gcloud run deploy $FRONTEND_SERVICE \
            --image gcr.io/$PROJECT_ID/$FRONTEND_SERVICE \
            --region $REGION \
            --platform managed \
            --allow-unauthenticated \
            --port 3000 \
            --memory 1Gi \
            --set-env-vars "NODE_ENV=production" \
            --set-secrets "NEXTAUTH_SECRET=nextauth-secret:latest"
        ;;
        
    *)
        echo "Invalid choice"
        exit 1
        ;;
esac

echo "Deployment complete!"
