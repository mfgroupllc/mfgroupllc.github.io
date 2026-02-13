# Dashboard Deployment Guide

Complete instructions for deploying the React trading dashboard to production.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [GitHub Pages Deployment](#github-pages-deployment)
4. [Custom Domain Deployment](#custom-domain-deployment)
5. [API Integration](#api-integration)
6. [Security Configuration](#security-configuration)
7. [Monitoring and Maintenance](#monitoring-and-maintenance)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

- **Node.js:** Version 16 or higher
- **npm or yarn:** Package manager
- **Git:** Version control
- **GitHub Account:** For OAuth and GitHub Pages
- **Trading Bot API:** Running and accessible at a known URL
- **GitHub OAuth App:** For authentication

## Local Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/mfgroupllc/mfgroupllc.github.io.git
cd mfgroupllc.github.io/dashboard
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and set the API URL:

```env
VITE_API_URL=http://localhost:8000
```

For development against a remote VPS:

```env
VITE_API_URL=https://your-vps-ip:8000
# or with domain
VITE_API_URL=https://api.your-domain.com
```

### 4. Start Development Server

```bash
npm run dev
```

Open http://localhost:5173/dashboard in your browser.

### 5. Test Authentication

1. Click "Login with GitHub"
2. You'll be redirected to the API's GitHub OAuth handler
3. After successful OAuth, you should return to the dashboard
4. Verify you can see portfolio data

## GitHub Pages Deployment

### Automatic Deployment with GitHub Actions

GitHub Actions will automatically build and deploy when you push to the main branch.

#### 1. Verify GitHub Actions Workflow

The workflow file should exist at `.github/workflows/deploy-dashboard.yml`:

```yaml
name: Deploy Dashboard

on:
  push:
    branches: [main]
    paths: [dashboard/**]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install and build
        run: |
          cd dashboard
          npm ci
          npm run build

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dashboard/dist
          destination_dir: dashboard
```

#### 2. Enable GitHub Pages

1. Go to https://github.com/mfgroupllc/mfgroupllc.github.io/settings/pages
2. Under "Source", select "Deploy from a branch"
3. Select "gh-pages" branch and "/ (root)" folder
4. Click Save

#### 3. Verify Deployment

After pushing, check:

1. **GitHub Actions:** https://github.com/mfgroupllc/mfgroupllc.github.io/actions
2. **GitHub Pages:** https://mfgroupllc.github.io/dashboard/

The dashboard should be live at: https://mfgroupllc.github.io/dashboard/

### Manual Build and Deploy

If you prefer to build and deploy manually:

```bash
# Build the project
npm run build

# The dist/ folder contains production build
ls dist/

# GitHub Pages automatically deploys from gh-pages branch
# Push manually to trigger deployment via Actions
git add dashboard/
git commit -m "Dashboard update"
git push origin main
```

## Custom Domain Deployment

If you want to serve the dashboard on a custom domain instead of GitHub Pages:

### Option 1: Deploy to Your VPS

#### 1. Build Dashboard

```bash
npm run build
```

#### 2. Copy to VPS

```bash
# On your local machine
rsync -avz dist/ username@your-vps:/var/www/dashboard/

# Or via SCP
scp -r dist/* username@your-vps:/var/www/dashboard/
```

#### 3. Configure Web Server (Nginx)

Create `/etc/nginx/sites-available/dashboard`:

```nginx
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name dashboard.your-domain.com;

    ssl_certificate /etc/letsencrypt/live/dashboard.your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/dashboard.your-domain.com/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    root /var/www/dashboard;
    index index.html;

    # React Router: redirect all to index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # No cache for index.html
    location = /index.html {
        expires -1;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    # Proxy API requests to trading bot API
    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # CORS headers for API
    add_header 'Access-Control-Allow-Origin' 'https://dashboard.your-domain.com' always;
    add_header 'Access-Control-Allow-Credentials' 'true' always;
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name dashboard.your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

#### 4. Enable and Restart Nginx

```bash
sudo ln -s /etc/nginx/sites-available/dashboard /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 5. Set up SSL Certificate

```bash
sudo certbot certonly --nginx -d dashboard.your-domain.com
```

### Option 2: Deploy to AWS S3 + CloudFront

#### 1. Create S3 Bucket

```bash
aws s3 mb s3://dashboard.your-domain.com --region us-east-1
```

#### 2. Upload Build Files

```bash
aws s3 sync dist/ s3://dashboard.your-domain.com --delete
```

#### 3. Create CloudFront Distribution

- Origin: S3 bucket
- Default Root Object: `index.html`
- Error Responses: Map 404 to `/index.html` (HTTP 200)
- Create certificate in ACM for your domain
- Set CNAME to your domain

#### 4. Update Route53 DNS

Point your domain to the CloudFront distribution.

## API Integration

### Required API Endpoints

The dashboard requires these endpoints to be implemented on your trading bot API:

#### Authentication
- `GET /api/auth/github/login` - GitHub OAuth redirect
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/logout` - Logout

#### Portfolio
- `GET /api/portfolio` - Get portfolio summary
- `GET /api/portfolio/pnl-history` - Get historical P&L

#### Positions
- `GET /api/positions` - Get all open positions
- `GET /api/positions/{id}` - Get specific position

#### Transactions
- `GET /api/transactions` - Get transaction history (paginated)

#### Bots
- `GET /api/bots` - Get bot status
- `POST /api/bots/{name}/pause` - Pause a bot
- `POST /api/bots/{name}/resume` - Resume a bot
- `POST /api/bots/{name}/restart` - Restart a bot
- `POST /api/bots/{name}/scan` - Trigger manual scan

#### Logs
- `GET /api/logs` - Get logs with filtering

#### Deployment
- `POST /api/deploy/git-pull` - Pull latest code and restart

See the trading bot API documentation for full endpoint specifications.

### CORS Configuration

Your API must allow requests from the dashboard:

```python
# In your FastAPI app
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Local dev
        "http://localhost:3000",  # Alt dev
        "https://mfgroupllc.github.io",  # GitHub Pages
        "https://dashboard.your-domain.com",  # Custom domain
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Security Configuration

### 1. GitHub OAuth App Setup

1. Go to https://github.com/settings/developers
2. Click "New OAuth App"
3. Fill in the form:
   - **Application name:** Trading Dashboard
   - **Homepage URL:** https://mfgroupllc.github.io/dashboard/
   - **Authorization callback URL:** https://your-api:8000/api/auth/github/callback
4. Copy Client ID and Client Secret
5. Add to your API's `.env`:

```env
GITHUB_CLIENT_ID=your-client-id
GITHUB_CLIENT_SECRET=your-client-secret
GITHUB_CALLBACK_URL=https://your-api:8000/api/auth/github/callback
```

### 2. Environment Variables

Ensure these are set on your API server:

```env
# GitHub OAuth
GITHUB_CLIENT_ID=xxx
GITHUB_CLIENT_SECRET=xxx
GITHUB_CALLBACK_URL=https://your-api:8000/api/auth/github/callback

# JWT
JWT_SECRET_KEY=your-random-secret-key-here-min-32-chars
JWT_EXPIRATION_HOURS=24

# CORS
CORS_ORIGINS=https://mfgroupllc.github.io,https://dashboard.your-domain.com

# API
API_HOST=0.0.0.0
API_PORT=8000
API_LOG_LEVEL=INFO
```

### 3. Secure Token Storage

The dashboard stores the JWT token in localStorage. To enhance security:

1. **HTTP Only Cookies (Recommended):** Configure your API to return tokens as HTTP-only cookies instead
2. **Token Rotation:** Implement refresh token mechanism
3. **HTTPS Only:** Always use HTTPS in production
4. **Token Expiration:** Set reasonable expiration times (1-24 hours)

### 4. Content Security Policy

Add CSP headers:

```nginx
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'wasm-unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' https: data:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none';" always;
```

## Monitoring and Maintenance

### 1. Health Checks

Regularly verify the dashboard and API are working:

```bash
# Check dashboard
curl -I https://mfgroupllc.github.io/dashboard/

# Check API
curl -I https://your-api:8000/health
```

### 2. Error Tracking

Monitor errors with Sentry (optional):

```bash
# Add to .env
VITE_SENTRY_DSN=https://your-sentry-dsn
```

Then in the app:
```typescript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: "production",
});
```

### 3. Logs and Debugging

Check API logs:

```bash
# If running in Docker
docker logs market-api -f

# If running systemd
journalctl -u trading-api -f
```

Check browser console:

1. Open dashboard in browser
2. Press F12 for DevTools
3. Check Console tab for errors
4. Check Network tab for API calls

### 4. Performance Monitoring

Monitor polling performance:

```bash
# In browser Console
localStorage.setItem('DEBUG_POLLING', 'true')
```

Watch for excessive API calls:

```bash
# Check API logs for frequency
docker logs market-api | grep "GET /api/portfolio"
```

### 5. Update Process

To update the dashboard:

```bash
cd dashboard
git pull origin main
npm install
npm run build
# GitHub Actions will automatically deploy
```

## Troubleshooting

### Dashboard Blank Page

**Symptoms:** White screen, no content

**Solutions:**
1. Check browser console (F12) for JavaScript errors
2. Verify base URL is correct in vite.config.ts (`base: '/dashboard/'`)
3. Clear browser cache: Ctrl+Shift+Delete
4. Check network tab - all assets should return 200

### OAuth Login Not Working

**Symptoms:** "Login with GitHub" button does nothing or shows error

**Solutions:**
1. Verify GitHub OAuth app credentials in API `.env`
2. Check callback URL exactly matches: https://your-api:8000/api/auth/github/callback
3. Verify API server is running: `curl http://your-api:8000/health`
4. Check API logs: `docker logs market-api | tail -50`
5. Check CORS headers on API

### No Portfolio Data

**Symptoms:** Dashboard loads but no P&L or positions shown

**Solutions:**
1. Verify API is accessible: `curl http://your-api:8000/api/portfolio`
2. Check bot state files exist: `ls bots/kalshi/state/`
3. Run bot once to generate state: `python bots/kalshi/scripts/run_quick.py --once`
4. Check API response: `curl -H "Authorization: Bearer {token}" http://your-api:8000/api/portfolio`
5. Review API logs for errors

### API Connection Timeout

**Symptoms:** Dashboard shows loading spinner indefinitely

**Solutions:**
1. Verify API URL in browser DevTools Network tab
2. Check API server is running and listening
3. Check firewall isn't blocking port (8000)
4. If remote API: verify SSH tunnel or public IP access
5. Check API logs for crash: `docker logs market-api`

### GitHub Pages 404 Error

**Symptoms:** https://mfgroupllc.github.io/dashboard/ returns 404

**Solutions:**
1. Verify gh-pages branch exists: `git branch -a`
2. Check GitHub Actions workflow succeeded
3. Verify destination_dir is 'dashboard' in workflow
4. Force rebuild: `git push origin main --force-with-lease`
5. Check settings: https://github.com/mfgroupllc/mfgroupllc.github.io/settings/pages

### High API Latency

**Symptoms:** Dashboard sluggish, slow updates

**Solutions:**
1. Check API server resources: CPU, memory, disk
2. Increase polling intervals in useApi.ts
3. Verify API database queries are optimized
4. Check network latency: `ping your-api`
5. Review API logs for slow queries

## Production Checklist

- [ ] GitHub OAuth app created and credentials configured
- [ ] API server running and accessible
- [ ] SSL/TLS certificate valid and not expiring soon
- [ ] CORS configured correctly on API
- [ ] DNS records pointing to correct servers
- [ ] GitHub Pages or web server configured
- [ ] Environment variables set correctly
- [ ] Database backups automated
- [ ] Error tracking (Sentry) configured
- [ ] Performance monitoring enabled
- [ ] Health checks set up
- [ ] Documentation updated
- [ ] Team notified of deployment
- [ ] Smoke tests passed (login, view portfolio, etc.)

---

**Last Updated:** February 2026
**Dashboard Version:** 1.0.0
**Deployment Guide Version:** 1.0.0
