# Deployment Guide for 30tel Next.js Application

This guide covers deploying the 30tel Next.js application using Docker and Kubernetes.

## Prerequisites

- Docker and Docker Compose (for local development)
- Kubernetes cluster (for production)
- kubectl configured to access your cluster
- Docker registry access (for pushing images)

## Docker Deployment

### 1. Build Docker Image

```bash
# Build the image
docker build -t 30tel-nextjs:latest .

# Tag for registry (replace with your registry)
docker tag 30tel-nextjs:latest your-registry.com/30tel-nextjs:latest

# Push to registry
docker push your-registry.com/30tel-nextjs:latest
```

### 2. Run with Docker Compose

```bash
# Create .env.local file with your environment variables
cp .env.example .env.local

# Edit .env.local with your values
nano .env.local

# Start the application
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the application
docker-compose down
```

### 3. Environment Variables

Create a `.env.local` file with the following variables:

```env
WOOCOMMERCE_URL=http://localhost:8000
WOOCOMMERCE_CONSUMER_KEY=your_consumer_key
WOOCOMMERCE_CONSUMER_SECRET=your_consumer_secret
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Kubernetes Deployment

### 1. Prepare Kubernetes Manifests

All Kubernetes manifests are in the `k8s/` directory:

- `namespace.yaml` - Creates the namespace
- `configmap.yaml` - Configuration values
- `secret.yaml` - Sensitive data (API keys)
- `deployment.yaml` - Application deployment
- `service.yaml` - Service definition
- `ingress.yaml` - Ingress for external access
- `hpa.yaml` - Horizontal Pod Autoscaler
- `pdb.yaml` - Pod Disruption Budget

### 2. Create Secrets

**Option 1: Using kubectl command**

```bash
kubectl create secret generic 30tel-secrets \
  --from-literal=WOOCOMMERCE_CONSUMER_KEY=your_key \
  --from-literal=WOOCOMMERCE_CONSUMER_SECRET=your_secret \
  -n 30tel
```

**Option 2: Using secret.yaml (update values first)**

```bash
# Edit k8s/secret.yaml with your actual values
nano k8s/secret.yaml

# Apply the secret
kubectl apply -f k8s/secret.yaml
```

### 3. Update ConfigMap

Edit `k8s/configmap.yaml` with your actual configuration:

```bash
nano k8s/configmap.yaml
```

Update:
- `WOOCOMMERCE_URL` - Your WooCommerce backend URL
- `NEXT_PUBLIC_SITE_URL` - Your public site URL
- `NEXT_PUBLIC_APP_URL` - Your application URL

### 4. Update Deployment Image

Edit `k8s/deployment.yaml` and update the image reference:

```yaml
image: your-registry.com/30tel-nextjs:latest
```

### 5. Deploy to Kubernetes

```bash
# Create namespace
kubectl apply -f k8s/namespace.yaml

# Create configmap
kubectl apply -f k8s/configmap.yaml

# Create secrets (if using file)
kubectl apply -f k8s/secret.yaml

# Deploy application
kubectl apply -f k8s/deployment.yaml

# Create service
kubectl apply -f k8s/service.yaml

# Create ingress (update domain names first)
kubectl apply -f k8s/ingress.yaml

# Create HPA (optional)
kubectl apply -f k8s/hpa.yaml

# Create PDB (optional)
kubectl apply -f k8s/pdb.yaml
```

### 6. Verify Deployment

```bash
# Check pods
kubectl get pods -n 30tel

# Check services
kubectl get svc -n 30tel

# Check ingress
kubectl get ingress -n 30tel

# View logs
kubectl logs -f deployment/30tel-nextjs -n 30tel

# Describe deployment
kubectl describe deployment 30tel-nextjs -n 30tel
```

### 7. Update Ingress

Before applying the ingress, update `k8s/ingress.yaml`:

1. Replace `30tel.com` with your actual domain
2. Update TLS certificate configuration
3. Adjust annotations based on your ingress controller

### 8. Scaling

The HPA (Horizontal Pod Autoscaler) will automatically scale based on CPU and memory usage. You can also manually scale:

```bash
kubectl scale deployment 30tel-nextjs --replicas=5 -n 30tel
```

## Production Checklist

- [ ] Update all environment variables in ConfigMap and Secrets
- [ ] Update image reference in deployment.yaml
- [ ] Configure proper domain names in ingress.yaml
- [ ] Set up TLS certificates (Let's Encrypt or your own)
- [ ] Configure monitoring and logging
- [ ] Set up backup strategy
- [ ] Configure resource limits appropriately
- [ ] Test health check endpoint
- [ ] Verify all services are running
- [ ] Test application functionality

## Troubleshooting

### Pods not starting

```bash
# Check pod status
kubectl get pods -n 30tel

# View pod logs
kubectl logs <pod-name> -n 30tel

# Describe pod for events
kubectl describe pod <pod-name> -n 30tel
```

### Service not accessible

```bash
# Check service endpoints
kubectl get endpoints -n 30tel

# Test service from within cluster
kubectl run -it --rm debug --image=busybox --restart=Never -- wget -O- http://30tel-nextjs-service:80
```

### Ingress issues

```bash
# Check ingress status
kubectl describe ingress 30tel-ingress -n 30tel

# Check ingress controller logs
kubectl logs -n ingress-nginx deployment/ingress-nginx-controller
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Build and Deploy

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build Docker image
        run: docker build -t 30tel-nextjs:${{ github.sha }} .
      - name: Push to registry
        run: |
          docker tag 30tel-nextjs:${{ github.sha }} your-registry.com/30tel-nextjs:${{ github.sha }}
          docker push your-registry.com/30tel-nextjs:${{ github.sha }}
  
  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Kubernetes
        run: |
          kubectl set image deployment/30tel-nextjs nextjs=your-registry.com/30tel-nextjs:${{ github.sha }} -n 30tel
```

## Monitoring

Consider setting up:

- Prometheus for metrics
- Grafana for visualization
- ELK stack for logging
- AlertManager for alerts

## Security Best Practices

1. Use secrets for sensitive data (never in ConfigMap)
2. Enable network policies
3. Use non-root user in containers
4. Scan images for vulnerabilities
5. Use TLS for all external traffic
6. Implement rate limiting
7. Regular security updates

## Backup and Recovery

1. Backup ConfigMaps and Secrets
2. Backup persistent volumes (if any)
3. Document rollback procedures
4. Test recovery procedures regularly

## Support

For issues or questions, please refer to the main README.md or contact the development team.




