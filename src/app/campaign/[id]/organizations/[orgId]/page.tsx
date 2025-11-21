import Link from 'next/link';
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';

export default async function OrganizationViewPage({
  params: paramsPromise,
}: {
  params: Promise<{ id: string; orgId: string }>;
}) {
  const params = await paramsPromise;

  const organization = await prisma.organization.findUnique({
    where: { id: params.orgId },
    include: {
      leader: true,
      headquarters: true,
      members: {
        orderBy: { name: 'asc' },
      },
    },
  });

  if (!organization) notFound();

  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <div className="w-full max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <Link
            href={`/campaign/${params.id}/organizations`}
            className="text-blue-400 hover:text-blue-300"
          >
            &larr; Back to List
          </Link>
          <Link
            href={`/campaign/${params.id}/organizations/${organization.id}/edit`}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
          >
            Edit Organization
          </Link>
        </div>

        <div className="border-b border-gray-700 pb-6 mb-6">
          <h1 className="text-5xl font-bold text-white mb-2">
            {organization.name}
          </h1>
          <div className="text-xl text-purple-300 flex gap-4">
            {organization.type && (
              <span className="capitalize">{organization.type}</span>
            )}
            {organization.status && <span>• {organization.status}</span>}
            {organization.founding && (
              <span>• Founded: {organization.founding}</span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left: Relations & Info */}
          <div className="md:col-span-1 space-y-6">
            {/* Leader */}
            <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
              <div className="text-gray-400 text-sm uppercase mb-1">Leader</div>
              {organization.leader ? (
                <Link
                  href={`/campaign/${params.id}/characters/${organization.leader.id}`}
                  className="text-blue-400 hover:underline text-lg font-semibold"
                >
                  {organization.leader.name}
                </Link>
              ) : (
                <span className="text-gray-500 italic">Unknown</span>
              )}
            </div>

            {/* Headquarters */}
            <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
              <div className="text-gray-400 text-sm uppercase mb-1">
                Headquarters
              </div>
              {organization.headquarters ? (
                <Link
                  href={`/campaign/${params.id}/locations/${organization.headquarters.id}`}
                  className="text-blue-400 hover:underline text-lg font-semibold"
                >
                  {organization.headquarters.name}
                </Link>
              ) : (
                <span className="text-gray-500 italic">Unknown</span>
              )}
            </div>

            {/* Members List */}
            <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
              <div className="text-gray-400 text-sm uppercase mb-2">
                Members
              </div>
              {organization.members.length > 0 ? (
                <ul className="space-y-2">
                  {organization.members.map((member) => (
                    <li key={member.id}>
                      <Link
                        href={`/campaign/${params.id}/characters/${member.id}`}
                        className="text-blue-400 hover:underline"
                      >
                        {member.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <span className="text-gray-500 italic">No known members</span>
              )}
            </div>
          </div>

          {/* Right: Description */}
          <div className="md:col-span-2">
            <h2 className="text-2xl font-semibold mb-4 text-white">
              Description & History
            </h2>
            <article className="prose prose-invert max-w-none text-gray-300 whitespace-pre-wrap">
              {organization.description || 'No description available.'}
            </article>
          </div>
        </div>
      </div>
    </main>
  );
}
