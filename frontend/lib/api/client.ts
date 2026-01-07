import axios, { AxiosInstance } from 'axios';
import { User, OnboardingProject, PlatformAccess, FileUpload, AuthResponse } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

class ApiClient {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          this.clearToken();
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );

    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
      if (this.token) {
        this.setAuthHeader(this.token);
      }
    }
  }

  private setAuthHeader(token: string) {
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
    this.setAuthHeader(token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
    delete this.client.defaults.headers.common['Authorization'];
  }

  // Auth endpoints
  async register(email: string, password: string, fullName: string, companyName?: string): Promise<AuthResponse> {
    const { data } = await this.client.post('/auth/register', {
      email,
      password,
      full_name: fullName,
      company_name: companyName,
    });
    return data;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const { data } = await this.client.post('/auth/login', { email, password });
    return data;
  }

  async getCurrentUser(): Promise<User> {
    const { data } = await this.client.get('/auth/me');
    return data;
  }

  async logout(): Promise<void> {
    this.clearToken();
  }

  // Projects endpoints
  async getProjects(filters?: { status?: string }): Promise<OnboardingProject[]> {
    const { data } = await this.client.get('/projects', { params: filters });
    return data;
  }

  async getProject(id: string): Promise<OnboardingProject> {
    const { data } = await this.client.get(`/projects/${id}`);
    return data;
  }

  async createProject(projectData: {
    client_name: string;
    client_email: string;
    platforms: string[];
    notes?: string;
  }): Promise<OnboardingProject> {
    const { data } = await this.client.post('/projects', projectData);
    return data;
  }

  async updateProject(id: string, updates: Partial<OnboardingProject>): Promise<OnboardingProject> {
    const { data } = await this.client.put(`/projects/${id}`, updates);
    return data;
  }

  async deleteProject(id: string): Promise<void> {
    await this.client.delete(`/projects/${id}`);
  }

  async getProjectLink(id: string): Promise<{ link: string; token: string }> {
    const { data } = await this.client.get(`/projects/${id}/link`);
    return data;
  }

  // Onboarding endpoints (public)
  async getOnboarding(token: string): Promise<{
    project: OnboardingProject;
    accesses: PlatformAccess[];
    files: FileUpload[];
  }> {
    const { data } = await axios.get(`${API_URL}/onboarding/${token}`);
    return data;
  }

  async updateAccess(token: string, accessId: string, status: 'completed'): Promise<PlatformAccess> {
    const { data } = await axios.put(`${API_URL}/onboarding/${token}/access/${accessId}`, {
      status,
    });
    return data;
  }

  async uploadFile(token: string, projectId: string, file: File): Promise<FileUpload> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('project_id', projectId);

    const { data } = await axios.post(`${API_URL}/onboarding/${token}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  }

  async completeOnboarding(token: string): Promise<OnboardingProject> {
    const { data } = await axios.post(`${API_URL}/onboarding/${token}/complete`);
    return data;
  }

  // Stripe endpoints
  async createCheckoutSession(priceId: string, billingCycle: 'monthly' | 'yearly'): Promise<{ session_id: string }> {
    const { data } = await this.client.post('/stripe/create-checkout', {
      price_id: priceId,
      billing_cycle: billingCycle,
    });
    return data;
  }

  async getSubscriptionStatus(): Promise<any> {
    const { data } = await this.client.get('/stripe/subscription/status');
    return data;
  }

  async getBillingPortalUrl(): Promise<{ url: string }> {
    const { data } = await this.client.post('/stripe/portal');
    return data;
  }
}

export const apiClient = new ApiClient();
