# Snap Docker Setup Guide

This guide explains how to configure Docker installed via snap for insecure registries.

## Quick Setup

For Docker installed via snap, run:

```bash
sudo ./scripts/configure-docker-registry.sh
```

This will automatically detect snap Docker and configure it correctly.

## Manual Setup

If you prefer to configure manually:

### 1. Create Config Directory

```bash
sudo mkdir -p /var/snap/docker/current/config
```

### 2. Create/Edit daemon.json

```bash
sudo nano /var/snap/docker/current/config/daemon.json
```

Add:

```json
{
  "insecure-registries": ["192.168.160.60:30500"]
}
```

### 3. Restart Docker

```bash
sudo snap restart docker
```

### 4. Verify

```bash
# Check Docker is running
snap services docker

# Test registry connection
docker pull 192.168.160.60:30500/test:latest
```

## Differences from Systemd Docker

| Aspect | Systemd Docker | Snap Docker |
|--------|---------------|-------------|
| Config Location | `/etc/docker/daemon.json` | `/var/snap/docker/current/config/daemon.json` |
| Restart Command | `sudo systemctl restart docker` | `sudo snap restart docker` |
| Service Check | `systemctl status docker` | `snap services docker` |
| Logs | `journalctl -u docker` | `snap logs docker` |

## Troubleshooting

### Permission Denied

If you get permission errors:

```bash
# Check if you're in docker group
groups | grep docker

# If not, add yourself (logout/login required)
sudo usermod -aG docker $USER

# Or use sudo for Docker commands
sudo docker ...
```

### Config Not Applied

After editing daemon.json:

1. Restart Docker: `sudo snap restart docker`
2. Verify config: `cat /var/snap/docker/current/config/daemon.json`
3. Check Docker info: `docker info | grep -i insecure`

### Registry Still Not Working

1. Verify registry URL is correct
2. Check network connectivity: `ping 192.168.160.60`
3. Try pulling with full URL: `docker pull 192.168.160.60:30500/30tel-nextjs:latest`
4. Check Docker logs: `snap logs docker`

## Script Detection

The `configure-docker-registry.sh` script automatically detects:

- ✅ Snap Docker installation
- ✅ Systemd Docker installation
- ✅ Uses appropriate config path
- ✅ Uses correct restart command

## Verification Commands

```bash
# Check Docker installation method
snap list docker

# Check config file
cat /var/snap/docker/current/config/daemon.json

# Check Docker info
docker info | grep -A 5 "Insecure Registries"

# Test registry
docker pull 192.168.160.60:30500/30tel-nextjs:latest
```

## Notes

- Snap Docker config is isolated in `/var/snap/docker/`
- Changes require Docker restart to take effect
- Some operations may require sudo even if you're in docker group
- The script handles both snap and systemd Docker automatically





