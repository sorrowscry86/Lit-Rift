# LitRift Phase 2 - Shipping Checklist

## Version: 1.0.0-offline-beta

---

## Pre-Deployment Checklist

### Code Complete

- [x] Phase 1: SQLite + Sync + Conflict Detection
- [x] Phase 2: Background Worker + Device ID + Real-time Notifications
- [ ] Code review completed
- [ ] Security audit completed
- [ ] Performance profiling done

### Testing

- [ ] ✅ Scenario 1: Same device no conflict
- [ ] ✅ Scenario 2: Multi-device conflict
- [ ] ✅ Scenario 3: Full offline → online
- [ ] ✅ Scenario 4: Conflict resolution
- [ ] ✅ Scenario 5: Device ID persistence
- [ ] ✅ Scenario 6: Background sync
- [ ] ✅ Scenario 7: WebSocket alerts
- [ ] ✅ Performance test (100 docs)
- [ ] ✅ Cross-platform testing (Windows/Linux/Mac)
- [ ] ✅ Load testing (concurrent users)
- [ ] ✅ Battery/memory impact testing

### Documentation

- [x] Phase 2 Testing Guide created
- [x] Frontend integration examples created
- [x] Editor integration examples created
- [ ] User guide: offline features
- [ ] Developer guide: architecture
- [ ] API documentation: updated
- [ ] Troubleshooting guide
- [ ] Video tutorial (optional)

### Dependencies

**Backend:**
- [x] flask-socketio==5.3.6
- [x] python-socketio==5.11.1
- [ ] All requirements.txt up to date
- [ ] No security vulnerabilities (run `pip audit`)

**Frontend:**
- [ ] socket.io-client@4.7.2 installed
- [ ] @types/socket.io-client@3.0.0 installed
- [ ] All package.json up to date
- [ ] No security vulnerabilities (run `npm audit`)

### DevOps

- [ ] Docker images updated (if applicable)
- [ ] Database migration scripts tested
- [ ] Rollback plan documented
- [ ] Monitoring alerts configured
- [ ] Error tracking configured (Sentry/etc)
- [ ] Backup procedures tested

---

## Deployment Steps

### Step 1: Pre-Deployment Backup

```bash
# Backup Firebase
gsutil -m cp -r gs://YOUR_BUCKET/* gs://YOUR_BUCKET_BACKUP/

# Backup SQLite databases (if centralized)
tar -czf litrift_sqlite_backup_$(date +%Y%m%d).tar.gz ~/.local/share/LitRift/
```

### Step 2: Install Frontend Dependencies

```bash
cd frontend

# Install socket.io-client
npm install socket.io-client@4.7.2
npm install --save-dev @types/socket.io-client@3.0.0

# Verify no vulnerabilities
npm audit fix

# Build for production
npm run build

# Test build
npm run preview
```

### Step 3: Install Backend Dependencies

```bash
cd backend

# Install new dependencies
pip install -r requirements.txt

# Verify no vulnerabilities
pip install safety
safety check

# Test imports
python -c "from flask_socketio import SocketIO; print('OK')"
```

### Step 4: Database Initialization

```bash
# Backend will auto-create SQLite database on first run
# Verify schema
python -c "from db.schema import DatabaseSchema; DatabaseSchema.init_database(); print('DB initialized')"
```

### Step 5: Deploy Backend

```bash
# Option A: Direct deployment
cd backend
python app.py

# Option B: Docker deployment
docker build -t litrift-backend:offline-beta -f Dockerfile.backend .
docker run -d -p 5000:5000 litrift-backend:offline-beta

# Option C: Gunicorn with SocketIO
gunicorn --worker-class eventlet -w 1 --bind 0.0.0.0:5000 app:app
```

### Step 6: Deploy Frontend

```bash
# Option A: Static hosting (Netlify/Vercel)
cd frontend
npm run build
# Deploy dist/ folder

# Option B: Docker deployment
docker build -t litrift-frontend:offline-beta -f Dockerfile.frontend .
docker run -d -p 3000:3000 litrift-frontend:offline-beta
```

### Step 7: Verify Deployment

```bash
# Health check
curl https://litrift.app/api/health

# Expected response:
{
  "status": "healthy",
  "firebase": true,
  "gemini": true,
  "sqlite": true,
  "device_id": "abc123...",
  "version": "1.0.0-offline-beta"
}

# Test WebSocket
curl -I -N \
  -H "Connection: Upgrade" \
  -H "Upgrade: websocket" \
  -H "Sec-WebSocket-Version: 13" \
  -H "Sec-WebSocket-Key: SGVsbG8sIHdvcmxkIQ==" \
  https://litrift.app/socket.io/
# Should return 101 Switching Protocols
```

### Step 8: Start Background Workers (if centralized)

```bash
# If running centralized workers
curl -X POST https://litrift.app/api/sync/start-worker \
  -H "X-User-ID: system" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### Step 9: Monitor Deployment

```bash
# Check logs
tail -f backend/logs/app.log | grep -E "(Background sync|Conflict|Error)"

# Monitor WebSocket connections
netstat -an | grep :5000 | grep ESTABLISHED | wc -l

# Monitor memory usage
ps aux | grep python | awk '{print $6}'
```

### Step 10: Announce to Users

**Email Template:**
```
Subject: LitRift v1.0 - Offline Mode is Here! 🎉

Hi [User],

We're excited to announce LitRift v1.0 with full offline support!

✨ New Features:
• Write offline, sync automatically when online
• Multi-device conflict resolution
• Real-time sync notifications
• No data loss, ever

🚀 What Changed:
• Background sync every 30 seconds
• Smart conflict detection
• Same-device edits never conflict

📖 Learn More:
https://litrift.app/docs/offline-mode

Questions? Reply to this email.

Happy writing!
The LitRift Team
```

---

## Rollback Plan

If critical issues arise:

### Emergency Rollback

```bash
# Stop new deployment
docker stop litrift-backend litrift-frontend

# Revert to previous version
git revert HEAD
git push origin main

# Rebuild and deploy previous version
docker build -t litrift-backend:stable .
docker run -d -p 5000:5000 litrift-backend:stable

# Notify users
# Post status update
```

### Database Rollback

```bash
# If SQLite schema issues
rm -f ~/.local/share/LitRift/litrift.db
# App will recreate on next start

# If Firebase issues
gsutil -m cp -r gs://YOUR_BUCKET_BACKUP/* gs://YOUR_BUCKET/
```

---

## Post-Deployment Monitoring

### Success Metrics (First 48 Hours)

- [ ] Zero crash reports
- [ ] < 1% error rate on /api/sync/* endpoints
- [ ] Average sync time < 2 seconds
- [ ] WebSocket reconnect rate < 5%
- [ ] User adoption rate > 50%
- [ ] Positive user feedback > 80%

### Metrics to Track

```sql
-- SQLite queries for monitoring

-- Total documents synced
SELECT COUNT(*) FROM documents WHERE is_synced = 1;

-- Pending sync queue size
SELECT COUNT(*) FROM sync_queue;

-- Conflict rate
SELECT COUNT(*) FROM sync_conflicts WHERE status = 'pending';

-- Device distribution
SELECT COUNT(DISTINCT device_id) FROM documents;

-- Average document size
SELECT AVG(LENGTH(content)) FROM documents;
```

### Logging Checklist

- [ ] Background sync events logged
- [ ] Conflict events logged
- [ ] WebSocket connections logged
- [ ] Error rates logged
- [ ] Performance metrics logged

### Alerts to Configure

1. **Critical Alerts (Page immediately):**
   - Error rate > 5%
   - Background worker crashed
   - Database connection lost
   - Memory usage > 1GB

2. **Warning Alerts (Email/Slack):**
   - Sync queue size > 1000
   - Conflict rate > 10%
   - WebSocket reconnect rate > 10%
   - Average sync time > 5 seconds

3. **Info Alerts (Dashboard):**
   - New devices registered
   - Total documents synced
   - Active background workers

---

## Known Issues & Workarounds

### Issue 1: Socket.IO CORS in Production

**Problem:** WebSocket connection fails due to CORS

**Workaround:**
```python
# app.py
socketio = SocketIO(app, cors_allowed_origins=["https://litrift.app"])
```

### Issue 2: Background Worker Memory Leak

**Problem:** Worker memory grows over time

**Workaround:** Restart workers daily
```bash
# Cron job: restart at 3 AM
0 3 * * * docker restart litrift-backend
```

### Issue 3: Large Documents Slow Sync

**Problem:** Documents > 5MB take > 10 seconds

**Workaround:** Implement chunked sync (future enhancement)

---

## Post-Launch Tasks

### Week 1

- [ ] Monitor error rates
- [ ] Collect user feedback
- [ ] Fix critical bugs
- [ ] Update documentation based on feedback

### Week 2

- [ ] Analyze sync patterns
- [ ] Optimize slow queries
- [ ] Add more telemetry
- [ ] Create user tutorial video

### Week 3

- [ ] Plan next features (Tauri launcher, Ollama support)
- [ ] Refactor based on learnings
- [ ] Improve error messages
- [ ] Add more unit tests

### Week 4

- [ ] Security audit
- [ ] Performance tuning
- [ ] Scale testing (1000+ concurrent users)
- [ ] Plan v1.1 features

---

## Success Indicators

✅ **MVP is successful if:**

1. Users can write offline without issues
2. Conflicts are rare (< 5% of syncs)
3. Conflict UI is clear and easy to use
4. Zero data loss reports
5. App startup < 2 seconds
6. Memory usage < 200MB per user
7. Battery impact < 5% (mobile devices)
8. Positive user sentiment > 80%
9. Sync reliability > 99.9%
10. Background worker uptime > 99.5%

---

## What's Next (v1.1 Roadmap)

1. **Tauri Desktop Launcher** - Native .exe installer
2. **Ollama/LM Studio Integration** - Offline AI support
3. **P2P Sync** - Direct device-to-device sync
4. **Encrypted Sync** - E2E encryption for sensitive content
5. **Conflict Merge Tools** - Visual diff/merge instead of choose
6. **Offline AI Features** - Local grammar check, autocomplete
7. **Multi-user Collaboration** - Real-time co-editing
8. **Version History** - Time travel through document changes

---

## Final Pre-Launch Checklist

- [ ] All tests pass
- [ ] Documentation complete
- [ ] Dependencies installed
- [ ] Backups created
- [ ] Rollback plan ready
- [ ] Monitoring configured
- [ ] Team briefed
- [ ] Support ready
- [ ] Announcement drafted
- [ ] Celebration planned 🎉

---

**Date Deployed:** __________________

**Deployed By:** __________________

**Version:** 1.0.0-offline-beta

**Git Commit:** __________________

**Status:** [ ] Success [ ] Rollback Required

**Notes:**
______________________________________________________
______________________________________________________
______________________________________________________
