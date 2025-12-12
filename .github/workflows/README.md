# GitHub Actions CI/CD Workflows

This directory contains GitHub Actions workflows for automated CI/CD pipeline.

## Workflows

### 1. `ci-cd.yml` - Main CI/CD Pipeline

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main`
- Manual workflow dispatch

**Jobs:**
1. **build-and-test**: Builds and tests the application
2. **build-image**: Builds Docker image and pushes to registry
3. **deploy**: Deploys to Kubernetes (only on main branch)

**Features:**
- Automated testing
- Docker image building with caching
- Kubernetes deployment
- Health checks
- Rollback support

### 2. `deploy-manual.yml` - Manual Deployment

**Triggers:**
- Manual workflow dispatch only

**Use Cases:**
- Deploy specific image tags
- Deploy to different namespaces
- Emergency deployments
- Testing deployments

## Required GitHub Secrets

Configure these secrets in your GitHub repository settings:

### Registry Secrets
- `REGISTRY_USERNAME`: Docker registry username
- `REGISTRY_PASSWORD`: Docker registry password

### Kubernetes Secrets
- `KUBECONFIG`: Base64-encoded kubeconfig file
  ```bash
  cat ~/.kube/config | base64 -w 0
  ```

## Setup Instructions

### 1. Configure GitHub Secrets

Go to: **Settings → Secrets and variables → Actions**

Add the following secrets:

```
REGISTRY_USERNAME=your-registry-username
REGISTRY_PASSWORD=your-registry-password
KUBECONFIG=<base64-encoded-kubeconfig>
```

### 2. Get Kubeconfig

```bash
# Export your kubeconfig
cat ~/.kube/config | base64 -w 0

# Copy the output and paste it as KUBECONFIG secret in GitHub
```

### 3. Configure Registry Access

If your registry requires authentication, ensure the credentials are set in GitHub secrets.

For insecure registries (HTTP), the workflow configures Docker automatically.

## Usage

### Automatic Deployment

1. **Push to main branch**: Automatically builds and deploys
2. **Create pull request**: Builds and tests only (no deployment)

### Manual Deployment

1. Go to **Actions** tab in GitHub
2. Select **Manual Deployment** workflow
3. Click **Run workflow**
4. Fill in:
   - Image tag (default: `latest`)
   - Namespace (default: `30tel`)
   - Deployment name (default: `30tel-nextjs`)
5. Click **Run workflow**

### Deploy Specific Tag

```bash
# Via GitHub Actions UI
# Or use the manual deployment workflow with image_tag input
```

## Image Tagging Strategy

- **main branch**: `main-<sha>` and `latest`
- **develop branch**: `develop-<sha>`
- **Pull requests**: `pr-<number>`
- **Tags**: Semantic versioning (`v1.0.0`)

## Deployment Process

1. **Build**: Creates Docker image
2. **Push**: Pushes to registry `192.168.160.60:30500`
3. **Update**: Updates Kubernetes deployment with new image
4. **Rollout**: Waits for rollout to complete
5. **Verify**: Checks pod status and health

## Rollback

If deployment fails, you can rollback:

```bash
kubectl rollout undo deployment/30tel-nextjs -n 30tel
```

Or use GitHub Actions to deploy a previous image tag.

## Troubleshooting

### Build Fails

- Check Docker registry credentials
- Verify Dockerfile is correct
- Check build logs in GitHub Actions

### Deployment Fails

- Verify kubeconfig is correct
- Check namespace exists
- Verify deployment exists
- Check pod logs: `kubectl logs -f deployment/30tel-nextjs -n 30tel`

### Image Pull Errors

- Verify registry is accessible
- Check image tag exists
- Verify imagePullPolicy in deployment

## Local Testing

You can test the scripts locally:

```bash
# Build and push
./scripts/build-and-push.sh v1.0.0

# Deploy
./scripts/deploy.sh 30tel v1.0.0
```

## Best Practices

1. **Always test on develop branch first**
2. **Use semantic versioning for releases**
3. **Monitor deployments in GitHub Actions**
4. **Set up notifications for failed deployments**
5. **Keep kubeconfig secure (never commit it)**

## Security Notes

- Never commit secrets to repository
- Use GitHub Secrets for sensitive data
- Rotate credentials regularly
- Use least privilege for Kubernetes service accounts
- Enable branch protection on main branch

