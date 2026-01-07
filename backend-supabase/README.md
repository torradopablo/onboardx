# OnboardX - Supabase Backend

This is the Supabase-based backend implementation for OnboardX. It uses Supabase's Edge Functions, built-in PostgreSQL database, and authentication.

## Architecture

The Supabase backend leverages:

- **PostgreSQL Database** - Same schema as Express backend
- **Edge Functions** - Serverless functions for API endpoints
- **Row-Level Security (RLS)** - Fine-grained data access control
- **JWT Authentication** - Token-based user authentication

## Deployed Edge Functions

### Authentication
- `auth-register` - Register new user
- `auth-login` - Login user

### Projects
- `projects` - Handles GET (list/get), POST (create), PUT (update), DELETE (delete)

### Onboarding (Public)
- `onboarding` - Handles GET (get onboarding), PUT (update access), POST (complete)

## API Endpoints

All endpoints are available at: `https://[project-id].supabase.co/functions/v1/`

### Auth Endpoints

```
POST /auth-register
Body: { email, password, full_name, company_name }
Response: { user, token }

POST /auth-login
Body: { email, password }
Response: { user, token }
```

### Projects Endpoints (Authenticated)

```
GET /projects
Headers: Authorization: Bearer {token}

POST /projects
Headers: Authorization: Bearer {token}
Body: { client_name, client_email, platforms[], notes }

GET /projects/:id
Headers: Authorization: Bearer {token}

PUT /projects/:id
Headers: Authorization: Bearer {token}
Body: { updates }

DELETE /projects/:id
Headers: Authorization: Bearer {token}
```

### Onboarding Endpoints (Public)

```
GET /onboarding/:token

PUT /onboarding/:token/access/:accessId
Body: { status: 'completed' }

POST /onboarding/:token/complete
```

## Database Schema

See the migrations in the root `/project` migrations directory:
- `create_core_tables.sql` - Initial schema
- `add_public_access_policies.sql` - Public RLS policies

## Row-Level Security (RLS)

All tables have RLS enabled with policies for:
- Authenticated users can only access their own data
- Public access via token for onboarding flow
- Service role can manage all data

## Deployment

Edge Functions are automatically deployed via the deployment tool. To update a function, redeploy with the same slug name.

## Environment Variables

Automatically configured by Supabase:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_ANON_KEY`

## Local Development

To test locally, use the Supabase CLI:

```bash
supabase start
```

This starts a local instance with the same database schema and edge functions.

## Performance Considerations

- Edge Functions run close to your data
- Cold start: ~200-500ms
- Warm execution: <100ms
- All functions are automatically scaled

## Differences from Express Backend

1. **No explicit authentication service** - Supabase handles JWT internally
2. **No repository pattern** - Direct database queries via client
3. **Simpler deployment** - Single code file per function
4. **Built-in scalability** - No server management needed
5. **Edge location** - Functions run globally, not centralized
