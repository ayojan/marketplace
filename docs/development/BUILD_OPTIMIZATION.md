# Docker Build Optimization Guide

## Problem Fixed
Docker was reinstalling gems/packages on every build because of poor layer caching.

## Optimizations Applied

### 1. Layer Caching Strategy
- **Before**: Copied all files before installing dependencies
- **After**: Copy only dependency files (Gemfile, package.json) first, then install, then copy source code

### 2. .dockerignore Files
Created comprehensive .dockerignore files to exclude:
- Development files (.env.local, logs, tmp files)
- Test files and coverage reports
- IDE files (.vscode, .idea)
- Git history and documentation
- Build artifacts that shouldn't be in build context

### 3. Multi-stage Builds (Production)
- Separate build and runtime stages
- Clean up build dependencies in final image
- Optimize bundle configuration for production

### 4. User Permissions
- Proper user setup for security
- Correct file ownership

## Build Performance Improvements

### Before Optimization:
```bash
# Every build reinstalled all gems/packages
docker-compose build  # ~5-10 minutes
```

### After Optimization:
```bash
# First build: ~5-10 minutes
docker-compose build

# Subsequent builds (no dependency changes): ~30 seconds
docker-compose build

# Only when Gemfile/package.json changes: ~2-3 minutes
```

## Best Practices Applied

1. **Dependency Layer Caching**: Dependencies are cached until Gemfile/package.json changes
2. **Minimal Build Context**: .dockerignore excludes unnecessary files
3. **Clean Builds**: Remove caches and temporary files
4. **Security**: Non-root users in containers
5. **Production Optimization**: Multi-stage builds for smaller images

## Usage

### Development
```bash
# Build local development images with caching
docker compose -f docker-compose.local.yml build

# Force rebuild without cache (if needed)
docker compose -f docker-compose.local.yml build --no-cache
```

### Production / Mirror
```bash
# Build production images (or pull from GitHub Container Registry)
docker compose build
```

## Cache Invalidation

Docker layers will be rebuilt when:
- Gemfile or Gemfile.lock changes (backend)
- package.json or package-lock.json changes (frontend)
- Source code changes (only affects final layers)

## Monitoring Build Performance

```bash
# Check build time
time docker-compose build

# Check image sizes
docker images | grep marketplace

# Check layer history
docker history marketplace_backend:latest
```