import Link from 'next/link';
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';

// This page's params are a promise, just like the campaign page
export default async function CharactersPage({
  params: paramsPromise,
}: {
  params: Promise<{ id: string }>;
}) {
  // 1. Await the params promise to get the campaign ID
  const params = await paramsPromise;

  // 2. Fetch the campaign and its related characters
  const campaign = await prisma.campaign.findUnique({
    where: {
      id: params.id,
    },
    include: {
      characters: {
        // Ask Prisma to include all characters for this campaign
        orderBy: {
          name: 'asc', // Sort them alphabetically
        },
      },
    },
  });

  // 3. If no campaign is found, show a 404 page
  if (!campaign) {
    notFound();
  }

  // --- 4. NEW: Filter characters into PCs and NPCs ---
  const pcs = campaign.characters.filter(
    (char) => char.type?.toLowerCase() === 'pc'
  );

  // Group everyone else as an NPC/Other
  const npcs = campaign.characters.filter(
    (char) => char.type?.toLowerCase() !== 'pc'
  );

  // Helper function to render a character card
  const CharacterCard = (character: any) => (
    <Link
      key={character.id}
      href={`/campaign/${params.id}/characters/${character.id}`} // <-- This is the new link
      className="block p-6 bg-gray-800 rounded-lg shadow-md hover:bg-gray-700 transition-colors"
    >
      <h3 className="text-2xl font-semibold text-white mb-2">
        {character.name}
      </h3>
      <p className="text-gray-300 text-sm mb-1 capitalize">
        {/* Combine species and class, filtering out nulls */}
        {[character.species, character.class].filter(Boolean).join(' | ')}
      </p>
      <p className="text-gray-400 mt-4 line-clamp-3">{character.description}</p>
    </Link>
  );

  // 4. Render the page
  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <div className="w-full max-w-5xl">
        {/* --- Header & Back Link --- */}
        <Link
          href={`/campaign/${campaign.id}`} // Link back to the main campaign page
          className="text-blue-400 hover:text-blue-300 transition-colors"
        >
          &larr; Back to {campaign.name}
        </Link>
        <h1 className="text-5xl font-bold my-8">{campaign.name}: Characters</h1>

        {/* --- Player Characters List --- */}
        <section>
          <h2 className="text-3xl font-semibold mb-6 border-b border-gray-700 pb-2">
            Player Characters
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pcs.length === 0 ? (
              <p className="text-gray-400 col-span-full">
                No player characters found for this campaign yet.
              </p>
            ) : (
              pcs.map(CharacterCard)
            )}
          </div>
        </section>

        {/* --- NPCs & Other Beings List --- */}
        <section className="mt-12">
          <h2 className="text-3xl font-semibold mb-6 border-b border-gray-700 pb-2">
            NPCs & Other Beings
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {npcs.length === 0 ? (
              <p className="text-gray-400 col-span-full">
                No NPCs found for this campaign yet.
              </p>
            ) : (
              npcs.map(CharacterCard)
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
