# Role & Context

Act as a **Senior SaaS Architect and Product Designer** specialized in **Micro-SaaS for agencies and freelancers**.

I want to build a Micro-SaaS called **OnboardX**.

OnboardX is a **very simple client onboarding SaaS** for **Paid Ads agencies and freelancers** (Google Ads & Meta Ads niche).

The core problem is:
Paid Ads agencies waste time chasing clients to collect **account access, permissions, files, and confirmations** before launching ad campaigns.

---

## 🎯 Product Vision — OnboardX

OnboardX helps agencies and freelancers:

- Create a structured onboarding flow
- Generate **one single shareable link**
- Send it to the client
- Let the client complete everything in one place:
  - Grant ad account access
  - Upload required files
  - Confirm setup completion

No client accounts.  
No complex dashboards.  
Just onboarding → **Ready to launch**.

---

## 👥 Target Niche

- Paid Ads agencies (1–10 people)
- Freelancers managing:
  - Google Ads
  - Meta Ads
  - Google Analytics 4
  - Google Tag Manager

Markets:
- LATAM
- Spain
- Global English-speaking agencies

---

## 🔑 Core Differentiation (CRITICAL)

OnboardX must be **simpler and more focused than tools like Content Snare**.

Key differentiators:

- One-link onboarding per client
- No client login required
- Step-by-step access instructions for non-technical clients
- Clear onboarding status:
  - Pending
  - In progress
  - Ready
- Built specifically for **Paid Ads onboarding**, not generic data collection

---

## 🧩 MVP FEATURES (STRICT SCOPE)

### Agency / Freelancer Side

- Email + password authentication
- Create onboarding projects
- Select required platforms:
  - Google Ads
  - Meta Ads
  - GA4
  - GTM
- Generate a public onboarding link
- View onboarding progress per client
- Receive email notification when onboarding is completed

### Client Side (NO AUTH)

- Open onboarding via shared link
- Simple checklist UI:
  - Grant Google Ads access (guided instructions)
  - Grant Meta Ads access (guided instructions)
  - Upload files (brand assets, documents)
  - Final confirmation button
- Submit onboarding

---

## 💳 Monetization

- Subscription-based SaaS
- Monthly and yearly plans
- Payments handled via **Stripe**
- Currency: **USD**
- Pricing based on number of active onboardings

---

## 🧱 Tech Stack (MANDATORY)

### Frontend

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Responsive SaaS UI
- Modern minimal design
- Color palette: green / blue / black

### Backend

- Node.js
- Express.js
- TypeScript
- Clean Architecture:
  - Controllers
  - Services (business logic)
  - Repositories
  - Domain models

### Database

- PostgreSQL
- Prisma ORM

### Authentication

- JWT for agency users
- Secure token-based public links for client onboarding

### Payments

- Stripe Subscriptions
- Stripe Webhooks for plan enforcement

### Infrastructure

- Frontend deployed on Vercel
- Backend deployed on Railway / Render / Fly.io

---

## 🚀 Future Features (OUT OF SCOPE FOR MVP)

- Agency templates
- Custom branding per agency
- Slack notifications
- Audit log of access confirmations
- Multi-language support

---

## 📦 Output Required

Please generate:

1. High-level architecture diagram
2. Database schema
3. Backend folder structure (Clean Architecture)
4. REST API endpoints
5. Frontend page structure
6. Stripe subscription flow
7. Lean MVP development roadmap

The solution must prioritize **speed, simplicity, and fast market validation**.
