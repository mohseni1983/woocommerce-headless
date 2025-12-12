# Deployment Scripts

This directory contains scripts for building, pushing, and deploying the application.

## Scripts

### `build-and-push.sh`

Builds Docker image and pushes to registry.

**Usage:**
```bash
# Build and push with latest tag
./scripts/build-and-push.sh

# Build and push with specific tag
./scripts/build-and-push.sh v1.0.0
```

**Features:**
- Builds Docker image
- Tags image appropriately
- Handles insecure registry configuration
- Provides helpful error messages

**Requirements:**
- Docker installed
- Docker daemon running
- Registry configured (see `configure-docker-registry.sh`)

### `deploy.sh`

Deploys application to Kubernetes.

**Usage:**
```bash
# Deploy latest image to default namespace
./scripts/deploy.sh 30tel latest

# Deploy specific tag
./scripts/deploy.sh 30tel v1.0.0
```

**Features:**
- Updates Kubernetes deployment
- Waits for rollout
- Verifies deployment
- Performs health checks

**Requirements:**
- kubectl installed
- kubeconfig configured
- Deployment exists in namespace

### `apply-k8s.sh`

Applies all Kubernetes manifests.

**Usage:**
```bash
# Apply to default namespace (30tel)
./scripts/apply-k8s.sh

# Apply to specific namespace
./scripts/apply-k8s.sh staging
```

**Features:**
- Creates namespace if needed
- Applies manifests in correct order
- Handles dependencies

### `configure-docker-registry.sh`

Configures Docker for insecure registry (HTTP).

**Usage:**
```bash
# Configure for default registry
sudo ./scripts/configure-docker-registry.sh

# Configure for specific registry
sudo ./scripts/configure-docker-registry.sh 192.168.160.60:30500
```

**Features:**
- Configures `/etc/docker/daemon.json`
- Preserves existing configuration
- Restarts Docker daemon
- Handles both new and existing configs

**Requirements:**
- Run as root (sudo)
- Docker installed

## Common Workflows

### First Time Setup

```bash
# 1. Configure Docker registry
sudo ./scripts/configure-docker-registry.sh

# 2. Apply Kubernetes manifests
./scripts/apply-k8s.sh

# 3. Build and push image
./scripts/build-and-push.sh

# 4. Deploy
./scripts/deploy.sh 30tel latest
```

### Regular Deployment

```bash
# 1. Build and push
./scripts/build-and-push.sh v1.0.0

# 2. Deploy
./scripts/deploy.sh 30tel v1.0.0
```

### Quick Update

```bash
# Build, push, and deploy latest
./scripts/build-and-push.sh && ./scripts/deploy.sh 30tel latest
```

## Troubleshooting

### Docker Push Fails with HTTP Error

**Error:** `server gave HTTP response to HTTPS client`

**Solution:**
```bash
sudo ./scripts/configure-docker-registry.sh
```

### kubectl Not Found

**Error:** `kubectl not found`

**Solution:**
```bash
# Install kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl
```

### Deployment

**Error:** `Permission denied`

**Solution:**
- Use `sudo` for `configure-docker-registry.sh`
- Ensure kubectl has proper permissions
- Check kubeconfig permissions: `chmod 600 ~/.kube/config`

### Deployment Not Found

**Error:** `Deployment not found`

**Solution:**
```bash
# Apply manifests first
./scripts/apply-k8s.sh
```

## Environment Variables

You can override defaults with environment variables:

```bash
# Custom registry
REGISTRY=my-registry.com:5000 ./scripts/build-and-push.sh

# Custom image name
IMAGE_NAME=my-app ./scripts/build-and-push.sh

# Custom namespace
NAMESPACE=production ./scripts/deploy.sh production latest
```

## Integration with CI/CD

These scripts are designed to work with GitHub Actions:

- Scripts handle errors gracefully
- Provide clear error messages
- Support environment variable overrides
- Can be used in CI/CD pipelines

## Best Practices

1. **Always test locally first**
   ```bash
   ./scripts/build-and-push.sh test-tag
   ./scripts/deploy.sh staging test-tag
   ```

2. **Use semantic versioning**
   ```bash
   ./scripts/build-and-push.sh v1.2.3
   ```

3. **Verify before deploying**
   ```bash
   # Check image exists
   docker images | grep 30tel-nextjs
   
   # Check deployment status
   kubectl get deployment 30tel-nextjs -n 30tel
   ```

4. **Monitor after deployment**
   ```bash
   kubectl logs -f deployment/30tel-nextjs -n 30tel
   ```

5. **Keep scripts executable**
   ```bash
   chmod +x scripts/*.sh
   ```





