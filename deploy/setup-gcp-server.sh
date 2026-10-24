#!/usr/bin/env bash
# ==============================================================================
# Ayoj Backend - GCP Compute Engine e2-micro Automated Server Setup
# Target OS: Ubuntu 24.04 LTS Minimal (or 22.04 LTS)
# Run as: sudo bash setup-gcp-server.sh
# ==============================================================================

set -euo pipefail

if [ "$EUID" -ne 0 ]; then
  echo "❌ Error: This script must be run as root or with sudo!"
  exit 1
fi

TARGET_USER="${SUDO_USER:-$(whoami)}"
TARGET_HOME=$(getent passwd "$TARGET_USER" | cut -d: -f6)
APP_DIR="/opt/ayoj-backend"

echo "============================================================"
echo "⚡ Starting Ayoj Server Setup for GCP e2-micro Instance"
echo "Target User: $TARGET_USER"
echo "Install Directory: $APP_DIR"
echo "============================================================"

# Step 1: System Packages Update
echo "🔄 Updating APT packages..."
apt-get update -qq
DEBIAN_FRONTEND=noninteractive apt-get upgrade -y -qq
apt-get install -y -qq \
  ca-certificates \
  curl \
  gnupg \
  lsb-release \
  ufw \
  git \
  htop \
  jq

# Step 2: Configure 4 GB Swap File (Critical for 1 GB RAM e2-micro instance)
echo "💾 Checking and configuring Swap space..."
if [ -f /swapfile ] || swapon --show | grep -q "/swapfile"; then
  echo "✅ /swapfile already exists. Skipping swap creation."
else
  echo "Creating 4 GB swapfile (this ensures Rails + Puma run reliably without OOM)..."
  fallocate -l 4G /swapfile || dd if=/dev/zero of=/swapfile bs=1M count=4096
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile

  if ! grep -q "/swapfile" /etc/fstab; then
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
  fi
  echo "✅ 4 GB Swap file configured and mounted."
fi

# Step 3: Kernel Memory Tuning
echo "⚙️ Tuning kernel memory parameters (swappiness=10, vfs_cache_pressure=50)..."
cat <<EOF > /etc/sysctl.d/99-ayoj-swap.conf
vm.swappiness = 10
vm.vfs_cache_pressure = 50
EOF
sysctl -p /etc/sysctl.d/99-ayoj-swap.conf >/dev/null

# Step 4: Install Docker Engine & Compose Plugin (Official Repo)
echo "🐳 Installing Docker Engine and Docker Compose Plugin..."
install -m 0755 -d /etc/apt/keyrings
if [ ! -f /etc/apt/keyrings/docker.gpg ]; then
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  chmod a+r /etc/apt/keyrings/docker.gpg
fi

ARCH=$(dpkg --print-architecture)
CODENAME=$(lsb_release -cs)

echo "deb [arch=${ARCH} signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu ${CODENAME} stable" > /etc/apt/sources.list.d/docker.list

apt-get update -qq
apt-get install -y -qq docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Enable and start Docker
systemctl enable docker
systemctl start docker

# Add user to docker group
usermod -aG docker "$TARGET_USER"
echo "✅ Docker installed and user '$TARGET_USER' added to docker group."

# Step 5: Configure Docker Daemon Log Rotation (Prevents disk filling up on 30GB disk)
echo "📝 Configuring Docker log rotation..."
cat <<EOF > /etc/docker/daemon.json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
EOF
systemctl restart docker

# Step 6: Configure UFW Firewall
echo "🛡️ Configuring UFW Firewall..."
ufw default deny incoming
ufw default allow outgoing
ufw allow OpenSSH
ufw allow 80/tcp comment 'HTTP (Caddy SSL challenge & redirect)'
ufw allow 443/tcp comment 'HTTPS (Caddy)'
ufw allow 443/udp comment 'HTTP/3 QUIC (Caddy)'
ufw --force enable
echo "✅ Firewall active: OpenSSH (22), HTTP (80), HTTPS (443/tcp+udp) allowed."

# Step 7: Create Application Directory
echo "📁 Setting up $APP_DIR..."
mkdir -p "$APP_DIR"
chown -R "$TARGET_USER":"$TARGET_USER" "$APP_DIR"

# Copy deployment template files if script is running from the repository
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [ -f "$SCRIPT_DIR/docker-compose.prod.yml" ]; then
  cp "$SCRIPT_DIR/docker-compose.prod.yml" "$APP_DIR/"
  cp "$SCRIPT_DIR/Caddyfile" "$APP_DIR/"
  cp "$SCRIPT_DIR/deploy.sh" "$APP_DIR/"
  chmod +x "$APP_DIR/deploy.sh"
  if [ ! -f "$APP_DIR/.env" ] && [ -f "$SCRIPT_DIR/.env.example" ]; then
    cp "$SCRIPT_DIR/.env.example" "$APP_DIR/.env.example"
  fi
  chown -R "$TARGET_USER":"$TARGET_USER" "$APP_DIR"
fi

echo "============================================================"
echo "🎉 Server bootstrap completed successfully!"
echo "============================================================"
echo ""
echo "Next Steps:"
echo "1. Verify swap: free -h"
echo "2. Edit environment variables:"
echo "   cp $APP_DIR/.env.example $APP_DIR/.env"
echo "   nano $APP_DIR/.env"
echo "3. Add GitHub Container Registry authentication (if private image):"
echo "   docker login ghcr.io -u <YOUR_GITHUB_USERNAME>"
echo "4. Point your DNS A-record (api.ayoj.in) to this server's external IP."
echo "5. Run initial deployment: $APP_DIR/deploy.sh"
echo "============================================================"
