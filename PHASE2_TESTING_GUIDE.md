# LitRift Phase 2 - Testing Guide

## Test Scenarios for Offline-First Sync

### Scenario 1: Same Device Restart (No Conflict)

**Goal:** Verify same device doesn't trigger false conflicts

**Steps:**
1. Open LitRift on Device A
2. Create document "Chapter 5" and edit content
3. Close app completely
4. Reopen app on same device
5. Edit "Chapter 5" again
6. Verify no conflict modal appears

**Expected Result:**
- ✅ Document syncs automatically
- ✅ No conflict modal
- ✅ Status shows "Synced"

**Command to verify:**
```bash
curl http://localhost:5000/api/sync/status \
  -H "X-User-ID: testuser"

# Should show: "conflict_count": 0
```

---

### Scenario 2: Multi-Device Conflict

**Goal:** Verify different devices trigger conflict UI

**Steps:**
1. Device A (laptop): Create and sync "Chapter 5"
2. Device B (desktop): Open same "Chapter 5"
3. Device A: Go offline, edit "Chapter 5"
4. Device B: Edit "Chapter 5" online
5. Device A: Go online

**Expected Result:**
- ✅ Conflict modal appears on Device A
- ✅ Shows both versions side-by-side
- ✅ User can choose "Keep My Version" or "Use Latest Version"
- ✅ After resolution, document syncs

**Simulate with CLI:**
```bash
# Device A creates doc
curl -X POST http://localhost:5000/api/sync/push \
  -H "X-User-ID: user1" \
  -H "Content-Type: application/json" \
  -d '{"documents": [{"doc_id": "ch5", "content": "Device A version", "title": "Chapter 5"}]}'

# Simulate Device B edit (manual Firebase update)
# Then Device A sync will detect conflict

curl -X POST http://localhost:5000/api/sync/full-sync \
  -H "X-User-ID: user1"
```

---

### Scenario 3: Full Offline → Online Flow

**Goal:** Write multiple docs offline, sync seamlessly online

**Steps:**
1. Disable internet
2. Write to 5 different documents
3. Close app
4. Reopen app (still offline)
5. Edit 2 more documents
6. Enable internet
7. Wait 30 seconds (background sync runs)

**Expected Result:**
- ✅ All 7 documents synced
- ✅ Zero conflicts
- ✅ Status shows "Synced"

**Verify in backend logs:**
```
INFO - Background sync complete: 7 synced, 0 conflicts, 0 errors
```

---

### Scenario 4: Conflict Resolution

**Goal:** User can resolve conflicts via UI

**Steps:**
1. Create conflict (use Scenario 2)
2. Conflict modal appears
3. Review both versions
4. Click "Keep My Version"

**Expected Result:**
- ✅ Local version pushed to cloud
- ✅ Conflict marked as resolved in DB
- ✅ Modal closes
- ✅ Status shows "Synced"

**API Verification:**
```bash
# Check conflicts
curl http://localhost:5000/api/sync/conflicts \
  -H "X-User-ID: testuser"

# Resolve conflict
curl -X POST http://localhost:5000/api/sync/resolve-conflict \
  -H "X-User-ID: testuser" \
  -H "Content-Type: application/json" \
  -d '{"conflict_id": 1, "choice": "local"}'
```

---

### Scenario 5: Device ID Persistence

**Goal:** Same device ID across restarts

**Steps:**
1. Start app
2. Check device ID in logs or API
3. Note device ID (e.g., "abc123...")
4. Close app
5. Delete `device_info.json` (but NOT `device_id.txt`)
6. Reopen app
7. Check device ID again

**Expected Result:**
- ✅ Same device ID after restart
- ✅ File exists at:
  - Windows: `%APPDATA%\LitRift\device_id.txt`
  - Linux/Mac: `~/.local/share/LitRift/device_id.txt`

**Check device ID:**
```bash
curl http://localhost:5000/api/health | jq '.device_id'
```

---

### Scenario 6: Background Sync Auto-Detection

**Goal:** Background worker syncs every 30 seconds

**Steps:**
1. Open LitRift + Developer Console
2. Go offline
3. Edit document
4. Go online
5. Watch console for "Background sync complete" messages

**Expected Result:**
- ✅ Sync happens within 30 seconds
- ✅ No manual action needed
- ✅ UI updates automatically

**Backend logs should show:**
```
INFO - Background sync worker started (interval: 30s)
DEBUG - Offline check...
INFO - Starting background sync: 1 pending documents
DEBUG - Synced document: doc1 (pushed_to_cloud)
INFO - Background sync complete: 1 synced, 0 conflicts, 0 errors
```

---

### Scenario 7: WebSocket Real-Time Conflict Alert

**Goal:** Conflict shows in real-time via WebSocket

**Setup:**
1. Have Device A and Device B both running LitRift
2. Both devices connected to WebSocket

**Steps:**
1. Edit same doc on both devices
2. Device B saves first (syncs to cloud)
3. Device A tries to sync

**Expected Result:**
- ✅ Device A receives WebSocket event instantly
- ✅ Conflict modal appears within 1 second
- ✅ No page refresh needed

**Check WebSocket connection:**
```javascript
// In browser console
window.io && console.log('Socket.IO connected')
```

---

## Performance Tests

### Test 1: Large Document Sync

**Goal:** Verify app doesn't freeze with large content

**Steps:**
1. Create document with 100,000 characters
2. Save document
3. Monitor UI responsiveness

**Expected Result:**
- ✅ Save completes in < 2 seconds
- ✅ UI remains responsive
- ✅ Background sync doesn't block

### Test 2: Batch Sync (100 Documents)

**Goal:** Sync many documents offline → online

**Steps:**
1. Go offline
2. Create/edit 100 documents
3. Go online
4. Monitor sync progress

**Expected Result:**
- ✅ All 100 documents sync
- ✅ Completes in < 5 minutes
- ✅ No memory leaks
- ✅ UI remains responsive

---

## Debugging

### Check SQLite Database

```bash
# Linux/Mac
sqlite3 ~/.local/share/LitRift/litrift.db ".tables"
sqlite3 ~/.local/share/LitRift/litrift.db "SELECT * FROM documents;"

# Windows
sqlite3 %APPDATA%\LitRift\litrift.db ".tables"
```

### Check Background Worker Status

```bash
curl http://localhost:5000/api/sync/worker-status \
  -H "X-User-ID: testuser" | jq
```

### Check Device Info

```bash
# Linux/Mac
cat ~/.local/share/LitRift/device_info.json | jq

# Windows
type %APPDATA%\LitRift\device_info.json
```

### Enable Debug Logging

```python
# backend/app.py
logging.basicConfig(level=logging.DEBUG)
```

### WebSocket Connection Test

```javascript
// Browser console
const socket = io('http://localhost:5000', {
  auth: { user_id: 'testuser' }
});

socket.on('connect', () => console.log('Connected'));
socket.on('sync:conflict', (data) => console.log('Conflict:', data));
```

---

## Success Criteria

Before marking Phase 2 complete, verify:

- [ ] ✅ Users can write offline
- [ ] ✅ Auto-sync works (no manual push button)
- [ ] ✅ Zero data loss in all scenarios
- [ ] ✅ Conflict UI is clear and intuitive
- [ ] ✅ Same device restart doesn't show conflicts
- [ ] ✅ Multi-device conflicts show modal
- [ ] ✅ App startup < 2 seconds
- [ ] ✅ Memory usage < 200MB
- [ ] ✅ Battery impact minimal
- [ ] ✅ Background sync runs every 30s
- [ ] ✅ WebSocket reconnects automatically
- [ ] ✅ Device ID persists across restarts

---

## Known Limitations

1. **Story Bible / Continuity features require internet** (AI-heavy)
2. **Conflicts only shown when same doc edited on different devices**
3. **Background sync every 30 seconds** (configurable via API)
4. **Max document size: 10MB** (SQLite + Firebase limitation)
5. **WebSocket requires socket.io-client** (npm install needed)

---

## Troubleshooting

### Problem: Background worker not starting

**Solution:**
```bash
# Check backend logs
tail -f backend.log | grep "Background sync"

# Manually start worker
curl -X POST http://localhost:5000/api/sync/start-worker \
  -H "X-User-ID: testuser"
```

### Problem: WebSocket not connecting

**Solution:**
1. Check socket.io-client installed: `npm list socket.io-client`
2. Check backend running with SocketIO: `curl http://localhost:5000/api/health`
3. Check CORS settings in backend
4. Check browser console for connection errors

### Problem: Conflicts not showing

**Solution:**
1. Verify different device IDs: `curl http://localhost:5000/api/health`
2. Check conflict table: `sqlite3 litrift.db "SELECT * FROM sync_conflicts;"`
3. Check WebSocket connection
4. Check frontend console for errors

---

## Automated Tests

See `backend/tests/test_background_sync.py` for unit tests.

Run tests:
```bash
cd backend
pytest tests/test_background_sync.py -v
```
