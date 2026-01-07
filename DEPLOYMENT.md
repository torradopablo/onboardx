# OnboardX - Deployment Guide

## Deployment Options

### Frontend
- **Vercel** (Recommended for Next.js)
- **Netlify**
- **AWS Amplify**

### Backend
- **Railway** (Recommended for Express)
- **Render**
- **Fly.io**
- **Heroku**

### Database
- **Supabase** (Managed PostgreSQL)
- **AWS RDS**
- **Digital Ocean Managed Databases**

### Backend Alternative
- **Supabase Edge Functions** (Serverless)

---

## Option 1: Vercel + Railway + Supabase (Recommended)

### Prerequisites
- GitHub account
- Vercel account
- Railway account
- Supabase project

### Step 1: Deploy Frontend to Vercel

1. **Push code to GitHub**
```bash
git push origin main
```

2. **Go to Vercel Dashboard**
   - Click "New Project"
   - Import from GitHub
   - Select `frontend` directory
   - Configure environment variables:
     ```
     NEXT_PUBLIC_API_URL=https://your-backend.railway.app/api
     ```

3. **Deploy**
   - Click "Deploy"
   - Your frontend is live at `https://your-project.vercel.app`

### Step 2: Deploy Backend to Railway

1. **Go to Railway Dashboard**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Select your repo

2. **Configure Environment**
   ```
   SERVICE_NAME=backend-express
   PORT=3001
   NODE_ENV=production
   DATABASE_URL=postgresql://...
   JWT_SECRET=<strong-secret-key>
   STRIPE_SECRET_KEY=sk_live_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   SENDGRID_API_KEY=SG....
   FRONTEND_URL=https://your-project.vercel.app
   ```

3. **Configure Root Directory**
   - Set to `backend-express`

4. **Deploy**
   - Railway automatically deploys
   - Your backend is live at `https://your-backend.railway.app`

### Step 3: Setup PostgreSQL on Supabase

1. **Create Supabase Project**
   - Go to supabase.com
   - Create new project
   - Get connection string

2. **Update DATABASE_URL**
   - Add to Railway environment variables
   - Format: `postgresql://user:password@host:5432/database`

3. **Run Migrations**
```bash
# Connect to Supabase PostgreSQL
psql "postgresql://user:password@db.xxx.supabase.co:5432/postgres"

# Run migrations
\i migrations/create_core_tables.sql
\i migrations/add_public_access_policies.sql
```

### Step 4: Setup Stripe

1. **Create Stripe Account**
   - Go to stripe.com
   - Create account
   - Get API keys

2. **Configure Webhooks**
   - Go to Stripe Dashboard → Webhooks
   - Add endpoint: `https://your-backend.railway.app/api/stripe/webhook`
   - Listen for events:
     - `checkout.session.completed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`

3. **Add Keys to Backend**
   - Update Railway environment variables
   - Redeploy automatically triggers

### Step 5: Setup Custom Domain (Optional)

1. **Frontend Domain**
   - Go to Vercel project settings
   - Add custom domain
   - Follow DNS instructions

2. **Backend Domain**
   - Go to Railway project settings
   - Add custom domain
   - Follow DNS instructions

---

## Option 2: Vercel + Supabase Edge Functions

This approach uses serverless backend entirely.

### Step 1: Deploy Frontend (Same as Option 1)

### Step 2: Deploy Backend with Supabase Edge Functions

1. **Install Supabase CLI**
```bash
npm install -g supabase
```

2. **Login to Supabase**
```bash
supabase login
```

3. **Link Project**
```bash
supabase link --project-ref your-project-id
```

4. **Deploy Functions**
```bash
supabase functions deploy auth-register
supabase functions deploy auth-login
supabase functions deploy projects
supabase functions deploy onboarding
```

5. **Configure Secrets**
```bash
supabase secrets set JWT_SECRET="your-secret"
supabase secrets set STRIPE_SECRET_KEY="sk_live_..."
supabase secrets set STRIPE_WEBHOOK_SECRET="whsec_..."
```

6. **Update Frontend**
   - Set `NEXT_PUBLIC_API_URL=https://your-project.supabase.co/functions/v1`

---

## Option 3: Full Docker Deployment

### Prerequisites
- Docker
- Docker Compose
- AWS EC2 or similar

### Step 1: Prepare Server

```bash
# SSH into server
ssh ubuntu@your-server-ip

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### Step 2: Deploy

```bash
# Clone repository
git clone <your-repo> /app
cd /app

# Create .env files
cp backend-express/.env.example backend-express/.env
cp frontend/.env.example frontend/.env.local

# Update credentials
nano backend-express/.env
nano frontend/.env.local

# Start services
docker-compose up -d

# Check status
docker-compose logs -f
```

### Step 3: Setup Reverse Proxy (Nginx)

```bash
# Install Nginx
sudo apt-get update
sudo apt-get install nginx certbot python3-certbot-nginx

# Create config
sudo nano /etc/nginx/sites-available/onboardx
```

```nginx
upstream frontend {
    server localhost:3000;
}

upstream backend {
    server localhost:3001;
}

server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://frontend;
    }

    location /api {
        proxy_pass http://backend;
    }
}
```

```bash
# Enable config
sudo ln -s /etc/nginx/sites-available/onboardx /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Setup SSL
sudo certbot --nginx -d yourdomain.com
```

---

## Monitoring & Maintenance

### Logs
```bash
# Express Backend (Railway)
railway logs -f

# Frontend (Vercel)
# Check dashboard under "Analytics" → "Logs"

# Docker
docker-compose logs -f backend-express
```

### Database Backups
```bash
# Supabase automatic backups (included)

# Manual backup (PostgreSQL)
pg_dump postgresql://user:pass@host:5432/db > backup.sql

# Restore from backup
psql postgresql://user:pass@host:5432/db < backup.sql
```

### Health Checks
```bash
# Test backend
curl https://your-backend.railway.app/api/health

# Test frontend
curl https://your-domain.com

# Test database
psql -U user -d onboardx -c "SELECT 1"
```

### Updates
```bash
# Pull latest code
git pull origin main

# Vercel auto-deploys on push

# Railway auto-deploys if connected to GitHub

# Docker
docker-compose down
docker-compose up -d --build
```

---

## Performance Optimization

### Frontend
- Enable image optimization (Next.js automatic)
- Setup CDN (Vercel includes Cloudflare)
- Use dynamic imports for large components

### Backend
- Setup caching headers
- Enable GZIP compression
- Use database connection pooling
- Monitor slow queries

### Database
- Add indexes on frequently queried columns
- Setup automated backups
- Monitor disk usage
- Setup read replicas for scale

### Example Connection Pooling
```javascript
// Express backend
const pool = new Pool({
  connectionString: DATABASE_URL,
  max: 20,
  min: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

---

## Troubleshooting

### Frontend won't connect to backend
```
1. Check NEXT_PUBLIC_API_URL is correct
2. Verify backend is running
3. Check CORS settings in backend
4. Review network tab in browser DevTools
```

### Database connection fails
```
1. Verify connection string format
2. Check firewall allows connections
3. Verify database exists
4. Test connection locally: psql <connection-string>
```

### Stripe webhooks not working
```
1. Verify endpoint URL is correct
2. Check signing secret is correct
3. Review webhook logs in Stripe dashboard
4. Test webhook locally
```

### High latency
```
1. Check database query performance
2. Monitor server CPU/memory
3. Enable caching
4. Use CDN for static assets
5. Consider regional deployment
```

---

## Checklist

- [ ] Domain configured
- [ ] SSL/HTTPS enabled
- [ ] Environment variables set
- [ ] Database migrations run
- [ ] Stripe keys configured
- [ ] SendGrid key configured (if using)
- [ ] CORS configured
- [ ] Rate limiting enabled
- [ ] Monitoring setup
- [ ] Backup strategy configured
- [ ] Error tracking enabled (Sentry, etc.)
- [ ] Analytics enabled
- [ ] Security headers configured
- [ ] WAF rules setup (optional)
- [ ] Load testing performed
