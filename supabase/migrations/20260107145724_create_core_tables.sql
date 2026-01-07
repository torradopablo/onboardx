/*
  # OnboardX Core Tables

  1. New Tables
    - `users` - Agency/Freelancer accounts
    - `onboarding_projects` - Client onboarding projects
    - `platform_accesses` - Track platform completion status
    - `file_uploads` - Client uploaded files
    - `subscriptions` - Stripe subscription tracking

  2. Security
    - Enable RLS on all tables
    - Create policies for authentication and authorization
    - Implement row-level access control

  3. Indexes
    - Add indexes for frequently queried columns
    - Improve query performance
*/

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  full_name text,
  company_name text,
  password_hash text NOT NULL,
  stripe_customer_id text,
  subscription_status text DEFAULT 'trial',
  subscription_tier text DEFAULT 'starter',
  trial_ends_at timestamp with time zone DEFAULT now() + interval '7 days',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own data"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Onboarding Projects table
CREATE TABLE IF NOT EXISTS onboarding_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  client_name text NOT NULL,
  client_email text NOT NULL,
  public_token text UNIQUE NOT NULL DEFAULT gen_random_uuid()::text,
  status text DEFAULT 'pending',
  platforms text[] NOT NULL DEFAULT '{}',
  notes text,
  completed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE onboarding_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own projects"
  ON onboarding_projects FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create projects"
  ON onboarding_projects FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own projects"
  ON onboarding_projects FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own projects"
  ON onboarding_projects FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Platform Accesses table
CREATE TABLE IF NOT EXISTS platform_accesses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES onboarding_projects(id) ON DELETE CASCADE,
  platform text NOT NULL,
  status text DEFAULT 'pending',
  instructions_viewed boolean DEFAULT false,
  confirmation_data jsonb,
  completed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE platform_accesses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read platform accesses for own projects"
  ON platform_accesses FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM onboarding_projects
      WHERE onboarding_projects.id = platform_accesses.project_id
      AND onboarding_projects.user_id = auth.uid()
    )
  );

-- File Uploads table
CREATE TABLE IF NOT EXISTS file_uploads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES onboarding_projects(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_url text NOT NULL,
  file_type text,
  file_size integer,
  uploaded_by text DEFAULT 'client',
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE file_uploads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read files for own projects"
  ON file_uploads FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM onboarding_projects
      WHERE onboarding_projects.id = file_uploads.project_id
      AND onboarding_projects.user_id = auth.uid()
    )
  );

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stripe_subscription_id text UNIQUE,
  stripe_price_id text,
  status text,
  current_period_start timestamp with time zone,
  current_period_end timestamp with time zone,
  cancel_at_period_end boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own subscription"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Indexes
CREATE INDEX idx_projects_user ON onboarding_projects(user_id);
CREATE INDEX idx_projects_token ON onboarding_projects(public_token);
CREATE INDEX idx_projects_status ON onboarding_projects(status);
CREATE INDEX idx_projects_created ON onboarding_projects(created_at);
CREATE INDEX idx_accesses_project ON platform_accesses(project_id);
CREATE INDEX idx_accesses_status ON platform_accesses(status);
CREATE INDEX idx_uploads_project ON file_uploads(project_id);
CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_users_email ON users(email);
