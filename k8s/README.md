# Kubernetes Deployment Files

This directory contains all Kubernetes manifests for deploying the 30tel Next.js application.

## File Structure

- `namespace.yaml` - Creates the `30tel` namespace
- `configmap.yaml` - Non-sensitive configuration values
- `secret.yaml` - Sensitive data (API keys, passwords)
- `deployment.yaml` - Main application deployment
- `service.yaml` - ClusterIP service for internal access
- `ingress.yaml` - Ingress for external HTTP/HTTPS access
- `hpa.yaml` - Horizontal Pod Autoscaler for automatic scaling
- `pdb.yaml` - Pod Disruption Budget for high availability

## Quick Start

1. **Create namespace:**
   ```bash
   kubectl apply -f namespace.yaml
   ```

2. **Create secrets:**
   ```bash
   kubectl create secret generic 30tel-secrets \
     --from-literal=WOOCOMMERCE_CONSUMER_KEY=your_key \
     --from-literal=WOOCOMMERCE_CONSUMER_SECRET=your_secret \
     -n 30tel
   ```

3. **Update and apply configmap:**
   ```bash
   # Edit configmap.yaml with your values
   kubectl apply -f configmap.yaml
   ```

4. **Deploy application:**
   ```bash
   kubectl apply -f deployment.yaml
   kubectl apply -f service.yaml
   kubectl apply -f ingress.yaml
   ```

5. **Optional - Enable auto-scaling:**
   ```bash
   kubectl apply -f hpa.yaml
   kubectl apply -f pdb.yaml
   ```

## Deployment Order

Apply files in this order:

1. `namespace.yaml`
2. `configmap.yaml`
3. `secret.yaml`
4. `deployment.yaml`
5. `service.yaml`
6. `ingress.yaml`
7. `hpa.yaml` (optional)
8. `pdb.yaml` (optional)

Or apply all at once:

```bash
kubectl apply -f k8s/
```

## Configuration

### Before Deployment

1. **Update `configmap.yaml`:**
   - Set `WOOCOMMERCE_URL` to your WordPress/WooCommerce backend
   - Set `NEXT_PUBLIC_SITE_URL` to your public domain
   - Set `NEXT_PUBLIC_APP_URL` to your application URL

2. **Update `secret.yaml` or create secrets:**
   - Add your WooCommerce API credentials
   - Never commit secrets to version control

3. **Update `deployment.yaml`:**
   - Change `image` to your Docker registry image
   - Adjust `replicas` if needed
   - Modify resource limits/requests as needed

4. **Update `ingress.yaml`:**
   - Replace `30tel.com` with your actual domain
   - Configure TLS certificates
   - Adjust annotations for your ingress controller

## Monitoring

Check deployment status:

```bash
# Pods
kubectl get pods -n 30tel

# Services
kubectl get svc -n 30tel

# Ingress
kubectl get ingress -n 30tel

# HPA
kubectl get hpa -n 30tel

# Logs
kubectl logs -f deployment/30tel-nextjs -n 30tel
```

## Troubleshooting

See `DEPLOYMENT.md` in the root directory for detailed troubleshooting steps.




