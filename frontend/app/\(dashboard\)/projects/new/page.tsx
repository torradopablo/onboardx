'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { apiClient } from '@/lib/api/client';
import { PLATFORMS } from '@/lib/utils/constants';

export default function CreateProjectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    client_name: '',
    client_email: '',
    platforms: [] as string[],
    notes: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const togglePlatform = (platform: string) => {
    setFormData((prev) => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter((p) => p !== platform)
        : [...prev.platforms, platform],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.client_name || !formData.client_email || formData.platforms.length === 0) {
      setError('Please fill all required fields and select at least one platform');
      return;
    }

    try {
      setLoading(true);
      const project = await apiClient.createProject(formData);
      router.push(`/projects/${project.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Project</h1>
          <p className="text-gray-600 mb-8">Set up a new client onboarding flow</p>

          {error && (
            <div className="mb-4 p-4 bg-error-50 border border-error-300 rounded-lg">
              <p className="text-error-700 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Client Info */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Client Information</h2>
              <Input
                label="Client Name"
                name="client_name"
                value={formData.client_name}
                onChange={handleChange}
                placeholder="Acme Corp"
                required
                fullWidth
              />
              <Input
                label="Client Email"
                type="email"
                name="client_email"
                value={formData.client_email}
                onChange={handleChange}
                placeholder="contact@acme.com"
                required
                fullWidth
              />
            </div>

            {/* Platforms */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Select Platforms</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(PLATFORMS).map(([key, platform]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => togglePlatform(key)}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      formData.platforms.includes(key)
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={formData.platforms.includes(key)}
                        onChange={() => {}}
                        className="mt-1"
                      />
                      <div>
                        <p className="font-medium text-gray-900">{platform.name}</p>
                        <p className="text-sm text-gray-600">{platform.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Any additional notes for the client..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                fullWidth
                loading={loading}
              >
                Create Project
              </Button>
              <Button
                type="button"
                variant="secondary"
                fullWidth
                onClick={() => router.back()}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
