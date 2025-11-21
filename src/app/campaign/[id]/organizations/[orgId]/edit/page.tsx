'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  type Organization,
  type Character,
  type Location,
} from '@prisma/client';

type OrganizationWithRelations = Organization & {
  leader?: Character | null;
  headquarters?: Location | null;
  members?: Character[];
};

export default function EditOrganizationPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params.id as string;
  const orgId = params.orgId as string;

  const [formData, setFormData] = useState<OrganizationWithRelations>(
    {} as any
  );
  const [allCharacters, setAllCharacters] = useState<Character[]>([]);
  const [allLocations, setAllLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (orgId) {
      setIsLoading(true);
      fetch(`/api/organizations/${orgId}`)
        .then((res) => res.json())
        .then((data) => {
          setFormData(data);
          setIsLoading(false);
        })
        .catch((err) => console.error(err));
    }
  }, [orgId]);

  useEffect(() => {
    if (campaignId) {
      fetch(`/api/campaigns/${campaignId}/lists`)
        .then((res) => res.json())
        .then((data) => {
          setAllCharacters(data.characters);
          setAllLocations(data.locations);
        });
    }
  }, [campaignId]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLeaderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, leaderId: value || null } as any));
  };

  const handleHeadquartersChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, headquartersId: value || null } as any));
  };

  const handleMemberToggle = (charId: string) => {
    const currentMembers = formData.members || [];
    const isMember = currentMembers.some((m) => m.id === charId);
    let newMembers;
    if (isMember) {
      newMembers = currentMembers.filter((m) => m.id !== charId);
    } else {
      const charToAdd = allCharacters.find((c) => c.id === charId);
      if (charToAdd) newMembers = [...currentMembers, charToAdd];
      else newMembers = currentMembers;
    }
    setFormData((prev) => ({ ...prev, members: newMembers }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const payload = {
      ...formData,
      memberIds: formData.members?.map((m) => m.id) || [],
    };

    try {
      const response = await fetch(`/api/organizations/${orgId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Failed to save');

      alert('Changes saved!');
      // Redirect to View Page
      router.push(`/campaign/${campaignId}/organizations/${orgId}`);
      router.refresh();
    } catch (error) {
      console.error(error);
      alert('Error saving changes.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="p-24 text-center">Loading...</div>;
  if (!formData.name) return <div className="p-24 text-center">Not Found</div>;

  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <div className="w-full max-w-4xl">
        <Link
          href={`/campaign/${campaignId}/organizations/${orgId}`}
          className="text-blue-400 hover:text-blue-300"
        >
          &larr; Cancel & Back to View
        </Link>
        <h1 className="text-5xl font-bold my-8">Edit: {formData.name}</h1>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300">
                Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="mt-1 w-full rounded-md bg-gray-800 border-gray-600 p-3"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">
                Type
              </label>
              <input
                type="text"
                name="type"
                value={formData.type || ''}
                onChange={handleChange}
                className="mt-1 w-full rounded-md bg-gray-800 border-gray-600 p-3"
              />
            </div>
          </div>

          <div className="bg-gray-900 p-6 rounded-lg border border-gray-700 space-y-6">
            <h3 className="text-xl font-semibold text-blue-300">Relations</h3>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Leader
              </label>
              <select
                value={formData.leader?.id || formData.leaderId || ''}
                onChange={handleLeaderChange}
                className="w-full rounded-md bg-gray-800 border-gray-600 p-3 text-white"
              >
                <option value="">(No Leader)</option>
                {allCharacters.map((char) => (
                  <option key={char.id} value={char.id}>
                    {char.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Headquarters
              </label>
              <select
                value={
                  formData.headquarters?.id || formData.headquartersId || ''
                }
                onChange={handleHeadquartersChange}
                className="w-full rounded-md bg-gray-800 border-gray-600 p-3 text-white"
              >
                <option value="">(No Headquarters)</option>
                {allLocations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Members
              </label>
              <div className="h-60 overflow-y-auto bg-gray-800 border border-gray-600 rounded-md p-4">
                {allCharacters.map((char) => {
                  const isChecked = formData.members?.some(
                    (m) => m.id === char.id
                  );
                  return (
                    <label
                      key={char.id}
                      className="flex items-center space-x-3 mb-2 cursor-pointer hover:bg-gray-700 p-1 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked || false}
                        onChange={() => handleMemberToggle(char.id)}
                        className="rounded border-gray-500 bg-gray-900 text-blue-600 focus:ring-blue-500"
                      />
                      <span>{char.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">
              Description
            </label>
            <textarea
              name="description"
              rows={10}
              value={formData.description || ''}
              onChange={handleChange}
              className="mt-1 w-full rounded-md bg-gray-800 border-gray-600 p-3"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300">
                Status
              </label>
              <input
                type="text"
                name="status"
                value={formData.status || ''}
                onChange={handleChange}
                className="mt-1 w-full rounded-md bg-gray-800 border-gray-600 p-3"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">
                Founding
              </label>
              <input
                type="text"
                name="founding"
                value={formData.founding || ''}
                onChange={handleChange}
                className="mt-1 w-full rounded-md bg-gray-800 border-gray-600 p-3"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-md bg-blue-600 px-6 py-2 font-bold hover:bg-blue-700 disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
