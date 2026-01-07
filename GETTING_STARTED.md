# OnboardX - Getting Started Guide

## Project Overview

OnboardX is a client onboarding SaaS for paid ads agencies. It allows agencies to create one-link onboarding flows for their clients without requiring client login.

## Tech Stack

### Frontend
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- React hooks for state management

### Backend Options
1. **Express.js** - Traditional Node.js backend with clean architecture
2. **Supabase** - Serverless backend using Edge Functions

### Database
- PostgreSQL (shared for both backends)

### Infrastructure
- Vercel (Frontend deployment)
- Railway/Render (Express Backend deployment)
- Supabase Edge Functions (Supabase backend deployment)

## Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose (for local development)
- PostgreSQL 15+
- Git

### Option 1: Docker Compose (Recommended)

```bash
# 1. Clone repository
git clone <repo>
cd onboardx

# 2. Copy environment variables
cp backend-express/.env.example backend-express/.env
cp frontend/.env.example frontend/.env.local

# 3. Update environment variables with your keys
# Edit backend-express/.env with:
# - STRIPE_SECRET_KEY
# - STRIPE_WEBHOOK_SECRET
# - SENDGRID_API_KEY

# 4. Start all services
docker-compose up

# Frontend: http://localhost:3000
# Backend: http://localhost:3001
# Database: localhost:5432
```

### Option 2: Manual Setup

#### Backend (Express)
```bash
cd backend-express
npm install
npm run dev
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

#### Database
```bash
# Create PostgreSQL database
createdb -U postgres onboardx

# Run migrations
psql -U postgres -d onboardx < migrations/create_core_tables.sql
psql -U postgres -d onboardx < migrations/add_public_access_policies.sql
```

## Project Structure

```
onboardx/
├── frontend/               # Next.js frontend
├── backend-express/        # Express.js backend
├── backend-supabase/       # Supabase backend (Edge Functions)
├── docker-compose.yml      # Docker setup
├── ARCHITECTURE.md         # Architecture documentation
├── API.md                  # API reference
└── DEPLOYMENT.md           # Deployment guide
```

## Key Features

### Agency Dashboard
- Create onboarding projects
- Select required platforms (Google Ads, Meta Ads, GA4, GTM)
- Generate shareable onboarding links
- Track onboarding progress
- Receive completion notifications

### Client Onboarding
- Simple checklist UI
- Step-by-step access instructions
- File upload functionality
- No login required
- Easy confirmation flow

### Subscription Management
- Monthly and yearly plans
- Stripe integration
- Plan enforcement via RLS
- Automatic webhook handling

## Environment Variables

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### Backend Express (.env)
```
PORT=3001
NODE_ENV=development
DATABASE_URL=postgresql://user:pass@localhost:5432/onboardx
JWT_SECRET=your-secret-key
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
SENDGRID_API_KEY=SG....
FRONTEND_URL=http://localhost:3000
```

## Development Workflow

### 1. Create a Feature
```bash
git checkout -b feature/my-feature
```

### 2. Make Changes
- Frontend changes: `frontend/`
- Backend changes: `backend-express/` or `backend-supabase/`
- Database changes: Create new migration

### 3. Test Locally
```bash
# Frontend
npm run dev

# Backend
npm run dev

# Type checking
npm run type-check
```

### 4. Create PR
Submit pull request with:
- Clear description
- Test coverage
- Screenshots (for UI changes)

## Debugging

### Frontend
- Check browser console
- Use React DevTools
- Verify API calls in Network tab

### Backend
- Check server logs
- Use `console.log()` for debugging
- Verify database queries

### Database
```bash
# Connect to PostgreSQL
psql -U onboardx -d onboardx -h localhost

# Common queries
SELECT * FROM users;
SELECT * FROM onboarding_projects;
SELECT * FROM platform_accesses;
```

## Common Issues

### Port Already in Use
```bash
# Kill process on port
lsof -i :3000  # Frontend
lsof -i :3001  # Backend
kill -9 <PID>
```

### Database Connection Error
```bash
# Verify PostgreSQL is running
sudo service postgresql status

# Check credentials in .env
# Reset database if needed
dropdb onboardx
createdb onboardx
```

### Module Not Found
```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install
```

## Next Steps

1. **Setup Stripe Account**
   - Go to https://dashboard.stripe.com
   - Get API keys
   - Add to environment variables

2. **Setup SendGrid** (optional for emails)
   - Create account at sendgrid.com
   - Get API key
   - Configure email templates

3. **Deploy Frontend**
   - Push to GitHub
   - Connect to Vercel
   - Set environment variables

4. **Deploy Backend**
   - Choose deployment platform (Railway, Render)
   - Deploy Express backend
   - Or use Supabase Edge Functions

5. **Setup Production Database**
   - Create PostgreSQL instance
   - Run migrations
   - Update connection strings

## Resources

- [Architecture Documentation](./ARCHITECTURE.md)
- [API Reference](./API.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [Database Schema](./backend-express/src/domain/entities/)

## Support

For issues or questions:
1. Check existing issues on GitHub
2. Review documentation
3. Create new issue with reproduction steps
