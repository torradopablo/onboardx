export interface User {
  id: string;
  email: string;
  password_hash: string;
  full_name?: string;
  company_name?: string;
  stripe_customer_id?: string;
  subscription_status: 'trial' | 'active' | 'cancelled' | 'past_due';
  subscription_tier: 'starter' | 'pro' | 'enterprise';
  trial_ends_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserInput {
  email: string;
  password: string;
  full_name: string;
  company_name?: string;
}

export interface UserDTO {
  id: string;
  email: string;
  full_name?: string;
  company_name?: string;
  subscription_status: string;
  subscription_tier: string;
  trial_ends_at?: string;
  created_at: string;
  updated_at: string;
}

export function userToDTO(user: User): UserDTO {
  return {
    id: user.id,
    email: user.email,
    full_name: user.full_name,
    company_name: user.company_name,
    subscription_status: user.subscription_status,
    subscription_tier: user.subscription_tier,
    trial_ends_at: user.trial_ends_at?.toISOString(),
    created_at: user.created_at.toISOString(),
    updated_at: user.updated_at.toISOString(),
  };
}
