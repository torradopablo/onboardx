# OnboardX

Client onboarding SaaS for paid ads agencies. Create one-link onboarding flows for Google Ads and Meta Ads clients without requiring login.

## Features

✅ **Agency Dashboard**
- Create and manage onboarding projects
- Select required platforms (Google Ads, Meta Ads, GA4, GTM)
- Generate shareable one-link onboarding flows
- Track client onboarding progress
- Receive completion notifications

✅ **Client Onboarding (No Login)**
- Simple checklist UI
- Step-by-step access instructions
- File upload support
- One-click confirmation

✅ **Subscription Management**
- Monthly and yearly plans (via Stripe)
- 7-day free trial
- Plan-based project limits
- Auto-renewal with webhooks

✅ **Security**
- Password hashing with bcrypt
- JWT authentication
- Row-level database security
- Token-based public links
- Secure file uploads

## Tech Stack

### Frontend
- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **React Hooks**

### Backend (Choose One)
1. **Express.js** - Traditional Node.js backend
   - Clean Architecture (Controllers, Services, Repositories)
   - PostgreSQL with query builder
   - JWT authentication

2. **Supabase** - Serverless backend
   - Edge Functions
   - Built-in PostgreSQL
   - Row-Level Security
   - Integrated auth

### Database
- **PostgreSQL** 15+
- Shared schema for both backends

### Infrastructure
- **Frontend:** Vercel
- **Backend:** Railway, Render, or Supabase Edge Functions
- **Database:** Supabase, AWS RDS, or Digital Ocean
- **Payments:** Stripe

## Quick Start

### Option 1: Docker Compose (Recommended for Local Dev)

```bash
# Clone repo
git clone <repo>
cd onboardx

# Setup env files
cp backend-express/.env.example backend-express/.env
cp frontend/.env.example frontend/.env.local

# Update keys in .env files
# - STRIPE_SECRET_KEY
# - SENDGRID_API_KEY (optional)

# Start all services
docker-compose up

# Frontend: http://localhost:3000
# Backend: http://localhost:3001
# Database: localhost:5432
```

### Option 2: Manual Setup

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

**Backend (Express):**
```bash
cd backend-express
npm install
cp .env.example .env
# Update .env with your keys
npm run dev
```

**Database:**
```bash
createdb onboardx
psql onboardx < migrations/create_core_tables.sql
psql onboardx < migrations/add_public_access_policies.sql
```

## Project Structure

```
onboardx/
├── frontend/                 # Next.js application
│   ├── app/                 # App Router
│   ├── components/          # Reusable components
│   ├── lib/                 # API client, hooks, utils
│   └── types/               # TypeScript types
│
├── backend-express/         # Express backend (Option 1)
│   ├── src/
│   │   ├── domain/          # Entities, repositories
│   │   ├── application/     # Services, DTOs
│   │   ├── infrastructure/  # Database, external services
│   │   ├── presentation/    # Controllers, routes, middleware
│   │   └── shared/          # Errors, utils, constants
│   └── package.json
│
├── backend-supabase/        # Supabase backend (Option 2)
│   ├── edge-functions/      # Deployed functions
│   └── README.md
│
├── docker-compose.yml       # Local development setup
├── GETTING_STARTED.md       # Setup guide
├── API.md                   # API reference
├── ARCHITECTURE.md          # Architecture docs
└── DEPLOYMENT.md            # Deployment guide
```

## Documentation

- **[Getting Started](./GETTING_STARTED.md)** - Setup and local development
- **[API Reference](./API.md)** - Complete API documentation
- **[Architecture](./ARCHITECTURE.md)** - Technical architecture & design
- **[Deployment](./DEPLOYMENT.md)** - Production deployment guide

## Backend Comparison

| Feature | Express | Supabase |
|---------|---------|----------|
| Deployment | Railway, Render | Edge Functions |
| Architecture | Clean Architecture | Serverless |
| Database | Shared PostgreSQL | Integrated PostgreSQL |
| Auth | Custom JWT | JWT + RLS |
| Scalability | Manual | Automatic |
| Cold Start | N/A | ~200-500ms |
| Cost | Predictable | Pay-per-use |
| Learning Curve | Moderate | Steep |
| Team Familiarity | High (Node.js) | Medium (Deno) |

**Choose Express if:** You want traditional architecture, full control, or your team prefers Node.js.

**Choose Supabase if:** You want minimal ops overhead, serverless, or integrated database/auth.

## MVP Features

### Agency Features
✅ Email + password auth
✅ Create onboarding projects
✅ Select platforms
✅ Generate shareable links
✅ View progress
✅ Email notifications on completion

### Client Features
✅ Open onboarding link (no login)
✅ Platform checklist
✅ Access instructions
✅ File uploads
✅ Final confirmation

### Payments
✅ Stripe Starter ($29/mo - 10 projects)
✅ Stripe Pro ($79/mo - 50 projects)
✅ Stripe Enterprise ($199/mo - unlimited)
✅ Monthly & yearly billing
✅ Automatic webhooks

## Future Features

- [ ] Agency templates
- [ ] Custom branding per agency
- [ ] Slack notifications
- [ ] Audit logs
- [ ] Multi-language support
- [ ] Team collaboration
- [ ] API access for agencies
- [ ] Webhooks for integrations
- [ ] Analytics dashboard
- [ ] Custom domain support

## Environment Setup

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### Backend Express (.env)
```
PORT=3001
NODE_ENV=development
DATABASE_URL=postgresql://user:pass@localhost:5432/onboardx
JWT_SECRET=your-secret-key-change-in-production
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
SENDGRID_API_KEY=SG....
FRONTEND_URL=http://localhost:3000
```

## Development Commands

```bash
# Frontend
npm run dev          # Start dev server
npm run build        # Build for production
npm run type-check   # Type check

# Backend Express
npm run dev          # Start with ts-node
npm run build        # Compile TypeScript
npm run start        # Run compiled code

# Database
npm run migrate      # Run migrations (future)
npm run seed         # Seed data (future)
```

## Deployment

### Recommended Stack
- **Frontend:** Vercel
- **Backend:** Railway
- **Database:** Supabase
- **Payments:** Stripe

See [DEPLOYMENT.md](./DEPLOYMENT.md) for step-by-step guides.

## Security

- ✅ Passwords hashed with bcrypt (10 rounds)
- ✅ JWT tokens (15 min expiry)
- ✅ Row-level database security (RLS)
- ✅ HTTPS only in production
- ✅ CORS configured
- ✅ Rate limiting on endpoints
- ✅ Input validation with Zod

## Contributing

1. Create feature branch: `git checkout -b feature/my-feature`
2. Make changes with types: `npm run type-check`
3. Test locally: `docker-compose up`
4. Create pull request with clear description

## License

MIT

## Support

- **Issues:** Create GitHub issue with reproduction steps
- **Discussions:** Start GitHub discussion for questions
- **Email:** support@onboardx.com (future)

---

**Built with ❤️ for paid ads agencies**