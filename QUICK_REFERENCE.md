## 🆘 Troubleshooting

### Port Already in Use

**On Linux/macOS:**
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

**On Windows:**
```bash
# Find process on port 5000
netstat -ano | findstr :5000
# Kill process (replace PID with actual process ID)
taskkill /PID <PID> /F

# Find process on port 3000
netstat -ano | findstr :3000
# Kill process
taskkill /PID <PID> /F
```
