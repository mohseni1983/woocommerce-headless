# CI/CD Setup Guide

Complete guide for setting up Continuous Integration and Continuous Deployment (CI/CD) for the 30tel Next.js application.

## Overview

This project uses **GitHub Actions** for CI/CD automation with the following features:

- ✅ Automated testing on pull requests
- ✅ Docker image building and pushing
- ✅ Automatic deployment to Kubernetes
- ✅ Manual deployment workflows
- ✅ Health checks and rollback support

## Architecture

```
┌─────────────┐
│   GitHub    │
│  Repository │
└──────┬──────┘
       │
       ├─── Push to main ────┐
       │                     │
       ├─── Pull Request ────┤
       │                     │
       └─── Manual Trigger ──┤
                             │
                             ▼
                    ┌─────────────────┐
                    │  GitHub Actions │
                    └────────┬────────┘
                             │
                ┌────────────┼────────────┐
                │            │            │
                ▼            ▼            ▼
         ┌──────────┐ ┌──────────┐ ┌──────────┐
         │   Build  │ │   Test    │ │   Deploy │
         │   Image  │ │  Code     │ │    K8s   │
         └────┬─────┘ └───────────┘ └────┬─────┘
              │                          │
              ▼                          ▼
      ┌──────────────┐          ┌──────────────┐
      │   Docker     │          │ Kubernetes   │
      │   Registry   │          │   Cluster    │
      │ 192.168...   │          │   (30tel)    │
      └──────────────┘          └──────────────┘
```

## Quick Start

### 1. Configure GitHub Secrets

Go to your GitHub repository: **Settings → Secrets and variables → Actions**

Add these secrets:

| Secret Name | Description | How to Get |
|------------|-------------|------------|
| `REGISTRY_USERNAME` | Docker registry username | Your registry username |
| `REGISTRY_PASSWORD` | Docker registry password | Your registry password |
| `KUBECONFIG` | Kubernetes config (base64) | `cat ~/.kube/config \| base64 -w 0` |

### 2. Test the Workflow

1. Push a commit to `main` branch
2. Go to **Actions** tab in GitHub
3. Watch the workflow run

### 3. Manual Deployment

1. Go to **Actions** → **Manual Deployment**
2. Click **Run workflow**
3. Select image tag and namespace
4. Click **Run workflow**

## Workflows

### Main CI/CD Pipeline (`ci-cd.yml`)

**Triggers:**
- Push to `main` or `develop`
- Pull requests
- Manual dispatch

**What it does:**
1. ✅ Checks out code
2. ✅ Installs dependencies
3. ✅ Runs linter
4. ✅ Runs type check
5. ✅ Builds application
6. ✅ Builds Docker image
7. ✅ Pushes to registry
8. ✅ Deploys to Kubernetes
9. ✅ Verifies deployment

### PR Checks (`pr-checks.yml`)

**Triggers:**
- Pull requests to `main` or `develop`

**What it does:**
- Runs linter
- Runs type check
- Builds application
- Does NOT deploy

### Manual Deployment (`deploy-manual.yml`)

**Triggers:**
- Manual workflow dispatch only

**What it does:**
- Deploys specific image tag
- Can deploy to different namespaces
- Useful for rollbacks

## Scripts

### `scripts/build-and-push.sh`

Builds and pushes Docker image locally.

```bash
# Build and push with latest tag
./scripts/build-and-push.sh

# Build and push with specific tag
./scripts/build-and-push.sh v1.0.0
```

### `scripts/deploy.sh`

Deploys to Kubernetes.

```bash
# Deploy latest image
./scripts/deploy.sh 30tel latest

# Deploy specific tag
./scripts/deploy.sh 30tel v1.0.0
```

### `scripts/apply-k8s.sh`

Applies all Kubernetes manifests.

```bash
# Apply to default namespace (30tel)
./scripts/apply-k8s.sh

# Apply to specific namespace
./scripts/apply-k8s.sh staging
```

## Image Tagging Strategy

| Branch/Event | Tag Format | Example |
|-------------|------------|---------|
| `main` branch | `main-<sha>` + `latest` | `main-a1b2c3d4`, `latest` |
| `develop` branch | `develop-<sha>` | `develop-e5f6g7h8` |
| Pull Request | `pr-<number>` | `pr-123` |
| Git Tag | Semantic version | `v1.0.0` |

## Deployment Process

1. **Code Push** → Triggers workflow
2. **Build** → Creates Docker image
3. **Push** → Pushes to registry `192.168.160.60:30500`
4. **Deploy** → Updates Kubernetes deployment
5. **Rollout** → Waits for new pods to be ready
6. **Verify** → Checks health and status

## Rollback

### Via kubectl

```bash
# Rollback to previous version
kubectl rollout undo deployment/30tel-nextjs -n 30tel

# Rollback to specific revision
kubectl rollout undo deployment/30tel-nextjs -n 30tel --to-revision=2
```

### Via GitHub Actions

1. Go to **Actions** → **Manual Deployment**
2. Enter previous image tag
3. Run workflow

## Monitoring

### Check Workflow Status

```bash
# View recent workflows
gh run list

# View workflow logs
gh run view <run-id>
```

### Check Deployment Status

```bash
# Pod status
kubectl get pods -n 30tel -l app=30tel-nextjs

# Deployment status
kubectl get deployment 30tel-nextjs -n 30tel

# Recent events
kubectl get events -n 30tel --sort-by='.lastTimestamp'
```

### Check Application Logs

```bash
# Follow logs
kubectl logs -f deployment/30tel-nextjs -n 30tel

# Last 100 lines
kubectl logs --tail=100 deployment/30tel-nextjs -n 30tel
```

## Troubleshooting

### Build Fails

**Problem**: Docker build fails

**Solutions**:
- Check Dockerfile syntax
- Verify all dependencies are in package.json
- Check build logs in GitHub Actions

### Push Fails

**Problem**: Cannot push to registry

**Solutions**:
- Verify `REGISTRY_USERNAME` and `REGISTRY_PASSWORD` secrets
- Check registry is accessible
- Verify registry allows insecure connections (HTTP)

### Deployment Fails

**Problem**: Kubernetes deployment fails

**Solutions**:
- Verify `KUBECONFIG` secret is correct
- Check namespace exists: `kubectl get namespace 30tel`
- Verify deployment exists: `kubectl get deployment 30tel-nextjs -n 30tel`
- Check pod logs: `kubectl logs -f deployment/30tel-nextjs -n 30tel`

### Image Pull Errors

**Problem**: Pod cannot pull image

**Solutions**:
- Verify image exists in registry
- Check imagePullPolicy in deployment
- Verify registry credentials
- Check network connectivity

## Best Practices

1. **Always test on develop branch first**
2. **Use semantic versioning for releases**
3. **Monitor deployments in GitHub Actions**
4. **Set up branch protection on main**
5. **Keep secrets secure (never commit them)**
6. **Review PRs before merging**
7. **Test rollback procedures regularly**
8. **Monitor application health after deployment**

## Security

### Secrets Management

- ✅ Use GitHub Secrets (never commit)
- ✅ Rotate credentials regularly
- ✅ Use least privilege for service accounts
- ✅ Enable branch protection

### Registry Security

- Use HTTPS when possible
- Configure insecure registries only in CI/CD
- Use authentication for registry access

### Kubernetes Security

- Use RBAC for service accounts
- Limit namespace access
- Monitor pod security policies

## Advanced Configuration

### Custom Image Tags

Edit `.github/workflows/ci-cd.yml`:

```yaml
tags: |
  type=raw,value=custom-tag
  type=sha,prefix=build-
```

### Multiple Environments

Create separate workflows for staging/production:

```yaml
- name: Deploy to Staging
  if: github.ref == 'refs/heads/develop'
  
- name: Deploy to Production
  if: github.ref == 'refs/heads/main'
```

### Notifications

Add notification steps:

```yaml
- name: Notify on failure
  if: failure()
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    text: 'Deployment failed!'
```

## Support

For issues or questions:
1. Check GitHub Actions logs
2. Review Kubernetes events
3. Check application logs
4. Review this documentation

## Files Structure

```
.github/
├── workflows/
│   ├── ci-cd.yml          # Main CI/CD pipeline
│   ├── deploy-manual.yml  # Manual deployment
│   ├── pr-checks.yml      # PR checks
│   └── README.md          # Workflow documentation
scripts/
├── build-and-push.sh      # Build and push script
├── deploy.sh              # Deployment script
└── apply-k8s.sh          # Apply K8s manifests
```

## Next Steps

1. ✅ Configure GitHub Secrets
2. ✅ Test workflow with a test commit
3. ✅ Set up branch protection
4. ✅ Configure notifications
5. ✅ Document your specific requirements

