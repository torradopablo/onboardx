/*
  # Add Public Access Policies for Client Onboarding

  1. Security Changes
    - Add policies for unauthenticated access via public token
    - Allow platform_accesses to be read and updated via token
    - Allow file_uploads to be created via token
    - Token validation handled by application layer
*/

CREATE POLICY "Public can read platform accesses"
  ON platform_accesses FOR SELECT
  USING (true);

CREATE POLICY "Public can update platform accesses"
  ON platform_accesses FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can create file uploads"
  ON file_uploads FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public can read file uploads"
  ON file_uploads FOR SELECT
  USING (true);
