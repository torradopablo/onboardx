# OnboardX - Architecture Documentation

## System Overview

OnboardX is a client onboarding SaaS with two backend implementation options:

1. **Express.js Backend** - Traditional Node.js with clean architecture
2. **Supabase Backend** - Serverless with Edge Functions

Both share the same:
- Frontend (Next.js)
- Database schema (PostgreSQL)
- API contract

---

## Architecture Comparison

### Express Backend Architecture

```
┌─────────────────────┐
│   Next.js Frontend  │
│   (Vercel)          │
└──────────┬──────────┘
           │ HTTP
           ▼
┌─────────────────────┐
│  Express Server     │
│  (Railway)          │
│                     │
│ ┌─────────────────┐ │
│ │ Controllers     │ │
│ ├─────────────────┤ │
│ │ Services        │ │
│ ├─────────────────┤ │
│ │ Repositories    │ │
│ └─────────────────┘ │
└──────────┬──────────┘
           │ SQL
           ▼
┌─────────────────────┐
│  PostgreSQL         │
│  (Supabase/AWS)     │
└─────────────────────┘
```

**Layers:**
- **Controllers** - HTTP request handling
- **Services** - Business logic
- **Repositories** - Data access abstraction
- **Domain Models** - Entity definitions

**Benefits:**
- Full control over logic flow
- Traditional testing patterns
- Familiar architecture for most developers
- Easy debugging with server logs

**Trade-offs:**
- Server management overhead
- Cold start times not applicable
- Fixed infrastructure costs
- Need to manage scalability

### Supabase Backend Architecture

```
┌─────────────────────┐
│   Next.js Frontend  │
│   (Vercel)          │
└──────────┬──────────┘
           │ HTTP
           ▼
┌─────────────────────────────────┐
│   Supabase Edge Functions       │
│   (Global Edge Network)         │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ auth-register function      │ │
│ │ auth-login function         │ │
│ │ projects function           │ │
│ │ onboarding function         │ │
│ └─────────────────────────────┘ │
└──────────┬──────────────────────┘
           │ SQL
           ▼
┌─────────────────────┐
│  PostgreSQL         │
│  (Supabase)         │
│                     │
│ ┌─────────────────┐ │
│ │ Row-Level       │ │
│ │ Security (RLS)  │ │
│ └─────────────────┘ │
└─────────────────────┘
```

**Components:**
- **Edge Functions** - Deno-based serverless functions
- **PostgreSQL** - Database with RLS policies
- **Authentication** - JWT-based auth
- **Storage** - File uploads support

**Benefits:**
- No server management
- Global edge deployment
- Automatic scaling
- Lower operational complexity
- Integrated database

**Trade-offs:**
- Learning curve for Edge Functions
- Limited to function constraints
- Cold starts (~200-500ms)
- Deno-specific syntax

---

## Data Flow

### User Registration Flow

#### Express Backend
```
1. Client: POST /auth/register {email, password, ...}
           ↓
2. Controller: Validate input (Zod)
             ↓
3. Service: Hash password (bcrypt)
           Create JWT
           ↓
4. Repository: Insert into users table
              ↓
5. Database: Return created user
            ↓
6. Response: { user, token }
```

#### Supabase Backend
```
1. Client: POST /auth-register {email, password, ...}
          ↓
2. Edge Function: Validate input
                 Hash password (bcryptjs)
                 ↓
3. Supabase Client: Insert user
                   ↓
4. Database: Return created user
            ↓
5. Response: { user, token }
```

### Project Creation Flow

#### Both Backends
```
1. Client: POST /projects {client_name, client_email, platforms}
          Headers: Authorization: Bearer {token}
          ↓
2. Auth Middleware: Verify JWT
                   Extract userId
                   ↓
3. Service: Validate platforms array
           Generate unique public_token
           ↓
4. Repository: Insert project
              Insert platform accesses (for each platform)
              ↓
5. Database: Return created project
            ↓
6. Response: { project_id, public_token, ... }
```

### Public Onboarding Flow

#### Both Backends
```
1. Client (No Auth): GET /onboarding/{token}
                    ↓
2. Function/Controller: Lookup project by token
                       ↓
3. Database Query: SELECT project WHERE public_token = {token}
                  SELECT accesses WHERE project_id = {id}
                  SELECT files WHERE project_id = {id}
                  ↓
4. Response: { project, accesses, files }

5. Client: PUT /onboarding/{token}/access/{accessId}
          Body: { status: "completed" }
          ↓
6. Function/Controller: Update access status
                       Set completed_at timestamp
                       ↓
7. Database: UPDATE platform_accesses
            ↓
8. Response: { updated_access }

9. Client: POST /onboarding/{token}/complete
          ↓
10. Function/Controller: Update project status
                        Set completed_at
                        ↓
11. Database: UPDATE onboarding_projects
             ↓
12. Response: { updated_project }
```

---

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT,
  company_name TEXT,
  stripe_customer_id TEXT,
  subscription_status TEXT DEFAULT 'trial',
  subscription_tier TEXT DEFAULT 'starter',
  trial_ends_at TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

**RLS Policies:**
- Users can only read/update their own row
- Service role can manage all users

### Onboarding Projects Table
```sql
CREATE TABLE onboarding_projects (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  public_token TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending',
  platforms TEXT[] NOT NULL,
  notes TEXT,
  completed_at TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

**RLS Policies:**
- Users can only access their own projects
- Public read via public_token

### Platform Accesses Table
```sql
CREATE TABLE platform_accesses (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES onboarding_projects(id),
  platform TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  instructions_viewed BOOLEAN DEFAULT false,
  confirmation_data JSONB,
  completed_at TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

**RLS Policies:**
- Users can read for own projects
- Public read/write via project token

### File Uploads Table
```sql
CREATE TABLE file_uploads (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES onboarding_projects(id),
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  uploaded_by TEXT DEFAULT 'client',
  created_at TIMESTAMP
);
```

**RLS Policies:**
- Users can read for own projects
- Public insert/read via project token

### Subscriptions Table
```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  stripe_subscription_id TEXT UNIQUE,
  stripe_price_id TEXT,
  status TEXT,
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

**RLS Policies:**
- Users can only read own subscription

---

## Authentication & Security

### JWT Tokens

**Token Structure:**
```
Header.Payload.Signature

Header: { alg: "HS256", typ: "JWT" }
Payload: { userId, iat, exp }
Signature: HMAC-SHA256(secret)
```

**Expiration:**
- Access token: 15 minutes
- Refresh token: 7 days (future implementation)

**Verification:**
```typescript
// Express
jwt.verify(token, JWT_SECRET);

// Supabase
const { data } = await supabase.auth.getUser(token);
```

### Row-Level Security (RLS)

**Example Policy:**
```sql
CREATE POLICY "Users can read own projects"
ON onboarding_projects
FOR SELECT
TO authenticated
USING (user_id = auth.uid());
```

**Public Access Pattern:**
```sql
CREATE POLICY "Public can view project via token"
ON onboarding_projects
FOR SELECT
USING (true);  -- Token validation done by app
```

### Password Security

**Bcrypt Configuration:**
```
Salt rounds: 10
Algorithm: bcrypt
Cost factor: 2^10 iterations
```

---

## Scaling Considerations

### Express Backend
- **Horizontal Scaling:** Add more server instances
- **Load Balancing:** Use Railway's automatic load balancing
- **Database:** Connection pooling (max 20 connections)
- **Caching:** Redis (future implementation)

### Supabase Backend
- **Edge Functions:** Automatically global
- **Auto-scaling:** Built-in, handled by Supabase
- **Database:** Connection pooling managed by Supabase
- **Rate Limiting:** Configurable per function

---

## Error Handling

### Express Backend
```typescript
// Global error handler
app.use((err, req, res, next) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }
  res.status(500).json({ error: 'Internal server error' });
});
```

### Supabase Backend
```typescript
// Try-catch in each function
try {
  // logic
} catch (error) {
  return new Response(
    JSON.stringify({ error: (error as Error).message }),
    { status: 500, headers: corsHeaders }
  );
}
```

---

## Monitoring & Observability

### Logging
- **Express:** Server logs via Railway/Docker
- **Supabase:** Edge Function logs in dashboard

### Error Tracking
- **Recommended:** Sentry integration
- **Express:** Sentry middleware
- **Supabase:** Sentry via environment variables

### Performance Monitoring
- **Express:** New Relic, Datadog
- **Supabase:** Built-in metrics dashboard

---

## Choosing Between Options

### Choose Express if:
- You want full control over logic flow
- You prefer traditional architecture patterns
- Your team is familiar with Node.js
- You need custom middleware
- You want server-based caching

### Choose Supabase if:
- You want minimal operational overhead
- You prefer serverless architecture
- You want global edge deployment
- You want integrated database + auth
- You prefer rapid development

---

## Migration Path

Both backends are designed to share the same:
- API contract (same endpoints)
- Database schema (same PostgreSQL tables)
- Frontend code (same Next.js app)

**To migrate Express → Supabase:**
1. Deploy Edge Functions with same logic
2. Update frontend API_URL
3. Database schema already exists
4. No frontend changes needed

**To migrate Supabase → Express:**
1. Deploy Express backend
2. Port Edge Function logic to services
3. Database schema already exists
4. No frontend changes needed
