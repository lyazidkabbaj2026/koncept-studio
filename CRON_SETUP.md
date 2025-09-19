# Automated Maintenance Cron Jobs Setup

This document explains how to set up automated maintenance tasks:
1. **Waitlist Cleanup**: Expired waitlist entries cleanup daily at 17:59 UTC
2. **Subscription Expiration**: Automatic subscription status updates daily at 23:59 UTC

## Option 1: Vercel Cron Jobs (Recommended)

### Step 1: Add to vercel.json
```json
{
  "crons": [
    {
      "path": "/api/cron/cleanup-waitlist",
      "schedule": "59 17 * * *"
    },
    {
      "path": "/api/cron/expire-subscriptions",
      "schedule": "59 23 * * *"
    }
  ]
}
```

### Step 2: Deploy to Vercel
The cron jobs will automatically run:
- **Waitlist cleanup**: Daily at 17:59 UTC
- **Subscription expiration**: Daily at 23:59 UTC

### Step 3: Test manually
- Waitlist cleanup: `https://your-domain.com/api/cron/cleanup-waitlist`
- Subscription expiration: `https://your-domain.com/api/cron/expire-subscriptions`

## Option 2: External Cron Service

### Services you can use:
- **EasyCron**: https://www.easycron.com/
- **cron-job.org**: https://cron-job.org/
- **Uptime Robot**: Monitor + HTTP cron

### Setup:
1. Create account with cron service
2. Set up two cron jobs:
   - **Waitlist cleanup**: URL `https://your-domain.com/api/cron/cleanup-waitlist`, schedule `59 17 * * *`
   - **Subscription expiration**: URL `https://your-domain.com/api/cron/expire-subscriptions`, schedule `59 23 * * *`
3. Set method: POST or GET

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

## What Each Cron Job Does

### 🕕 Waitlist Cleanup (17:59 UTC daily)
- **Endpoint**: `/api/cron/cleanup-waitlist`
- **Purpose**: Clean up expired waitlist entries and refund credits
- **Logic**:
  1. Find waitlist entries for classes that have already started
  2. Refund credits to users' subscriptions
  3. Remove expired waitlist entries
  4. Log cleanup results

### 🕚 Subscription Expiration (23:59 UTC daily)
- **Endpoint**: `/api/cron/expire-subscriptions`
- **Purpose**: Automatically expire subscriptions based on business rules
- **Logic**:
  1. **Abonnement**: Expire if `end_date <= NOW()`
  2. **Carnet**: Expire if `end_date <= NOW()` OR (no credits AND no future bookings)
  3. **Personal Training**: Expire if `end_date <= NOW()` OR (no credits AND no future bookings)
  4. Update subscription status from "active" to "expired"
  5. Log expiration results

### Benefits of Automation:
- ✅ **Consistent data state**: No more "active" but expired subscriptions
- ✅ **Better user experience**: Accurate subscription status in dashboards
- ✅ **Reduced admin work**: No manual status updates needed
- ✅ **Accurate reporting**: Analytics show true active subscriptions
- ✅ **Credit management**: Automatic refunds for unused waitlist credits