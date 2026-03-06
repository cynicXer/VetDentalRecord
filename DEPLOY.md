# GCP Deployment Guide

## VM Spec
- Machine type: `e2-small` (2 vCPU, 2GB RAM)
- OS: Ubuntu 22.04 LTS
- Firewall: allow TCP 80 + 443 inbound; port 3000 NOT externally exposed

## Initial VM Setup

```bash
# Install Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs nginx certbot python3-certbot-nginx

# Create app user and directory
sudo useradd -r -s /bin/false vetapp
sudo mkdir -p /opt/vetdental/server
sudo chown -R vetapp:vetapp /opt/vetdental
```

## Deploy (First Time)

```bash
# Local: build the client
npm run build

# Upload server directory to VM
gcloud compute scp --recurse ./server/ <VM_NAME>:/opt/vetdental/server/

# On VM: install server deps
cd /opt/vetdental/server && sudo -u vetapp npm install --production

# Install systemd service
sudo cp vetdental.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable vetdental
sudo systemctl start vetdental

# Verify
sudo systemctl status vetdental
curl http://localhost:3000
```

## nginx Reverse Proxy

Create `/etc/nginx/sites-available/vetdental`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /assets/ {
        proxy_pass http://localhost:3000/assets/;
        proxy_cache_valid 200 1y;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/vetdental /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# HTTPS (requires DNS pointing to VM)
sudo certbot --nginx -d your-domain.com
```

## Redeploy (client changes only)

```bash
# Local
npm run build

# Upload only public/ (no server restart needed)
gcloud compute scp --recurse ./server/public/ <VM_NAME>:/opt/vetdental/server/public/
```

## Redeploy (server/index.js changed)

```bash
gcloud compute scp ./server/index.js <VM_NAME>:/opt/vetdental/server/index.js
gcloud compute ssh <VM_NAME> -- "sudo systemctl restart vetdental"
```

## Verify Production

```bash
sudo systemctl status vetdental
curl http://localhost:3000
curl https://your-domain.com
```
