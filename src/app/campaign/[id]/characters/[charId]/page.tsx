import Link from 'next/link';
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';

export default async function CharacterViewPage({
  params: paramsPromise,
}: {
  params: Promise<{ id: string; charId: string }>;
}) {
  const params = await paramsPromise;

  const character = await prisma.character.findUnique({
    where: { id: params.charId },
  });

  if (!character) notFound();

  // Helper to display stats boxes
  const StatBox = ({
    label,
    value,
  }: {
    label: string;
    value: number | null;
  }) => (
    <div className="bg-gray-800 p-3 rounded-lg text-center border border-gray-700">
      <div className="text-xs text-gray-400 uppercase tracking-wider">
        {label}
      </div>
      <div className="text-xl font-bold text-white">{value ?? '-'}</div>
    </div>
  );

  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <div className="w-full max-w-4xl">
        {/* Header / Nav */}
        <div className="flex justify-between items-center mb-8">
          <Link
            href={`/campaign/${params.id}/characters`}
            className="text-blue-400 hover:text-blue-300"
          >
            &larr; Back to List
          </Link>
          <Link
            href={`/campaign/${params.id}/characters/${character.id}/edit`}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
          >
            Edit Character
          </Link>
        </div>

        {/* Title Section */}
        <div className="border-b border-gray-700 pb-6 mb-6">
          <h1 className="text-5xl font-bold text-white mb-2">
            {character.name}
          </h1>
          <div className="text-xl text-purple-300 flex gap-3">
            {character.status && (
              <span className="px-2 py-0.5 rounded bg-gray-800 text-gray-300 text-sm border border-gray-600 self-center">
                {character.status}
              </span>
            )}
            <span>{character.species}</span>
            {character.class && <span>• {character.class}</span>}
            {character.level && <span>(Lvl {character.level})</span>}
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mb-8">
          <StatBox label="STR" value={character.strength} />
          <StatBox label="DEX" value={character.dexterity} />
          <StatBox label="CON" value={character.constitution} />
          <StatBox label="INT" value={character.intelligence} />
          <StatBox label="WIS" value={character.wisdom} />
          <StatBox label="CHA" value={character.charisma} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left: Combat Stats */}
          <div className="md:col-span-1 space-y-4">
            <div className="bg-gray-900 p-4 rounded-lg border border-gray-700 flex justify-between items-center">
              <span className="text-gray-400">Hit Points</span>
              <span className="text-2xl font-bold text-green-400">
                {character.hp ?? '-'}
              </span>
            </div>
            <div className="bg-gray-900 p-4 rounded-lg border border-gray-700 flex justify-between items-center">
              <span className="text-gray-400">Armor Class</span>
              <span className="text-2xl font-bold text-blue-400">
                {character.ac ?? '-'}
              </span>
            </div>
            <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
              <div className="text-gray-400 mb-1">Type</div>
              <div className="capitalize text-white">
                {character.type ?? 'Unknown'}
              </div>
            </div>
          </div>

          {/* Right: Description */}
          <div className="md:col-span-2">
            <h2 className="text-2xl font-semibold mb-4 text-white">
              Description & Biography
            </h2>
            <article className="prose prose-invert max-w-none text-gray-300 whitespace-pre-wrap">
              {character.description || 'No description available.'}
            </article>
          </div>
        </div>
      </div>
    </main>
  );
}
