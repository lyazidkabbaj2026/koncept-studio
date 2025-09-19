# Waitlist Cleanup Cron Job Setup

This document explains how to set up automatic cleanup of expired waitlist entries once daily at 17:59 UTC.

## Option 1: Vercel Cron Jobs (Recommended)

### Step 1: Add to vercel.json
```json
{
  "crons": [
    {
      "path": "/api/cron/cleanup-waitlist",
      "schedule": "59 17 * * *"
    }
  ]
}
```

### Step 2: Deploy to Vercel
The cron job will automatically run once daily at 17:59 UTC.

### Step 3: Test manually
Visit: `https://your-domain.com/api/cron/cleanup-waitlist`

## Option 2: External Cron Service

### Services you can use:
- **EasyCron**: https://www.easycron.com/
- **cron-job.org**: https://cron-job.org/
- **Uptime Robot**: Monitor + HTTP cron

### Setup:
1. Create account with cron service
2. Set URL: `https://your-domain.com/api/cron/cleanup-waitlist`
3. Set schedule: `59 17 * * *` (daily at 17:59 UTC)
4. Set method: POST or GET

## Option 3: Supabase pg_cron (Advanced)

### Prerequisites:
- Requires Supabase Pro plan
- Need to enable pg_cron extension

### Steps:
1. Run `sql/expired_waitlist_cleanup.sql`
2. Run `sql/setup_cron_job.sql`
3. In Supabase SQL editor, run:
```sql
SELECT cron.schedule(
  'cleanup-expired-waitlists',
  '0 */12 * * *',
  'SELECT scheduled_waitlist_cleanup();'
);
```

## Option 4: GitHub Actions (Free)

### Create `.github/workflows/cleanup-cron.yml`:
```yaml
name: Cleanup Expired Waitlists
on:
  schedule:
    - cron: '59 17 * * *'  # Daily at 17:59 UTC
  workflow_dispatch:  # Allow manual trigger

jobs:
  cleanup:
    runs-on: ubuntu-latest
    steps:
      - name: Call cleanup endpoint
        run: |
          curl -X POST ${{ secrets.CLEANUP_URL }} \
            -H "Content-Type: application/json"
```

## Monitoring & Logging

### Check logs:
- Vercel: Functions tab in dashboard
- External services: Service-specific logs
- Supabase: Database logs
- Manual test: Visit API endpoint directly

### Expected response:
```json
{
  "success": true,
  "refunded_entries": 3,
  "errors": 0,
  "message": "Cleaned up 3 expired waitlist entries with 0 errors",
  "timestamp": "2025-01-15T12:00:00.000Z"
}
```

## Security (Optional)

Add authentication to the endpoint by setting `CRON_SECRET` environment variable and uncommenting the auth check in `route.ts`.

## Testing

1. **Manual test**: Visit `/api/cron/cleanup-waitlist`
2. **Create test data**: Add waitlist entry for past class
3. **Verify**: Check if credits were refunded and entry removed

## Recommendation

Use **Vercel Cron Jobs** (Option 1) as it's:
- ✅ Free with Vercel hosting
- ✅ Reliable and built-in
- ✅ Easy to monitor
- ✅ Automatically scales
- ✅ No external dependencies