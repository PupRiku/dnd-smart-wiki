'use client'; // This is a Client Component

import { useState, useEffect, FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { type SessionSummary } from '@prisma/client';
import ScrybeQuillModal from '@/components/ScrybeQuillModal'; // <-- IMPORT MODAL

// Define a type for our form data
type SessionFormData = Partial<SessionSummary>;

export default function EditSessionPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params.id as string;
  const sessionId = params.sessionId as string;

  const [formData, setFormData] = useState<SessionFormData>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // --- NEW STATE FOR MODAL ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);

  // Fetch the session data when the page loads
  useEffect(() => {
    if (sessionId) {
      setIsLoading(true);
      fetch(`/api/sessions/${sessionId}`)
        .then((res) => res.json())
        .then((data: SessionSummary) => {
          setFormData(data);
          setIsLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setIsLoading(false);
        });
    }
  }, [sessionId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // --- NEW: Handle the Scrybe Quill Import ---
  const handleScrybeQuillSubmit = async (sqData: {
    recap: string;
    outline: string;
    quotes: string;
    notes: string;
  }) => {
    setIsEnhancing(true);
    try {
      // We send the SQ data AND the current Storybook recap to the API
      const response = await fetch(`/api/sessions/${sessionId}/enhance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...sqData,
          currentStorybook: formData.recap, // Send current text for context
          campaignId: campaignId, // Needed for wiki upserts
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to enhance session.');
      }

      const result = await response.json();

      // Update the form with the NEW, enhanced data
      setFormData((prev) => ({
        ...prev,
        recap: result.enhancedRecap, // The AI merged version
        outline: result.outline, // The SQ outline
        notes: result.notes, // The SQ notes
      }));

      alert('Session enhanced and Wiki updated successfully!');
      setIsModalOpen(false);
    } catch (error) {
      console.error(error);
      alert('Error enhancing session.');
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const response = await fetch(`/api/sessions/${sessionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save changes');
      }

      alert('Changes saved!');
      router.push(`/campaign/${campaignId}/session/${sessionId}`);
      router.refresh();
    } catch (error) {
      console.error(error);
      alert(
        `Error: ${
          error instanceof Error ? error.message : 'An error occurred.'
        }`
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <main className="flex min-h-screen flex-col items-center p-24">
        <p>Loading session data...</p>
      </main>
    );
  }

  if (!formData.title) {
    return (
      <main className="flex min-h-screen flex-col items-center p-24">
        <h1 className="text-3xl font-bold">Session not found.</h1>
        <Link
          href={`/campaign/${campaignId}`}
          className="mt-4 text-blue-400 hover:text-blue-300"
        >
          &larr; Back to Campaign Home
        </Link>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      {/* --- Render the Modal --- */}
      <ScrybeQuillModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleScrybeQuillSubmit}
        isEnhancing={isEnhancing}
      />

      <div className="w-full max-w-4xl">
        <Link
          href={`/campaign/${campaignId}/session/${sessionId}`}
          className="text-blue-400 hover:text-blue-300"
        >
          &larr; Back to Session
        </Link>

        {/* --- Header with Import Button --- */}
        <div className="flex justify-between items-center my-8">
          <h1 className="text-5xl font-bold">
            Edit Session {formData.sessionNumber}
          </h1>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-purple-700"
          >
            Import from Scrybe Quill
          </button>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* --- Title & Chapter Title --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-300"
              >
                Session Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title ?? ''}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-600 bg-gray-800 p-3 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label
                htmlFor="chapterTitle"
                className="block text-sm font-medium text-gray-300"
              >
                Storybook Chapter Title (Optional)
              </label>
              <input
                type="text"
                id="chapterTitle"
                name="chapterTitle"
                value={formData.chapterTitle ?? ''}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-600 bg-gray-800 p-3 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* --- Storybook Recap --- */}
          <div>
            <label
              htmlFor="recap"
              className="block text-sm font-medium text-gray-300"
            >
              Storybook Recap
            </label>
            <textarea
              id="recap"
              name="recap"
              rows={20}
              value={formData.recap ?? ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-600 bg-gray-800 p-3 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {/* --- Outline --- */}
          <div>
            <label
              htmlFor="outline"
              className="block text-sm font-medium text-gray-300"
            >
              Outline
            </label>
            <textarea
              id="outline"
              name="outline"
              rows={5}
              value={formData.outline ?? ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-600 bg-gray-800 p-3 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {/* --- Notes --- */}
          <div>
            <label
              htmlFor="notes"
              className="block text-sm font-medium text-gray-300"
            >
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={5}
              value={formData.notes ?? ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-600 bg-gray-800 p-3 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {/* --- Form Actions --- */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:bg-gray-500"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
