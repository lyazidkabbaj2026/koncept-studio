# Deployment Guide - Koncept Studio

## Pre-deployment Checklist

### 1. Environment Setup
- [ ] Copy `.env.example` to `.env.production`
- [ ] Update Supabase production URLs and keys
- [ ] Set up production database with `sql/database_schema_source_of_truth.sql`
- [ ] Run migration scripts from `sql/migrations/`
- [ ] Configure proper RLS policies
- [ ] Set up storage buckets for images

### 2. Code Quality
- [ ] Run `npm run lint` (no errors)
- [ ] Run `npm run type-check` (no TypeScript errors)
- [ ] Test build with `npm run build` (successful)
- [ ] Review browser console for errors in production build

### 3. Security Configuration
- [ ] Review and update security headers in `next.config.js`
- [ ] Ensure all sensitive data is in environment variables
- [ ] Verify RLS policies are properly configured
- [ ] Check that admin routes are properly protected

### 4. Performance Optimization
- [ ] Image optimization enabled
- [ ] Bundle analyzer run (`npm run build:analyze`)
- [ ] Unnecessary console.log statements removed
- [ ] Error boundaries implemented

## Deployment Options

### Option 1: Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Configure build settings:
   - Build Command: `npm run production`
   - Output Directory: `.next`
   - Install Command: `npm install`

### Option 2: Self-hosted
1. Ensure Node.js 18+ is installed
2. Clone repository and install dependencies: `npm install`
3. Set up environment variables
4. Build the application: `npm run production`
5. Start the application: `npm start`

### Option 3: Docker
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
ENV PORT 3000
CMD ["node", "server.js"]
```

## Post-deployment Verification

### 1. Functionality Tests
- [ ] User registration and login work
- [ ] Admin panel is accessible only to authorized users
- [ ] Class booking system functions properly
- [ ] Payment integration (if implemented) works
- [ ] Email notifications are sent

### 2. Performance Tests
- [ ] Page load times are acceptable (<3 seconds)
- [ ] Images load properly and are optimized
- [ ] No JavaScript errors in browser console
- [ ] Mobile responsiveness works

### 3. Security Tests
- [ ] Unauthorized access to admin routes is blocked
- [ ] RLS policies prevent unauthorized data access
- [ ] Forms are protected against XSS
- [ ] API endpoints validate user permissions

## Monitoring and Maintenance

### Error Monitoring
- Consider integrating Sentry for error tracking
- Set up log aggregation for server errors
- Monitor database performance

### Regular Maintenance
- Keep dependencies updated
- Monitor security vulnerabilities
- Backup database regularly
- Review and update RLS policies as needed

### Performance Monitoring
- Monitor Core Web Vitals
- Set up uptime monitoring
- Track user analytics (if applicable)

## Troubleshooting

### Common Issues
1. **Build Errors**: Check TypeScript errors with `npm run type-check`
2. **Environment Variables**: Ensure all required variables are set
3. **Database Connection**: Verify Supabase configuration
4. **Image Loading**: Check Next.js image optimization settings
5. **Routing Issues**: Verify middleware configuration

### Support
- Check application logs for detailed error messages
- Review Supabase dashboard for database issues
- Use browser dev tools to debug client-side issues

## Backup and Recovery

### Database Backup
```sql
-- Create regular database backups
pg_dump -h your-db-host -U your-username -d your-database > backup_$(date +%Y%m%d_%H%M%S).sql
```

### File Backup
- Backup uploaded images from Supabase storage
- Keep configuration files in version control
- Document any custom configuration changes