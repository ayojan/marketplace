# Docker Configuration Directory

This directory contains Nginx configurations and environment templates for the Ayoj Marketplace container stack.

## Structure

```
docker/
├── nginx/
│   ├── local.conf        # Nginx configuration for Linux development
│   ├── local_macos.conf  # Nginx configuration for macOS / Colima development
│   └── prod.conf         # Production Nginx reverse proxy (Cloudflare Real-IP, Gzip, SSL proxying)
└── README.md             # This file
```

## Documentation Links

* 🐳 **[Full Docker Architecture & Operations Guide](../docs/development/DOCKER.md)**: Details container specs, memory allocations, Compose commands, and SSH tunneling.
* 🚀 **[Production Deployment Guide](../docs/deployment/DEPLOYMENT.md)**: Step-by-step setup on Oracle Cloud Infrastructure (OCI Always Free VM) behind Cloudflare.
* 🔀 **[Reverse Proxy Documentation](../docs/REVERSE_PROXY.md)**: Deep dive into URL rewriting, edge caching, and unified domain routing.
