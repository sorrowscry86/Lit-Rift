# CI/CD and Release Management

## Overview

Lit-Rift uses a comprehensive CI/CD pipeline with automated testing, security scanning, semantic versioning, and multi-platform Docker image publishing.

## Pipeline Architecture

### 1. Continuous Integration (CI)

**Workflow**: `.github/workflows/ci.yml`

Runs on every push to `main` and `claude/**` branches, and on all pull requests.

#### Jobs:

1. **Backend Tests** (`backend-tests`)
   - Python 3.11
   - Installs dependencies from `requirements.txt`
   - Runs pytest with >90% coverage requirement
   - Uploads coverage to Codecov

2. **Frontend Tests** (`frontend-tests`)
   - Node.js 18
   - Runs Jest with React Testing Library
   - Coverage thresholds: 80%
   - Uploads coverage to Codecov

3. **Frontend Build** (`frontend-build`)
   - Verifies production build succeeds
   - Creates build artifacts
   - Runs after frontend tests pass

4. **Lint** (`lint`)
   - **Backend**: flake8 (syntax errors) + black (formatting)
   - **Frontend**: ESLint for TypeScript/React
   - Non-blocking for style issues

5. **Type Check** (`type-check`)
   - TypeScript strict type checking
   - Ensures type safety across frontend

6. **Security Scan** (`security-scan`)
   - **Frontend**: `npm audit` for vulnerabilities
   - **Backend**: `safety check` for Python packages
   - Non-blocking but reports issues

### 2. Release Workflow

**Workflow**: `.github/workflows/release.yml`

Automatically triggers on pushes to `main` that match semantic commit patterns.

#### Trigger Conditions:

- Commit message starts with: `feat:`, `fix:`, `perf:`, `BREAKING CHANGE:`
- Or manual tag push: `v*.*.*`

#### Version Bumping Rules:

- `BREAKING CHANGE:` or `feat!:` → Major version bump (2.0.0)
- `feat:` → Minor version bump (1.1.0)
- `fix:` or `perf:` → Patch version bump (1.0.1)

#### Release Pipeline:

1. **Check Release Needed** (`check-release`)
   - Analyzes commit message
   - Determines version bump
   - Outputs: `should_release`, `version`

2. **Run CI Pipeline** (`run-ci`)
   - Executes full CI workflow
   - Ensures all tests pass before release

3. **Create GitHub Release** (`create-release`)
   - Generates changelog from commits
   - Updates CHANGELOG.md
   - Creates Git tag
   - Publishes GitHub release with notes

4. **Publish Docker Images** (`publish-docker`)
   - Builds multi-platform images (amd64, arm64)
   - Publishes to Docker Hub
   - Publishes to GitHub Container Registry
   - Tags: version, major.minor, major, latest, sha

5. **Create Artifacts** (`create-artifacts`)
   - Source code archive
   - Frontend build archive
   - Backend archive
   - Uploads to GitHub release

6. **Notify** (`notify`)
   - Creates GitHub Actions summary
   - Shows release info and Docker commands

### 3. Docker Publishing

**Workflow**: `.github/workflows/docker-publish.yml`

Continuous Docker image publishing for development builds.

#### Triggers:

- Push to `main` (changes to backend/, frontend/, docker-compose.yml)
- Manual workflow dispatch with custom tag

#### Features:

- Multi-platform builds (amd64, arm64)
- Layer caching for faster builds
- Vulnerability scanning with Trivy
- Docker Compose integration test
- Automatic Docker Hub README updates

#### Image Tags:

- `latest` - Latest main branch
- `main-<sha>` - Development builds
- `v1.2.3` - Release versions (from release workflow)
- Custom tags via manual dispatch

## Commit Message Convention

We use **Conventional Commits** for semantic versioning:

### Format:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types:

- `feat:` - New feature (minor version bump)
- `fix:` - Bug fix (patch version bump)
- `perf:` - Performance improvement (patch)
- `refactor:` - Code refactoring (patch)
- `docs:` - Documentation only (no release)
- `style:` - Code style/formatting (no release)
- `test:` - Adding/updating tests (no release)
- `build:` - Build system changes (no release)
- `ci:` - CI/CD changes (no release)
- `chore:` - Other changes (no release)

### Breaking Changes:

Add `!` after type or include `BREAKING CHANGE:` in footer:

```
feat!: redesign API endpoints

BREAKING CHANGE: All endpoints now require authentication
```

### Examples:

```bash
# Feature - triggers v1.1.0 release
git commit -m "feat: add PDF export with custom styling"

# Bug fix - triggers v1.0.1 release
git commit -m "fix: resolve memory leak in AI generation"

# Performance - triggers v1.0.1 release
git commit -m "perf: optimize database queries for large projects"

# Breaking change - triggers v2.0.0 release
git commit -m "feat!: migrate to new authentication system"

# Documentation - no release
git commit -m "docs: update deployment guide"

# Multiple changes
git commit -m "feat: add export scheduling

- Allow users to schedule exports
- Add email notifications
- Update UI with scheduling options

Closes #123"
```

## Semantic Versioning

We follow [SemVer 2.0.0](https://semver.org/):

**Given a version number MAJOR.MINOR.PATCH:**

- **MAJOR**: Incompatible API changes (1.x.x → 2.0.0)
- **MINOR**: New functionality, backwards-compatible (1.0.x → 1.1.0)
- **PATCH**: Bug fixes, backwards-compatible (1.0.0 → 1.0.1)

### Version Files:

- `VERSION` - Project version
- `frontend/package.json` - Frontend version
- `backend/pyproject.toml` - Backend version
- `.releaserc.json` - semantic-release configuration

## GitHub Secrets Required

### For CI/CD:

- `CODECOV_TOKEN` - Codecov upload token (optional)

### For Releases:

- `GITHUB_TOKEN` - Automatically provided by GitHub

### For Docker Publishing:

- `DOCKER_USERNAME` - Docker Hub username
- `DOCKER_PASSWORD` - Docker Hub password or access token

### To Set Up Secrets:

1. Go to repository **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add each secret with its value

## Manual Release Process

### Option 1: Semantic Commit (Recommended)

```bash
# Make changes
git add .
git commit -m "feat: add new feature"
git push origin main
# Release workflow triggers automatically
```

### Option 2: Manual Tag

```bash
# Create and push tag
git tag -a v1.2.3 -m "Release v1.2.3"
git push origin v1.2.3
# Release workflow triggers
```

### Option 3: Manual Workflow Dispatch

1. Go to **Actions** → **Release and Publish**
2. Click **Run workflow**
3. Enter tag name (e.g., `v1.2.3`)
4. Click **Run workflow**

## Docker Image Usage

### Pull Images:

```bash
# Latest release
docker pull ghcr.io/sorrowscry86/lit-rift/backend:latest
docker pull ghcr.io/sorrowscry86/lit-rift/frontend:latest

# Specific version
docker pull ghcr.io/sorrowscry86/lit-rift/backend:1.0.0
docker pull ghcr.io/sorrowscry86/lit-rift/frontend:1.0.0

# Development build
docker pull ghcr.io/sorrowscry86/lit-rift/backend:main-abc1234
```

### Using docker-compose with released images:

```yaml
version: '3.8'

services:
  backend:
    image: ghcr.io/sorrowscry86/lit-rift/backend:1.0.0
    ports:
      - "5000:5000"
    environment:
      - GOOGLE_API_KEY=${GOOGLE_API_KEY}
      - FIREBASE_CONFIG=${FIREBASE_CONFIG}

  frontend:
    image: ghcr.io/sorrowscry86/lit-rift/frontend:1.0.0
    ports:
      - "80:80"
    depends_on:
      - backend
```

## Monitoring Workflows

### Check Workflow Status:

1. Go to repository **Actions** tab
2. Click on workflow name
3. View job logs and status

### Debugging Failed Workflows:

```bash
# Check workflow logs in GitHub UI
# Common issues:

# 1. Test failures
#    → Fix tests locally, push fix

# 2. Coverage below threshold
#    → Add more tests to increase coverage

# 3. Docker build failure
#    → Test Docker build locally:
docker build -t test ./backend

# 4. Missing secrets
#    → Add required secrets in repository settings
```

## Local Testing

### Test CI Pipeline Locally:

```bash
# Backend tests
cd backend
pip install -r requirements.txt
pip install pytest-cov pytest-mock
pytest tests/ -v --cov=services --cov=routes --cov-fail-under=90

# Frontend tests
cd frontend
npm ci --legacy-peer-deps
npm test -- --coverage --watchAll=false

# Frontend build
npm run build

# Lint
cd backend
pip install flake8 black
flake8 . --count --select=E9,F63,F7,F82 --show-source --statistics
black --check .

cd ../frontend
npx eslint src/ --ext .ts,.tsx

# Type check
npx tsc --noEmit

# Security scan
npm audit --audit-level=high
cd ../backend
pip install safety
safety check
```

### Test Docker Build:

```bash
# Build backend
docker build -t lit-rift-backend:test ./backend

# Build frontend
docker build -t lit-rift-frontend:test ./frontend

# Test with docker-compose
docker-compose up -d
curl http://localhost:5000/api/health
curl http://localhost/
docker-compose down
```

## Release Checklist

Before releasing a new version:

- [ ] All tests pass locally
- [ ] Coverage >90% for backend, >80% for frontend
- [ ] No critical security vulnerabilities
- [ ] CHANGELOG.md is up to date (auto-generated)
- [ ] Docker images build successfully
- [ ] Documentation is updated
- [ ] Commit message follows convention
- [ ] CI pipeline is green

After release:

- [ ] Verify GitHub release created
- [ ] Check Docker images published
- [ ] Test released Docker images
- [ ] Update deployment environments
- [ ] Announce release (if public)

## Troubleshooting

### Release Not Triggered

**Problem**: Pushed commit but no release created

**Solutions**:
1. Check commit message format (must match semantic commit pattern)
2. Verify CI pipeline passed
3. Check workflow logs for errors
4. Ensure on `main` branch

### Docker Build Failed

**Problem**: Docker image build fails in CI

**Solutions**:
1. Test Docker build locally
2. Check Dockerfile syntax
3. Verify all files are committed
4. Review build logs for errors

### Coverage Too Low

**Problem**: Tests fail due to coverage threshold

**Solutions**:
1. Add more test cases
2. Test edge cases
3. Mock external dependencies properly
4. Check coverage report: `pytest --cov-report=html`

### Docker Hub Push Failed

**Problem**: Cannot push to Docker Hub

**Solutions**:
1. Verify `DOCKER_USERNAME` secret is correct
2. Verify `DOCKER_PASSWORD` secret (use access token, not password)
3. Check Docker Hub account has write access
4. Ensure repository exists on Docker Hub

## Best Practices

1. **Commit Often**: Small, focused commits with clear messages
2. **Test Before Push**: Run tests locally before pushing
3. **Use Branches**: Develop features in `claude/**` branches
4. **Review Coverage**: Maintain high test coverage
5. **Monitor CI**: Check CI status before merging
6. **Semantic Commits**: Follow conventional commit format
7. **Update Docs**: Keep documentation in sync with code
8. **Security First**: Address vulnerabilities promptly
9. **Version Carefully**: Understand version bump implications
10. **Test Releases**: Verify released images work correctly

## Future Enhancements

Planned improvements to CI/CD:

- [ ] Automated performance benchmarking
- [ ] Visual regression testing
- [ ] Automated security scanning with Snyk
- [ ] Dependency update automation (Dependabot/Renovate)
- [ ] Canary deployments
- [ ] Blue-green deployment strategy
- [ ] Integration testing in staging environment
- [ ] Automated rollback on failure
- [ ] Release drafter for better release notes
- [ ] Slack/Discord notifications

---

**Last Updated**: 2025-11-11
**Version**: 1.0.0
**Status**: ✅ Production Ready
