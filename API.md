# OnboardX API Reference

## Base URLs

- **Express Backend**: `http://localhost:3001/api`
- **Supabase Backend**: `https://[project-id].supabase.co/functions/v1`

All requests should include:
```
Content-Type: application/json
```

## Authentication

Authenticated endpoints require:
```
Authorization: Bearer {token}
```

Get a token by logging in via `/auth/login`.

## Response Format

### Success Response
```json
{
  "id": "uuid",
  "field": "value"
}
```

### Error Response
```json
{
  "error": "Error message"
}
```

## Endpoints

### Authentication

#### Register User
```
POST /auth/register

Body:
{
  "email": "user@example.com",
  "password": "password123",
  "full_name": "John Doe",
  "company_name": "Acme Corp" // optional
}

Response:
{
  "user": { id, email, full_name, company_name, subscription_status, subscription_tier, created_at, updated_at },
  "token": "jwt_token"
}

Status: 201
```

#### Login
```
POST /auth/login

Body:
{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "user": { id, email, full_name, ... },
  "token": "jwt_token"
}

Status: 200
```

#### Get Current User
```
GET /auth/me

Headers:
Authorization: Bearer {token}

Response:
{
  "id": "uuid",
  "email": "user@example.com",
  "full_name": "John Doe",
  "company_name": "Acme Corp",
  "subscription_status": "trial",
  "subscription_tier": "starter",
  "created_at": "2024-01-07T...",
  "updated_at": "2024-01-07T..."
}

Status: 200
```

### Projects

#### List All Projects
```
GET /projects

Headers:
Authorization: Bearer {token}

Query Parameters:
status: "pending" | "in_progress" | "completed" (optional)

Response:
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "client_name": "Acme Corp",
    "client_email": "contact@acme.com",
    "public_token": "uuid",
    "status": "pending",
    "platforms": ["google_ads", "meta_ads"],
    "notes": "Optional notes",
    "completed_at": null,
    "created_at": "2024-01-07T...",
    "updated_at": "2024-01-07T..."
  }
]

Status: 200
```

#### Create Project
```
POST /projects

Headers:
Authorization: Bearer {token}

Body:
{
  "client_name": "Acme Corp",
  "client_email": "contact@acme.com",
  "platforms": ["google_ads", "meta_ads", "ga4"],
  "notes": "Optional notes"
}

Response:
{
  "id": "uuid",
  "user_id": "uuid",
  "client_name": "Acme Corp",
  "client_email": "contact@acme.com",
  "public_token": "uuid",
  "status": "pending",
  "platforms": ["google_ads", "meta_ads", "ga4"],
  "notes": "Optional notes",
  "completed_at": null,
  "created_at": "2024-01-07T...",
  "updated_at": "2024-01-07T..."
}

Status: 201
```

#### Get Project
```
GET /projects/{id}

Headers:
Authorization: Bearer {token}

Response:
{
  "id": "uuid",
  "user_id": "uuid",
  "client_name": "Acme Corp",
  "client_email": "contact@acme.com",
  "public_token": "uuid",
  "status": "pending",
  "platforms": ["google_ads", "meta_ads"],
  "notes": "Optional notes",
  "completed_at": null,
  "created_at": "2024-01-07T...",
  "updated_at": "2024-01-07T..."
}

Status: 200
```

#### Update Project
```
PUT /projects/{id}

Headers:
Authorization: Bearer {token}

Body:
{
  "status": "in_progress",
  "notes": "Updated notes"
}

Response: { updated project }

Status: 200
```

#### Delete Project
```
DELETE /projects/{id}

Headers:
Authorization: Bearer {token}

Status: 204
```

#### Get Onboarding Link
```
GET /projects/{id}/link

Headers:
Authorization: Bearer {token}

Response:
{
  "link": "http://localhost:3000/onboarding/token-uuid",
  "token": "token-uuid"
}

Status: 200
```

### Onboarding (Public)

#### Get Onboarding Data
```
GET /onboarding/{token}

Response:
{
  "project": { id, client_name, status, platforms, ... },
  "accesses": [
    {
      "id": "uuid",
      "project_id": "uuid",
      "platform": "google_ads",
      "status": "pending",
      "instructions_viewed": false,
      "completed_at": null,
      "created_at": "2024-01-07T...",
      "updated_at": "2024-01-07T..."
    }
  ],
  "files": [
    {
      "id": "uuid",
      "project_id": "uuid",
      "file_name": "logo.png",
      "file_url": "https://...",
      "file_type": "image/png",
      "file_size": 1024,
      "uploaded_by": "client",
      "created_at": "2024-01-07T..."
    }
  ]
}

Status: 200
```

#### Update Platform Access
```
PUT /onboarding/{token}/access/{accessId}

Body:
{
  "status": "completed"
}

Response:
{
  "id": "uuid",
  "project_id": "uuid",
  "platform": "google_ads",
  "status": "completed",
  "instructions_viewed": true,
  "completed_at": "2024-01-07T...",
  "created_at": "2024-01-07T...",
  "updated_at": "2024-01-07T..."
}

Status: 200
```

#### Upload File
```
POST /onboarding/{token}/upload

Content-Type: multipart/form-data

Body:
file: <binary file>

Response:
{
  "id": "uuid",
  "project_id": "uuid",
  "file_name": "logo.png",
  "file_url": "https://s3.amazonaws.com/...",
  "file_type": "image/png",
  "file_size": 1024,
  "uploaded_by": "client",
  "created_at": "2024-01-07T..."
}

Status: 201
```

#### Complete Onboarding
```
POST /onboarding/{token}/complete

Response:
{
  "id": "uuid",
  "status": "completed",
  "completed_at": "2024-01-07T...",
  ...
}

Status: 200
```

### Stripe (Express Backend)

#### Create Checkout Session
```
POST /stripe/create-checkout

Headers:
Authorization: Bearer {token}

Body:
{
  "price_id": "price_1234567890",
  "billing_cycle": "monthly" | "yearly"
}

Response:
{
  "session_id": "cs_test_123..."
}

Status: 201
```

#### Get Subscription Status
```
GET /stripe/subscription/status

Headers:
Authorization: Bearer {token}

Response:
{
  "id": "sub_1234567890",
  "status": "active",
  "current_period_start": "2024-01-07T...",
  "current_period_end": "2024-02-07T...",
  ...
}

Status: 200
```

#### Get Billing Portal Link
```
POST /stripe/portal

Headers:
Authorization: Bearer {token}

Response:
{
  "url": "https://billing.stripe.com/session/..."
}

Status: 200
```

## Error Codes

| Status | Error | Description |
|--------|-------|-------------|
| 400 | Bad Request | Invalid input or request body |
| 401 | Unauthorized | Missing or invalid token |
| 403 | Forbidden | User doesn't have access to resource |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource already exists (e.g., user email) |
| 500 | Internal Server Error | Server error |

## Rate Limiting

- **Auth Endpoints**: 10 requests per minute per IP
- **Other Endpoints**: 100 requests per minute per user
- **Public Endpoints**: 50 requests per minute per IP

Headers included in response:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1234567890
```

## Data Types

### Platform
```
"google_ads" | "meta_ads" | "ga4" | "gtm"
```

### ProjectStatus
```
"pending" | "in_progress" | "completed"
```

### AccessStatus
```
"pending" | "completed"
```

### SubscriptionStatus
```
"trial" | "active" | "cancelled" | "past_due"
```

### SubscriptionTier
```
"starter" | "pro" | "enterprise"
```

## Examples

### Complete User Flow

1. **Register**
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "agency@example.com",
    "password": "password123",
    "full_name": "Jane Smith",
    "company_name": "Marketing Agency"
  }'
```

2. **Create Project**
```bash
curl -X POST http://localhost:3001/api/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "client_name": "Acme Corp",
    "client_email": "contact@acme.com",
    "platforms": ["google_ads", "meta_ads"],
    "notes": "Setup for Q1 campaigns"
  }'
```

3. **Get Onboarding Link**
```bash
curl http://localhost:3001/api/projects/{id}/link \
  -H "Authorization: Bearer {token}"
```

4. **Client Opens Link** (no auth required)
```bash
curl http://localhost:3001/api/onboarding/{token}
```

5. **Client Completes Setup**
```bash
curl -X PUT http://localhost:3001/api/onboarding/{token}/access/{accessId} \
  -H "Content-Type: application/json" \
  -d '{"status": "completed"}'

curl -X POST http://localhost:3001/api/onboarding/{token}/complete
```

## Webhooks

### Stripe Webhooks
Endpoint: `POST /stripe/webhook`

Listens for:
- `checkout.session.completed`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

## Best Practices

1. **Always include Authorization header** for authenticated endpoints
2. **Validate token expiration** - tokens expire after 15 minutes
3. **Use pagination** for list endpoints (coming in future updates)
4. **Handle rate limiting** - implement exponential backoff
5. **Validate input** before sending to API
6. **Never expose secrets** in frontend code
