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

        {/* --- Character List --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaign.characters.length === 0 ? (
            <p className="text-gray-400">
              No characters found for this campaign yet.
            </p>
          ) : (
            campaign.characters.map((character) => (
              <div
                key={character.id}
                className="p-6 bg-gray-800 rounded-lg shadow-md"
              >
                <h3 className="text-2xl font-semibold text-white mb-2">
                  {character.name}
                </h3>
                <p className="text-gray-300 text-sm mb-1">
                  {character.type ? `${character.type} | ` : ''}
                  {character.species ? `${character.species} | ` : ''}
                  {character.class ? character.class : ''}
                </p>
                <p className="text-gray-400 mt-4 line-clamp-3">
                  {character.description}
                </p>
                {/* This will be our edit link later */}
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
