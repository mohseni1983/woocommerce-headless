#!/bin/bash
# Configure Docker for insecure registry
# Usage: ./scripts/configure-docker-registry.sh [registry-url]

set -e

REGISTRY="${1:-192.168.160.60:30500}"

echo "=========================================="
echo "Configuring Docker for Insecure Registry"
echo "=========================================="
echo "Registry: ${REGISTRY}"
echo ""

# Detect Docker installation method
if snap list docker &>/dev/null; then
    DOCKER_TYPE="snap"
    echo "✅ Detected: Docker installed via snap"
    DAEMON_JSON="/var/snap/docker/current/config/daemon.json"
    RESTART_CMD="snap restart docker"
elif systemctl is-active --quiet docker; then
    DOCKER_TYPE="systemd"
    echo "✅ Detected: Docker installed via systemd"
    DAEMON_JSON="/etc/docker/daemon.json"
    RESTART_CMD="systemctl restart docker"
else
    echo "⚠️  Could not detect Docker installation method"
    echo "   Trying systemd method..."
    DOCKER_TYPE="systemd"
    DAEMON_JSON="/etc/docker/daemon.json"
    RESTART_CMD="systemctl restart docker"
fi

echo "Using config: ${DAEMON_JSON}"
echo ""

# Check if running as root (for systemd) or if snap is available
if [ "$DOCKER_TYPE" = "snap" ]; then
    if ! snap list docker &>/dev/null; then
        echo "❌ Docker snap not found"
        exit 1
    fi
    # For snap, we might need sudo for some operations
    if [ "$EUID" -ne 0 ] && ! groups | grep -q docker; then
        echo "⚠️  You may need sudo for some operations"
    fi
elif [ "$EUID" -ne 0 ]; then 
    echo "❌ This script must be run as root (use sudo) for systemd Docker"
    exit 1
fi

# Create directory if it doesn't exist
if [ "$DOCKER_TYPE" = "snap" ]; then
    # For snap, directory might need sudo
    sudo mkdir -p "$(dirname "$DAEMON_JSON")" 2>/dev/null || mkdir -p "$(dirname "$DAEMON_JSON")"
else
    mkdir -p "$(dirname "$DAEMON_JSON")"
fi

# Check if daemon.json exists
if [ -f "$DAEMON_JSON" ]; then
    echo "⚠️  $DAEMON_JSON already exists"
    echo "Current content:"
    cat "$DAEMON_JSON"
    echo ""
    
    # Check if insecure-registries already contains our registry
    if grep -q "$REGISTRY" "$DAEMON_JSON" 2>/dev/null; then
        echo "✅ Registry ${REGISTRY} is already configured"
        exit 0
    fi
    
    echo "📝 Adding registry to existing configuration..."
    
    # Backup existing file
    sudo cp "$DAEMON_JSON" "${DAEMON_JSON}.backup.$(date +%Y%m%d-%H%M%S)" 2>/dev/null || cp "$DAEMON_JSON" "${DAEMON_JSON}.backup.$(date +%Y%m%d-%H%M%S)"
    
    # Use Python for JSON manipulation (more reliable than jq for this case)
    if command -v python3 &> /dev/null; then
        if [ "$DOCKER_TYPE" = "snap" ]; then
            sudo python3 << EOF
import json
import sys

DAEMON_JSON = '$DAEMON_JSON'
REGISTRY = '$REGISTRY'

try:
    with open(DAEMON_JSON, 'r') as f:
        config = json.load(f)
except Exception as e:
    config = {}

if 'insecure-registries' not in config:
    config['insecure-registries'] = []

if REGISTRY not in config['insecure-registries']:
    config['insecure-registries'].append(REGISTRY)

with open(DAEMON_JSON, 'w') as f:
    json.dump(config, f, indent=4)
EOF
        else
            python3 << EOF
import json
import sys

DAEMON_JSON = '$DAEMON_JSON'
REGISTRY = '$REGISTRY'

try:
    with open(DAEMON_JSON, 'r') as f:
        config = json.load(f)
except Exception as e:
    config = {}

if 'insecure-registries' not in config:
    config['insecure-registries'] = []

if REGISTRY not in config['insecure-registries']:
    config['insecure-registries'].append(REGISTRY)

with open(DAEMON_JSON, 'w') as f:
    json.dump(config, f, indent=4)
EOF
        fi
    elif command -v jq &> /dev/null; then
        # Fallback to jq if Python not available
        echo "⚠️  Using jq (Python preferred)"
        if [ "$DOCKER_TYPE" = "snap" ]; then
            sudo jq --arg reg "$REGISTRY" '.insecure-registries = ((.insecure-registries // []) + [$reg] | unique)' "$DAEMON_JSON" > "${DAEMON_JSON}.tmp" && sudo mv "${DAEMON_JSON}.tmp" "$DAEMON_JSON"
        else
            jq --arg reg "$REGISTRY" '.insecure-registries = ((.insecure-registries // []) + [$reg] | unique)' "$DAEMON_JSON" > "${DAEMON_JSON}.tmp" && mv "${DAEMON_JSON}.tmp" "$DAEMON_JSON"
        fi
    else
        echo "❌ Neither python3 nor jq found. Cannot update configuration."
        exit 1
    fi
else
    echo "📝 Creating new $DAEMON_JSON"
    if [ "$DOCKER_TYPE" = "snap" ]; then
        sudo tee "$DAEMON_JSON" > /dev/null << EOF
{
  "insecure-registries": ["${REGISTRY}"]
}
EOF
    else
        cat > "$DAEMON_JSON" << EOF
{
  "insecure-registries": ["${REGISTRY}"]
}
EOF
    fi
fi

echo ""
echo "✅ Configuration updated:"
cat "$DAEMON_JSON"
echo ""

# Restart Docker
echo "🔄 Restarting Docker daemon..."
if [ "$DOCKER_TYPE" = "snap" ]; then
    if sudo snap restart docker; then
        echo "✅ Docker restarted successfully"
    else
        echo "⚠️  Failed to restart Docker. Please restart manually:"
        echo "   sudo snap restart docker"
        exit 1
    fi
else
    if sudo systemctl restart docker; then
        echo "✅ Docker restarted successfully"
    else
        echo "⚠️  Failed to restart Docker. Please restart manually:"
        echo "   sudo systemctl restart docker"
        exit 1
    fi
fi

echo ""
echo "=========================================="
echo "✅ Configuration Complete!"
echo "=========================================="
echo ""
echo "You can now push/pull images from: ${REGISTRY}"
echo ""
echo "Test it:"
echo "  docker pull ${REGISTRY}/test:latest"
echo ""

