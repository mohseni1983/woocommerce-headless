# Manual Image Push Instructions

The Docker image has been built successfully, but automatic push failed due to registry configuration.

## Built Image
- **Image Tag**: `192.168.160.60:30500/30tel-nextjs:20251124-144525`
- **Latest Tag**: `192.168.160.60:30500/30tel-nextjs:latest`

## Option 1: Configure Docker for Insecure Registry (Recommended)

1. Edit Docker daemon configuration:
   ```bash
   sudo nano /etc/docker/daemon.json
   ```

2. Add insecure registry:
   ```json
   {
     "insecure-registries": ["192.168.160.60:30500"]
   }
   ```

3. Restart Docker:
   ```bash
   sudo systemctl restart docker
   ```

4. Push the image:
   ```bash
   cd /home/mohseni/projects/30tel/woocommerce-headless
   docker push 192.168.160.60:30500/30tel-nextjs:20251124-144525
   docker push 192.168.160.60:30500/30tel-nextjs:latest
   ```

## Option 2: Use Docker Buildx (Alternative)

```bash
docker buildx build --push \
  --platform linux/amd64 \
  -t 192.168.160.60:30500/30tel-nextjs:20251124-144525 \
  -t 192.168.160.60:30500/30tel-nextjs:latest \
  --insecure-registry \
  -f Dockerfile .
```

## Option 3: Manual Push After Configuration

Once Docker is configured for insecure registry:

```bash
cd /home/mohseni/projects/30tel/woocommerce-headless
docker push 192.168.160.60:30500/30tel-nextjs:20251124-144525
docker push 192.168.160.60:30500/30tel-nextjs:latest
```

## After Pushing

Once the image is pushed, update the deployment:

```bash
kubectl set image deployment/30tel-nextjs \
  nextjs=192.168.160.60:30500/30tel-nextjs:20251124-144525 \
  -n 30tel

kubectl rollout status deployment/30tel-nextjs -n 30tel
```

Or use the deployment file with the new tag.



