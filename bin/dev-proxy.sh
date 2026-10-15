#!/usr/bin/env bash
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CONF="$DIR/docker/nginx/local_macos.conf"

check_hosts() {
  if ! grep -q "ayoj.test" /etc/hosts; then
    echo "⚠️  Missing ayoj.test entries in /etc/hosts."
    echo "Run the following command to add them:"
    echo ""
    echo "  sudo sh -c 'echo \"127.0.0.1 ayoj.test admin.ayoj.test api.ayoj.test\" >> /etc/hosts'"
    echo ""
    return 1
  fi
  echo "✅ /etc/hosts entries verified."
  return 0
}

start_proxy() {
  check_hosts || true
  echo "🚀 Starting Nginx local proxy on port 80..."
  sudo nginx -c "$CONF"
  echo "✅ Nginx started successfully!"
  echo ""
  echo "  👉 Customer Frontend : http://ayoj.test"
  echo "  👉 Admin Panel       : http://admin.ayoj.test"
  echo "  👉 Backend API       : http://api.ayoj.test"
  echo ""
}

stop_proxy() {
  echo "🛑 Stopping Nginx..."
  sudo nginx -s stop || true
  echo "✅ Nginx stopped."
}

reload_proxy() {
  echo "🔄 Reloading Nginx configuration..."
  sudo nginx -s reload
  echo "✅ Reloaded."
}

status_proxy() {
  if pgrep nginx > /dev/null; then
    echo "✅ Nginx proxy is RUNNING."
    ps aux | grep "[n]ginx"
  else
    echo "⚪ Nginx proxy is NOT running."
  fi
}

case "$1" in
  start)
    start_proxy
    ;;
  stop)
    stop_proxy
    ;;
  reload)
    reload_proxy
    ;;
  status)
    status_proxy
    ;;
  check-hosts)
    check_hosts
    ;;
  *)
    echo "Usage: $0 {start|stop|reload|status|check-hosts}"
    exit 1
    ;;
esac
