# Trading Portfolio Dashboard

A modern, responsive React TypeScript dashboard for real-time trading portfolio management with multi-bot support (Kalshi, Crypto, Grid Trading).

## Features

✅ **Real-time Portfolio Tracking**
- Live P&L calculations and ROI metrics
- Per-bot capital allocation (Kalshi, Crypto, Grid)
- Interactive P&L charts and allocation pie charts
- 30-day historical trend analysis

✅ **Transaction Management**
- Complete trade history with detailed metrics
- Sortable columns and filtering by bot
- Export to CSV for analysis
- Win rate and P&L statistics

✅ **Bot Control Panel**
- Real-time bot status monitoring
- Pause/Resume/Restart controls
- Manual cycle triggering
- Git pull and code deployment
- Last cycle metrics and performance data

✅ **Log Viewer**
- Real-time log streaming with 10s auto-refresh
- Search by message content
- Filter by bot and log level (DEBUG/INFO/WARNING/ERROR)
- Sticky header for easy scanning

✅ **User Settings**
- GitHub OAuth authentication
- API endpoint configuration
- Theme preferences (Dark/Light)
- Notification settings (Telegram, Email)
- User profile management

✅ **Security & Performance**
- JWT token-based authentication
- Secure localStorage for credentials
- Error boundaries and error handling
- Responsive design (mobile/tablet/desktop)
- Real-time polling with configurable intervals

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **React Router v6** - Client-side routing
- **Tailwind CSS** - Styling
- **Recharts** - Data visualization
- **Vite** - Build tool
- **Axios** - HTTP client

## Project Structure

```
dashboard/
├── src/
│   ├── types/
│   │   └── api.ts              # TypeScript interfaces for API
│   ├── hooks/
│   │   ├── useAuth.ts          # GitHub OAuth and authentication
│   │   └── useApi.ts           # API polling and data fetching
│   ├── pages/
│   │   ├── Login.tsx           # GitHub OAuth login page
│   │   ├── Portfolio.tsx       # Main dashboard with P&L chart
│   │   ├── Transactions.tsx    # Trade history and analytics
│   │   ├── Logs.tsx            # Real-time log viewer
│   │   ├── BotControl.tsx      # Bot management panel
│   │   └── Settings.tsx        # User settings and preferences
│   ├── styles/
│   │   └── tailwind.css        # Tailwind directives
│   ├── App.tsx                 # Main routing and layout
│   └── main.tsx                # React entry point
├── index.html                  # HTML template
├── vite.config.ts             # Vite configuration
├── tsconfig.json              # TypeScript configuration
├── tailwind.config.js         # Tailwind configuration
├── postcss.config.js          # PostCSS configuration
├── package.json               # Dependencies
└── .env                       # Environment variables
```

## Getting Started

### Prerequisites

- Node.js 16+ and npm/yarn
- API server running (see API_URL configuration)
- GitHub OAuth credentials (for authentication)

### Installation

1. **Clone the site repository:**
   ```bash
   git clone https://github.com/mfgroupllc/mfgroupllc.github.io.git
   cd mfgroupllc.github.io/dashboard
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env and set VITE_API_URL to your API server
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

5. **Open in browser:**
   ```
   http://localhost:5173/dashboard
   ```

## Configuration

### Environment Variables

Create a `.env` file:

```env
# API Backend URL (required)
VITE_API_URL=http://localhost:8000

# For production, use your VPS IP or domain:
# VITE_API_URL=https://your-vps-ip:8000
# VITE_API_URL=https://your-domain:8000
```

### API Endpoint Configuration

The dashboard communicates with the trading bot API at the endpoint specified in `VITE_API_URL`. Ensure your API server has:

- CORS configured to allow dashboard origin
- GitHub OAuth endpoints: `/api/auth/github/login`, `/api/auth/me`, `/api/auth/logout`
- Portfolio endpoints: `/api/portfolio`, `/api/positions`, `/api/transactions`
- Bot endpoints: `/api/bots`, `/api/bots/{name}/pause`, `/api/bots/{name}/resume`, etc.
- Log endpoints: `/api/logs`

See `docs/API_INTEGRATION.md` for complete API specification.

## Development

### Build for Production

```bash
npm run build
```

Output is in `dist/` directory. Configure your web server to serve this directory at `/dashboard/`.

### Type Checking

```bash
npm run type-check
```

### Code Formatting

```bash
npm run format
```

## Deployment

### GitHub Pages

The dashboard is designed to deploy to GitHub Pages at `https://username.github.io/dashboard/`.

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Deploy using GitHub Actions:**

   Create `.github/workflows/deploy-dashboard.yml`:
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

### Custom Domain

If deploying to a custom domain with CORS:

1. Update `VITE_API_URL` in `.env` to your API server
2. Ensure API server CORS headers include your dashboard domain
3. Configure GitHub Pages or your host to serve from your domain

## API Integration

### Authentication Flow

1. User clicks "Login with GitHub"
2. Redirects to `/api/auth/github/login`
3. Backend handles OAuth with GitHub
4. Returns JWT token and user info
5. Dashboard stores token in localStorage
6. All subsequent API calls include `Authorization: Bearer {token}` header

### Data Polling

- Portfolio: 30 seconds
- Bot Status: 30 seconds
- Logs: 10 seconds (when log page is active)
- Transactions: Manual fetch with pagination

### Error Handling

- Network errors show user-friendly messages
- 401 Unauthorized triggers logout and redirect to login
- API errors display in-context with retry buttons
- Global error boundary catches React errors

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance Optimization

- Code splitting with React Router
- Lazy loading of pages
- Memoization of expensive computations
- Efficient polling intervals (30s default)
- Tailwind CSS tree-shaking
- Minified production build

## Troubleshooting

### Dashboard not loading?
- Check browser console for errors (F12)
- Verify API URL in .env: `curl http://your-api:8000/health`
- Check CORS configuration on API

### OAuth login not working?
- Verify GitHub OAuth credentials in API `.env`
- Check redirect URI matches exactly
- Ensure API is running and accessible

### No data showing?
- Verify bot state files exist on VPS
- Check API endpoints are working: `curl http://your-api:8000/api/portfolio`
- Review logs: `ssh your-vps 'docker logs market-api'`

### Slow performance?
- Check network tab in browser DevTools
- Reduce polling intervals if API is slow
- Verify API server has sufficient resources

## Contributing

1. Create a feature branch
2. Make changes with proper TypeScript types
3. Test locally with `npm run dev`
4. Ensure types check: `npm run type-check`
5. Commit and push to GitHub
6. GitHub Actions will build and deploy automatically

## License

See LICENSE in parent directory.

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review API integration docs
3. Check browser console for error details
4. Review bot logs on VPS

---

**Dashboard Version:** 1.0.0
**Last Updated:** February 2026
**API Version:** 1.0.0
