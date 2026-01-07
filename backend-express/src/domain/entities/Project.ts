export interface OnboardingProject {
  id: string;
  user_id: string;
  client_name: string;
  client_email: string;
  public_token: string;
  status: 'pending' | 'in_progress' | 'completed';
  platforms: string[];
  notes?: string;
  completed_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface CreateProjectInput {
  client_name: string;
  client_email: string;
  platforms: string[];
  notes?: string;
}

export function projectToDTO(project: OnboardingProject) {
  return {
    id: project.id,
    user_id: project.user_id,
    client_name: project.client_name,
    client_email: project.client_email,
    public_token: project.public_token,
    status: project.status,
    platforms: project.platforms,
    notes: project.notes,
    completed_at: project.completed_at?.toISOString(),
    created_at: project.created_at.toISOString(),
    updated_at: project.updated_at.toISOString(),
  };
}
