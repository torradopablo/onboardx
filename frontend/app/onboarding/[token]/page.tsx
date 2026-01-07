'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { apiClient } from '@/lib/api/client';
import { OnboardingProject, PlatformAccess, FileUpload } from '@/types';
import { PLATFORM_INSTRUCTIONS } from '@/lib/utils/constants';
import { Button } from '@/components/ui/Button';

export default function OnboardingPage() {
  const params = useParams();
  const token = params.token as string;
  const [project, setProject] = useState<OnboardingProject | null>(null);
  const [accesses, setAccesses] = useState<PlatformAccess[]>([]);
  const [files, setFiles] = useState<FileUpload[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedPlatform, setExpandedPlatform] = useState<string | null>(null);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    const loadOnboarding = async () => {
      try {
        const data = await apiClient.getOnboarding(token);
        setProject(data.project);
        setAccesses(data.accesses);
        setFiles(data.files);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load onboarding');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      loadOnboarding();
    }
  }, [token]);

  const handleAccessComplete = async (accessId: string) => {
    try {
      const updated = await apiClient.updateAccess(token, accessId, 'completed');
      setAccesses((prev) =>
        prev.map((a) => (a.id === accessId ? updated : a))
      );
    } catch (err) {
      alert('Failed to update access status');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0] || !project) return;

    try {
      const file = e.target.files[0];
      const uploaded = await apiClient.uploadFile(token, project.id, file);
      setFiles((prev) => [...prev, uploaded]);
      e.target.value = '';
    } catch (err) {
      alert('Failed to upload file');
    }
  };

  const handleComplete = async () => {
    try {
      setCompleting(true);
      await apiClient.completeOnboarding(token);
      setProject((prev) =>
        prev ? { ...prev, status: 'completed' } : null
      );
    } catch (err) {
      alert('Failed to complete onboarding');
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading your onboarding...</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-medium">Error loading onboarding</p>
          <p className="text-gray-500">{error || 'Project not found'}</p>
        </div>
      </div>
    );
  }

  const allAccessesComplete = accesses.every((a) => a.status === 'completed');
  const canComplete = allAccessesComplete;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Let's Get Started!</h1>
          <p className="text-gray-600 mb-8">
            Complete the setup for {project.client_name} to launch your campaigns
          </p>

          {/* Platform Accesses */}
          <div className="space-y-4 mb-8">
            <h2 className="text-xl font-semibold text-gray-900">Account Access</h2>
            {accesses.map((access) => (
              <div
                key={access.id}
                className="border border-gray-200 rounded-lg p-4"
              >
                <button
                  onClick={() =>
                    setExpandedPlatform(
                      expandedPlatform === access.platform ? null : access.platform
                    )
                  }
                  className="w-full flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        access.status === 'completed'
                          ? 'bg-success-500 border-success-500'
                          : 'border-gray-300'
                      }`}
                    >
                      {access.status === 'completed' && (
                        <span className="text-white text-xs">✓</span>
                      )}
                    </div>
                    <span className="font-medium text-gray-900">
                      {access.platform.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <span className="text-gray-500">
                    {expandedPlatform === access.platform ? '▼' : '▶'}
                  </span>
                </button>

                {expandedPlatform === access.platform && (
                  <div className="mt-4 p-4 bg-gray-50 rounded space-y-4">
                    <div className="space-y-2">
                      <h3 className="font-medium text-gray-900">Instructions:</h3>
                      <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
                        {PLATFORM_INSTRUCTIONS[access.platform as any]
                          .split('\n')
                          .filter((line) => line.trim().match(/^\d+\./))
                          .map((step, idx) => (
                            <li key={idx}>{step.replace(/^\d+\.\s/, '')}</li>
                          ))}
                      </ol>
                    </div>

                    {access.status !== 'completed' && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleAccessComplete(access.id)}
                      >
                        I've Granted Access
                      </Button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* File Upload */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload Files</h2>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <label className="cursor-pointer">
                <p className="text-gray-600 mb-2">Click to upload files</p>
                <input
                  type="file"
                  onChange={handleFileUpload}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                />
              </label>
            </div>

            {files.length > 0 && (
              <div className="mt-4 space-y-2">
                <h3 className="text-sm font-medium text-gray-700">Uploaded Files:</h3>
                {files.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center gap-2 p-2 bg-gray-50 rounded text-sm"
                  >
                    <span>📄</span>
                    <span className="text-gray-700">{file.file_name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Complete Button */}
          {canComplete ? (
            <Button
              variant="primary"
              fullWidth
              loading={completing}
              onClick={handleComplete}
              className="text-lg"
            >
              Complete Onboarding
            </Button>
          ) : (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-700 text-sm">
                Please complete all account access steps to proceed
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
