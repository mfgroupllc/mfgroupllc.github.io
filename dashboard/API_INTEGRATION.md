# Dashboard API Integration Specification

Complete API endpoint specification for the trading dashboard backend.

## Base URL

```
http://localhost:8000  (Development)
https://your-vps-ip:8000  (Production VPS)
https://your-domain.com  (Custom domain)
```

All endpoints require JWT token in Authorization header:

```
Authorization: Bearer {token}
```

## Authentication Endpoints

### GET /api/auth/github/login

Redirects user to GitHub OAuth login page.

**Parameters:**
- `callback_url` (optional): URL to redirect to after successful authentication

**Returns:**
- Redirect to GitHub OAuth authorization page

**Example:**
```bash
curl -i "http://localhost:8000/api/auth/github/login"
```

### GET /api/auth/github/callback

GitHub OAuth callback endpoint (internal use).

**Parameters:**
- `code`: Authorization code from GitHub
- `state`: CSRF protection state

**Returns:**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer",
  "expires_in": 86400,
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "github_username": "octocat",
    "github_avatar_url": "https://avatars.githubusercontent.com/u/1?v=4",
    "created_at": "2026-02-12T19:45:00Z",
    "last_login": "2026-02-12T19:45:00Z"
  }
}
```

### GET /api/auth/me

Get current authenticated user profile.

**Headers:**
```
Authorization: Bearer {token}
```

**Returns:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "github_username": "octocat",
  "github_avatar_url": "https://avatars.githubusercontent.com/u/1?v=4",
  "created_at": "2026-02-12T19:45:00Z",
  "last_login": "2026-02-12T19:45:00Z"
}
```

**Status Codes:**
- `200` - Success
- `401` - Unauthorized (invalid/expired token)
- `500` - Server error

### POST /api/auth/logout

Logout current user and invalidate token.

**Headers:**
```
Authorization: Bearer {token}
```

**Returns:**
```json
{
  "message": "Successfully logged out"
}
```

---

## Portfolio Endpoints

### GET /api/portfolio

Get portfolio summary with P&L and capital breakdown.

**Headers:**
```
Authorization: Bearer {token}
```

**Returns:**
```json
{
  "total_capital": 500.00,
  "current_value": 542.35,
  "total_profit_loss": 42.35,
  "roi_percent": 8.47,
  "daily_profit_loss": 5.20,
  "daily_roi_percent": 1.04,
  "kalshi_balance": 105.32,
  "kalshi_positions_value": 68.50,
  "crypto_balance": 175.54,
  "crypto_positions_value": 148.91,
  "grid_balance": 100.00,
  "grid_positions_value": 75.00,
  "last_updated": "2026-02-12T19:45:00Z"
}
```

**Status Codes:**
- `200` - Success
- `401` - Unauthorized
- `500` - Server error

### GET /api/portfolio/pnl-history

Get historical P&L data for charting.

**Parameters:**
- `days` (optional): Number of days to retrieve (default: 30)
- `bot` (optional): Filter by bot (kalshi/crypto/grid)

**Headers:**
```
Authorization: Bearer {token}
```

**Query Example:**
```
GET /api/portfolio/pnl-history?days=30&bot=kalshi
```

**Returns:**
```json
{
  "items": [
    {
      "timestamp": "2026-02-12T00:00:00Z",
      "date": "Feb 12",
      "total_value": 505.00,
      "profit_loss": 5.00,
      "roi_percent": 1.00,
      "kalshi_value": 105.00,
      "crypto_value": 200.00,
      "grid_value": 200.00
    },
    {
      "timestamp": "2026-02-11T00:00:00Z",
      "date": "Feb 11",
      "total_value": 500.00,
      "profit_loss": 0.00,
      "roi_percent": 0.00,
      "kalshi_value": 100.00,
      "crypto_value": 200.00,
      "grid_value": 200.00
    }
  ],
  "total": 30,
  "period_days": 30
}
```

---

## Positions Endpoints

### GET /api/positions

Get all open positions across all bots.

**Parameters:**
- `bot` (optional): Filter by bot (kalshi/crypto/grid)
- `status` (optional): Filter by status (open/closed/pending)

**Headers:**
```
Authorization: Bearer {token}
```

**Returns:**
```json
{
  "items": [
    {
      "id": "pos-1",
      "bot": "kalshi",
      "market_id": "market-123",
      "market_name": "Will Bitcoin exceed $100k by Dec 2025?",
      "entry_price": 0.45,
      "current_price": 0.68,
      "quantity": 100,
      "side": "yes",
      "value": 68.00,
      "unrealized_pnl": 23.00,
      "unrealized_pnl_percent": 51.11,
      "entry_time": "2026-02-07T10:30:00Z",
      "last_updated": "2026-02-12T19:45:00Z"
    }
  ],
  "total": 5,
  "page": 0,
  "page_size": 100,
  "has_more": false
}
```

### GET /api/positions/{id}

Get specific position details.

**Headers:**
```
Authorization: Bearer {token}
```

**Returns:**
```json
{
  "id": "pos-1",
  "bot": "kalshi",
  "market_id": "market-123",
  "market_name": "Will Bitcoin exceed $100k by Dec 2025?",
  "entry_price": 0.45,
  "current_price": 0.68,
  "quantity": 100,
  "side": "yes",
  "value": 68.00,
  "unrealized_pnl": 23.00,
  "unrealized_pnl_percent": 51.11,
  "entry_time": "2026-02-07T10:30:00Z",
  "last_updated": "2026-02-12T19:45:00Z",
  "entry_details": {
    "order_id": "order-123",
    "reason": "High edge opportunity - 12% expected value",
    "confidence": 0.92
  }
}
```

---

## Transactions Endpoints

### GET /api/transactions

Get transaction history with pagination and filtering.

**Parameters:**
- `page` (optional): Page number (0-indexed, default: 0)
- `limit` (optional): Items per page (default: 50, max: 500)
- `bot` (optional): Filter by bot (kalshi/crypto/grid)
- `status` (optional): Filter by status (open/closed/settled/pending)
- `search` (optional): Search in market names
- `sort_by` (optional): Sort column (timestamp/profit_loss/roi_percent)
- `sort_dir` (optional): Sort direction (asc/desc, default: desc)

**Headers:**
```
Authorization: Bearer {token}
```

**Query Example:**
```
GET /api/transactions?page=0&limit=50&bot=kalshi&status=closed&sort_by=profit_loss&sort_dir=desc
```

**Returns:**
```json
{
  "items": [
    {
      "id": "tx-1",
      "timestamp": "2026-02-12T15:30:00Z",
      "bot": "kalshi",
      "market_id": "market-123",
      "market_name": "Will Bitcoin exceed $100k by Dec 2025?",
      "side": "yes",
      "quantity": 100,
      "entry_price": 0.45,
      "exit_price": 0.68,
      "profit_loss": 23.00,
      "profit_loss_percent": 51.11,
      "status": "closed"
    }
  ],
  "total": 156,
  "page": 0,
  "page_size": 50,
  "has_more": true
}
```

---

## Logs Endpoints

### GET /api/logs

Get logs with filtering and searching.

**Parameters:**
- `bot` (optional): Filter by bot (kalshi/crypto/grid/system)
- `level` (optional): Filter by level (DEBUG/INFO/WARNING/ERROR/CRITICAL)
- `search` (optional): Search in message content
- `limit` (optional): Maximum logs to return (default: 100, max: 1000)
- `start_time` (optional): ISO 8601 datetime to start from

**Headers:**
```
Authorization: Bearer {token}
```

**Query Example:**
```
GET /api/logs?bot=kalshi&level=ERROR&limit=50&search=timeout
```

**Returns:**
```json
{
  "items": [
    {
      "timestamp": "2026-02-12T19:45:30Z",
      "bot": "kalshi",
      "level": "INFO",
      "message": "Cycle started - scanning 150 markets",
      "module": "runner",
      "function": "run_strategy"
    },
    {
      "timestamp": "2026-02-12T19:45:28Z",
      "bot": "kalshi",
      "level": "WARNING",
      "message": "Edge liquidity below threshold: market-123",
      "module": "validation",
      "function": "check_liquidity"
    }
  ],
  "total": 2547,
  "page": 0,
  "page_size": 100,
  "has_more": true
}
```

---

## Bot Endpoints

### GET /api/bots

Get status of all bots.

**Headers:**
```
Authorization: Bearer {token}
```

**Returns:**
```json
[
  {
    "name": "kalshi",
    "is_running": true,
    "is_paused": false,
    "last_cycle_time": "2026-02-12T19:40:00Z",
    "last_cycle_duration_ms": 1250,
    "last_trades_count": 2,
    "total_trades_today": 8,
    "error_message": null,
    "next_cycle_time": "2026-02-12T19:50:00Z",
    "capital": 105.32,
    "positions_count": 3
  },
  {
    "name": "crypto",
    "is_running": true,
    "is_paused": false,
    "last_cycle_time": "2026-02-12T19:43:00Z",
    "last_cycle_duration_ms": 890,
    "last_trades_count": 0,
    "total_trades_today": 1,
    "error_message": null,
    "next_cycle_time": "2026-02-12T19:53:00Z",
    "capital": 324.15,
    "positions_count": 2
  }
]
```

### POST /api/bots/{name}/pause

Pause a bot (stop trading, keep monitoring).

**Parameters:**
- `name`: Bot name (kalshi/crypto/grid)

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "reason": "Manual pause via dashboard",
  "notify_telegram": true
}
```

**Returns:**
```json
{
  "status": "paused",
  "message": "kalshi bot paused successfully",
  "timestamp": "2026-02-12T19:45:00Z"
}
```

### POST /api/bots/{name}/resume

Resume a paused bot.

**Parameters:**
- `name`: Bot name (kalshi/crypto/grid)

**Headers:**
```
Authorization: Bearer {token}
```

**Returns:**
```json
{
  "status": "running",
  "message": "kalshi bot resumed successfully",
  "timestamp": "2026-02-12T19:45:00Z"
}
```

### POST /api/bots/{name}/restart

Restart a bot (stop and start).

**Parameters:**
- `name`: Bot name (kalshi/crypto/grid)

**Headers:**
```
Authorization: Bearer {token}
```

**Returns:**
```json
{
  "status": "running",
  "message": "kalshi bot restarted successfully",
  "timestamp": "2026-02-12T19:45:00Z"
}
```

### POST /api/bots/{name}/scan

Trigger manual scan/cycle immediately.

**Parameters:**
- `name`: Bot name (kalshi/crypto/grid)

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "priority": "high"
}
```

**Returns:**
```json
{
  "scan_id": "scan-12345",
  "bot": "kalshi",
  "timestamp": "2026-02-12T19:45:00Z",
  "markets_found": 150,
  "edges_found": 8,
  "pending_analysis": 8
}
```

---

## Deployment Endpoints

### POST /api/deploy/git-pull

Pull latest code from Git and restart all bots.

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "restart_bots": true,
  "notify_telegram": true
}
```

**Returns:**
```json
{
  "success": true,
  "message": "Code pulled and bots restarted",
  "timestamp": "2026-02-12T19:45:00Z",
  "changes_count": 5,
  "restart_result": {
    "kalshi": "running",
    "crypto": "running",
    "grid": "running"
  }
}
```

---

## Health Endpoints

### GET /health

Health check endpoint (no auth required).

**Returns:**
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "2026-02-12T19:45:00Z"
}
```

### GET /api/health

API health check (no auth required).

**Returns:**
```json
{
  "status": "healthy",
  "database": "connected",
  "bots": {
    "kalshi": "running",
    "crypto": "running",
    "grid": "running"
  },
  "timestamp": "2026-02-12T19:45:00Z"
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "error": "Unauthorized",
  "message": "Invalid or expired token",
  "status_code": 401,
  "timestamp": "2026-02-12T19:45:00Z"
}
```

### Common Status Codes

| Code | Meaning | When |
|------|---------|------|
| 200 | OK | Successful request |
| 201 | Created | Resource created |
| 400 | Bad Request | Invalid parameters |
| 401 | Unauthorized | Missing or invalid token |
| 403 | Forbidden | User doesn't have permission |
| 404 | Not Found | Resource doesn't exist |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Server Error | Internal server error |
| 503 | Service Unavailable | API temporarily down |

---

## Pagination

Endpoints that return lists support pagination:

```json
{
  "items": [...],
  "total": 156,
  "page": 0,
  "page_size": 50,
  "has_more": true
}
```

Use `page` parameter to navigate:
```
GET /api/transactions?page=0&limit=50
GET /api/transactions?page=1&limit=50
```

---

## Rate Limiting

API may implement rate limiting. Check headers:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1613103900
```

---

## CORS Configuration

API must allow requests from dashboard origins:

```
Access-Control-Allow-Origin: https://mfgroupllc.github.io, https://dashboard.your-domain.com
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

---

**API Version:** 1.0.0
**Last Updated:** February 2026
**Status:** Production Ready
