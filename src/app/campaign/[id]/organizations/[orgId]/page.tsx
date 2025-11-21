'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  type Organization,
  type Character,
  type Location,
} from '@prisma/client';

// Extend the type to include the relations we fetch
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

  // Form Data
  const [formData, setFormData] = useState<OrganizationWithRelations>(
    {} as any
  );

  // Options for Dropdowns
  const [allCharacters, setAllCharacters] = useState<Character[]>([]);
  const [allLocations, setAllLocations] = useState<Location[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // 1. Fetch Organization Data
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

  // 2. Fetch Dropdown Options (Characters & Locations)
  useEffect(() => {
    if (campaignId) {
      // Fetch All Characters (PC & NPC)
      fetch(`/api/campaigns/${campaignId}/entities?type=Character`); // Note: We need a robust way to get IDs.
      // Actually, our 'entities' route only returns names.
      // Let's do a quick direct fetch pattern here for simplicity.

      // Fetch Characters
      fetch(`/api/campaigns/${campaignId}/characters`); // We don't have this route yet, so let's recycle the one-by-one fetch pattern or just use a quick trick.
      // TRICK: We'll assume we can get a list. Actually, let's just fetch the pages we already built logic for.
      // A cleaner way: We need a generic "get all with IDs" route.
      // Let's temporarily fetch from the 'entities' route but we need IDs.
      // FOR NOW: Let's assume we just need a lightweight list.
      // Let's create a temporary helper to fetch full lists.

      // ACTUALLY: Let's just fetch the full character/location lists using a new fetch call to the campaign page logic?
      // No, that's server side.
      // Let's rely on a simpler method: We'll add logic to the useEffect to fetch these lists.
      // Since we don't have a dedicated "List All Characters JSON" route, we will skip creating a new route
      // and assume we add a simple query param to our existing routes or create a quick helper.
      // Let's fetch the "Characters" page data? No.

      // Okay, let's stick to the plan: WE NEED TO FETCH THE LISTS.
      // I will write the fetch logic assuming we will add a simple "list" param to the existing GET routes
      // OR (better) just create a quick generic fetch here.

      // ... Actually, we don't have a route to get ALL characters with IDs.
      // Let's leave these empty for a second and I'll give you the instruction to create the "List API" in the next step.
    }
  }, [campaignId]);

  // --- FIX: We need a way to get the lists. Let's reuse the 'entities' route but update it to return IDs?
  // No, that breaks the Merge modal.
  // Let's add a Fetch in the useEffect that assumes a new route `/api/campaigns/[id]/lists` exists.
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

  // Handle Leader Selection
  const handleLeaderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value; // ID or ""
    setFormData((prev) => ({ ...prev, leaderId: value || null } as any));
  };

  // Handle HQ Selection
  const handleHeadquartersChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const value = e.target.value; // ID or ""
    setFormData((prev) => ({ ...prev, headquartersId: value || null } as any));
  };

  // Handle Members Checkboxes
  const handleMemberToggle = (charId: string) => {
    const currentMembers = formData.members || [];
    const isMember = currentMembers.some((m) => m.id === charId);

    let newMembers;
    if (isMember) {
      newMembers = currentMembers.filter((m) => m.id !== charId);
    } else {
      // Find the character object to add locally for UI
      const charToAdd = allCharacters.find((c) => c.id === charId);
      if (charToAdd) newMembers = [...currentMembers, charToAdd];
      else newMembers = currentMembers;
    }
    setFormData((prev) => ({ ...prev, members: newMembers }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    // Prepare payload: map member objects back to IDs
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
      router.push(`/campaign/${campaignId}/organizations`);
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
          href={`/campaign/${campaignId}/organizations`}
          className="text-blue-400 hover:text-blue-300"
        >
          &larr; Back
        </Link>
        <h1 className="text-5xl font-bold my-8">Edit: {formData.name}</h1>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Basic Info */}
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

          {/* Relations Section */}
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-700 space-y-6">
            <h3 className="text-xl font-semibold text-blue-300">Relations</h3>

            {/* Leader Dropdown */}
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

            {/* HQ Dropdown */}
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

            {/* Members Checkboxes */}
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

          {/* Description */}
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

          {/* Submit */}
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
