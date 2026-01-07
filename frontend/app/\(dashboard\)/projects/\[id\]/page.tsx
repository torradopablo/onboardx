'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { OnboardingProject } from '@/types';
import { apiClient } from '@/lib/api/client';
import { Button } from '@/components/ui/Button';

export default function ProjectPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const [project, setProject] = useState<OnboardingProject | null>(null);
  const [link, setLink] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const loadProject = async () => {
      try {
        const data = await apiClient.getProject(projectId);
        setProject(data);

        const linkData = await apiClient.getProjectLink(projectId);
        setLink(linkData.link);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load project');
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      loadProject();
    }
  }, [projectId]);

  const copyLink = () => {
    if (link) {
      navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-medium">Error</p>
          <p className="text-gray-500">{error || 'Project not found'}</p>
          <Button variant="primary" onClick={() => router.push('/dashboard')} className="mt-4">
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <Button variant="secondary" onClick={() => router.back()} className="mb-6">
          ← Back
        </Button>

        <div className="bg-white rounded-lg shadow p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{project.client_name}</h1>
          <p className="text-gray-600 mb-8">{project.client_email}</p>

          {/* Status */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Status</p>
            <p className="text-xl font-semibold text-gray-900 mt-1">{project.status}</p>
          </div>

          {/* Share Link */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Onboarding Link</h2>
            {link ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={link}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                />
                <Button variant="primary" onClick={copyLink}>
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
              </div>
            ) : (
              <p className="text-gray-600">Loading link...</p>
            )}
            <p className="text-sm text-gray-600 mt-2">
              Send this link to {project.client_name} to complete the onboarding
            </p>
          </div>

          {/* Platforms */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Required Platforms</h2>
            <div className="flex flex-wrap gap-2">
              {project.platforms.map((platform) => (
                <span
                  key={platform}
                  className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium"
                >
                  {platform.replace('_', ' ').toUpperCase()}
                </span>
              ))}
            </div>
          </div>

          {/* Notes */}
          {project.notes && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes</h2>
              <p className="text-gray-700">{project.notes}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-6 border-t border-gray-200">
            <Button
              variant="danger"
              onClick={async () => {
                if (confirm('Are you sure? This cannot be undone.')) {
                  try {
                    await apiClient.deleteProject(projectId);
                    router.push('/dashboard');
                  } catch (err) {
                    alert('Failed to delete project');
                  }
                }
              }}
            >
              Delete Project
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
