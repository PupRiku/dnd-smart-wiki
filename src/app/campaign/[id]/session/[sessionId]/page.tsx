import Link from 'next/link';
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';

// Use the 'await' pattern
// Note: The params will now contain BOTH the campaign 'id' and the 'sessionId'
export default async function SessionPage({
  params: paramsPromise,
}: {
  params: Promise<{ id: string; sessionId: string }>;
}) {
  // 1. Await the params promise
  const params = await paramsPromise;

  // 2. Fetch the specific session
  const session = await prisma.sessionSummary.findUnique({
    where: {
      id: params.sessionId,
      campaignId: params.id, // Ensure it belongs to the correct campaign
    },
  });

  // 3. If no session is found, show a 404 page
  if (!session) {
    notFound();
  }

  // 4. Render the page
  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <div className="w-full max-w-4xl">
        {/* --- Header & Back Link --- */}
        <Link
          href={`/campaign/${params.id}`} // Link back to the main campaign page
          className="text-blue-400 hover:text-blue-300 transition-colors"
        >
          &larr; Back to Campaign Home
        </Link>

        <div className="mt-8 text-center">
          {session.chapterTitle && (
            <h2 className="text-3xl font-semibold text-blue-300 italic">
              {session.chapterTitle}
            </h2>
          )}
          <h1 className="text-5xl font-bold my-4">
            Session {session.sessionNumber}: {session.title}
          </h1>
        </div>

        {/* --- Storybook Recap --- */}
        <article className="mt-12 prose prose-invert prose-lg max-w-none prose-p:leading-relaxed prose-p:text-gray-200">
          {/* We use 'whitespace-pre-wrap' to respect newlines from the AI */}
          <p className="whitespace-pre-wrap">{session.recap}</p>
        </article>

        {/* We can add an 'Edit' button here later */}
      </div>
    </main>
  );
}
