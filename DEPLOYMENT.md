# Deployment Guide

## Quick Deploy with Docker Compose

### Prerequisites
- Docker and Docker Compose installed
- Firebase credentials
- Google Gemini API key

### 1. Set Up Environment Variables

Create `.env` file in project root:

```bash
# Google Gemini API
GOOGLE_API_KEY=your_gemini_api_key

# Firebase Admin SDK (entire JSON as one line)
FIREBASE_CONFIG={"type":"service_account","project_id":"..."}
```

### 2. Build and Run

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### 3. Access Application

- **Frontend**: http://localhost
- **Backend API**: http://localhost:5000
- **API Health**: http://localhost:5000/api/health

---

## Production Deployment Options

### Option 1: Google Cloud Run (Recommended)

**Backend:**
```bash
cd backend

# Build and push to Google Container Registry
gcloud builds submit --tag gcr.io/PROJECT_ID/lit-rift-backend

# Deploy to Cloud Run
gcloud run deploy lit-rift-backend \
  --image gcr.io/PROJECT_ID/lit-rift-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars GOOGLE_API_KEY=your_key \
  --set-env-vars FIREBASE_CONFIG='{"type":"service_account",...}'
```

**Frontend:**
```bash
cd frontend

# Build
npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting
```

### Option 2: AWS (ECS + S3)

**Backend (ECS):**
```bash
# Build and push to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin ACCOUNT.dkr.ecr.us-east-1.amazonaws.com

docker build -t lit-rift-backend ./backend
docker tag lit-rift-backend:latest ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/lit-rift-backend:latest
docker push ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/lit-rift-backend:latest

# Deploy to ECS (use ECS Task Definition)
```

**Frontend (S3 + CloudFront):**
```bash
cd frontend
npm run build

# Deploy to S3
aws s3 sync build/ s3://lit-rift-frontend

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id DIST_ID --paths "/*"
```

### Option 3: Heroku

**Backend:**
```bash
cd backend

# Create Heroku app
heroku create lit-rift-backend

# Set environment variables
heroku config:set GOOGLE_API_KEY=your_key
heroku config:set FIREBASE_CONFIG='{"type":"service_account",...}'

# Deploy
git push heroku main
```

**Frontend:**
```bash
# Deploy to Netlify, Vercel, or Firebase Hosting
```

### Option 4: Kubernetes

**Apply manifests:**
```bash
kubectl apply -f kubernetes/namespace.yaml
kubectl apply -f kubernetes/backend-deployment.yaml
kubectl apply -f kubernetes/frontend-deployment.yaml
kubectl apply -f kubernetes/ingress.yaml
```

---

## Environment Configuration

### Backend Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GOOGLE_API_KEY` | Yes | Gemini AI API key |
| `FIREBASE_CONFIG` | Yes | Firebase Admin SDK JSON |
| `FLASK_ENV` | No | `production` or `development` |
| `PORT` | No | Server port (default: 5000) |

### Frontend Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `REACT_APP_API_URL` | Yes | Backend API URL |
| `REACT_APP_FIREBASE_API_KEY` | Yes | Firebase web API key |
| `REACT_APP_FIREBASE_AUTH_DOMAIN` | Yes | Firebase auth domain |
| `REACT_APP_FIREBASE_PROJECT_ID` | Yes | Firebase project ID |

---

## Health Checks

### Backend Health Check
```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "firebase": true,
  "gemini": true
}
```

### Frontend Health Check
```bash
curl http://localhost/
```

Should return the React app HTML.

---

## Monitoring

### Logs

**Docker Compose:**
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
```

**Google Cloud Run:**
```bash
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=lit-rift-backend"
```

### Metrics

Monitor:
- **Response times**: API latency
- **Error rates**: 4xx/5xx responses
- **AI usage**: Gemini API calls and costs
- **Database**: Firestore read/write operations

### Alerts

Set up alerts for:
- High error rates (>5%)
- Slow response times (>2s)
- API rate limit exceeded
- Service downtime

---

## Scaling

### Horizontal Scaling

**Docker Compose:**
```bash
docker-compose up --scale backend=3
```

**Kubernetes:**
```bash
kubectl scale deployment lit-rift-backend --replicas=5
```

### Vertical Scaling

Increase container resources in deployment configuration.

---

## Security Checklist

- [ ] HTTPS enabled
- [ ] CORS configured properly
- [ ] Rate limiting active
- [ ] Authentication required for sensitive endpoints
- [ ] Environment variables secured
- [ ] Database rules configured
- [ ] API keys rotated regularly
- [ ] Security headers set
- [ ] Input validation enabled
- [ ] Logs sanitized (no secrets)

---

## Backup & Recovery

### Database Backup (Firestore)

```bash
gcloud firestore export gs://BUCKET_NAME/backups/$(date +%Y%m%d)
```

### Restore
```bash
gcloud firestore import gs://BUCKET_NAME/backups/20250101
```

---

## Rollback

### Docker Compose
```bash
# Use previous image
docker-compose up -d backend:previous-tag
```

### Cloud Run
```bash
gcloud run services update-traffic lit-rift-backend \
  --to-revisions=REVISION-NAME=100
```

---

## Performance Optimization

### Backend
- Enable Gunicorn worker tuning
- Use Redis for caching
- Implement database connection pooling
- Optimize Firestore queries

### Frontend
- Enable CDN
- Implement code splitting
- Lazy load components
- Optimize images
- Enable caching headers

---

## Troubleshooting

### Backend won't start
- Check environment variables
- Verify Firebase credentials
- Check Gemini API key
- Review logs

### Frontend can't connect to backend
- Verify REACT_APP_API_URL
- Check CORS configuration
- Ensure backend is running
- Check network connectivity

### AI generation fails
- Verify Gemini API key
- Check API quotas
- Review rate limiting
- Check error logs

---

## Cost Optimization

### Gemini API
- Set request limits
- Implement caching
- Use appropriate model versions
- Monitor usage

### Firestore
- Optimize queries
- Use composite indexes
- Implement pagination
- Archive old data

### Hosting
- Use CDN for static assets
- Enable compression
- Implement caching
- Right-size containers

---

## Support

For deployment issues:
1. Check logs
2. Review health checks
3. Verify environment variables
4. Test locally with Docker Compose
5. Open GitHub issue if problem persists

---

**Production Ready!** 🚀
