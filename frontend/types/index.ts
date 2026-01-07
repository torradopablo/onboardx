export type Platform = 'google_ads' | 'meta_ads' | 'ga4' | 'gtm';

export type ProjectStatus = 'pending' | 'in_progress' | 'completed';
export type AccessStatus = 'pending' | 'completed';
export type SubscriptionStatus = 'trial' | 'active' | 'cancelled' | 'past_due';
export type SubscriptionTier = 'starter' | 'pro' | 'enterprise';

export interface User {
  id: string;
  email: string;
  full_name?: string;
  company_name?: string;
  subscription_status: SubscriptionStatus;
  subscription_tier: SubscriptionTier;
  trial_ends_at?: string;
  created_at: string;
  updated_at: string;
}

export interface OnboardingProject {
  id: string;
  user_id: string;
  client_name: string;
  client_email: string;
  public_token: string;
  status: ProjectStatus;
  platforms: Platform[];
  notes?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface PlatformAccess {
  id: string;
  project_id: string;
  platform: Platform;
  status: AccessStatus;
  instructions_viewed: boolean;
  confirmation_data?: any;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface FileUpload {
  id: string;
  project_id: string;
  file_name: string;
  file_url: string;
  file_type?: string;
  file_size?: number;
  uploaded_by: 'client' | 'agency';
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  stripe_subscription_id?: string;
  stripe_price_id?: string;
  status?: string;
  current_period_start?: string;
  current_period_end?: string;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}
