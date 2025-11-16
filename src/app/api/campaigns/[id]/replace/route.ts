import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// Helper function to safely replace text in JSON fields (like notableQuotes)
function replaceInJson(
  jsonValue: Prisma.JsonValue,
  find: string,
  replace: string
): Prisma.JsonValue {
  if (!jsonValue) return jsonValue;

  try {
    const jsonString = JSON.stringify(jsonValue);
    const newJsonString = jsonString.split(find).join(replace); // Case-sensitive replace
    return JSON.parse(newJsonString);
  } catch (e) {
    console.error('Failed to parse/replace JSON:', e);
    return jsonValue;
  }
}

// This function handles POST requests to /api/campaigns/[id]/replace
export async function POST(
  request: Request,
  { params: paramsPromise }: { params: Promise<{ id: string }> }
) {
  try {
    const params = await paramsPromise;
    const campaignId = params.id;
    const body = await request.json();
    let { find, replace } = body;

    if (!campaignId) {
      return NextResponse.json(
        { error: 'Campaign ID is required' },
        { status: 400 }
      );
    }
    if (!find || !replace) {
      return NextResponse.json(
        { error: 'Both "find" and "replace" fields are required' },
        { status: 400 }
      );
    }

    let totalUpdates = 0;
    const likeQuery = `%${find}%`; // For finding rows that contain the text

    // We run all updates in a transaction
    await prisma.$transaction(async (tx) => {
      // 1a. Update Character names
      const charNameUpdates = await tx.$executeRaw`
        UPDATE "Character"
        SET "name" = ${replace}
        WHERE "campaignId" = ${campaignId} AND "name" = ${find}`;
      totalUpdates += charNameUpdates;

      // 1b. Update Location names
      const locNameUpdates = await tx.$executeRaw`
        UPDATE "Location"
        SET "name" = ${replace}
        WHERE "campaignId" = ${campaignId} AND "name" = ${find}`;
      totalUpdates += locNameUpdates;

      // 1c. Update Organization names
      const orgNameUpdates = await tx.$executeRaw`
        UPDATE "Organization"
        SET "name" = ${replace}
        WHERE "campaignId" = ${campaignId} AND "name" = ${find}`;
      totalUpdates += orgNameUpdates;

      // 1d. Update Item names
      const itemNameUpdates = await tx.$executeRaw`
        UPDATE "Item"
        SET "name" = ${replace}
        WHERE "campaignId" = ${campaignId} AND "name" = ${find}`;
      totalUpdates += itemNameUpdates;

      // 1e. Update Lore titles
      const loreTitleUpdates = await tx.$executeRaw`
        UPDATE "Lore"
        SET "title" = ${replace}
        WHERE "campaignId" = ${campaignId} AND "title" = ${find}`;
      totalUpdates += loreTitleUpdates;

      // 1. Update Character descriptions
      const charUpdates = await tx.$executeRaw`
        UPDATE "Character"
        SET "description" = REPLACE("description", ${find}, ${replace})
        WHERE "campaignId" = ${campaignId} AND "description" LIKE ${likeQuery}`;
      totalUpdates += charUpdates;

      // 2. Update Location descriptions
      const locUpdates = await tx.$executeRaw`
        UPDATE "Location"
        SET "description" = REPLACE("description", ${find}, ${replace})
        WHERE "campaignId" = ${campaignId} AND "description" LIKE ${likeQuery}`;
      totalUpdates += locUpdates;

      // 3. Update Organization descriptions
      const orgUpdates = await tx.$executeRaw`
        UPDATE "Organization"
        SET "description" = REPLACE("description", ${find}, ${replace})
        WHERE "campaignId" = ${campaignId} AND "description" LIKE ${likeQuery}`;
      totalUpdates += orgUpdates;

      // 4. Update Item descriptions
      const itemUpdates = await tx.$executeRaw`
        UPDATE "Item"
        SET "description" = REPLACE("description", ${find}, ${replace})
        WHERE "campaignId" = ${campaignId} AND "description" LIKE ${likeQuery}`;
      totalUpdates += itemUpdates;

      // 5. Update Lore descriptions
      const loreUpdates = await tx.$executeRaw`
        UPDATE "Lore"
        SET "description" = REPLACE("description", ${find}, ${replace})
        WHERE "campaignId" = ${campaignId} AND "description" LIKE ${likeQuery}`;
      totalUpdates += loreUpdates;

      // 6. Update Session Summaries (recap, outline, notes)
      const sessionTextUpdates = await tx.$executeRaw`
        UPDATE "SessionSummary"
        SET 
          "recap" = REPLACE("recap", ${find}, ${replace}),
          "outline" = REPLACE("outline", ${find}, ${replace}),
          "notes" = REPLACE("notes", ${find}, ${replace})
        WHERE "campaignId" = ${campaignId} AND 
          ("recap" LIKE ${likeQuery} OR "outline" LIKE ${likeQuery} OR "notes" LIKE ${likeQuery})`;
      totalUpdates += sessionTextUpdates;

      // 7. Update JSON field (notableQuotes)
      const sessionsWithQuotes = await tx.sessionSummary.findMany({
        where: {
          campaignId: campaignId,
          notableQuotes: { string_contains: find },
        },
      });

      for (const session of sessionsWithQuotes) {
        const newQuotes = replaceInJson(session.notableQuotes, find, replace);
        await tx.sessionSummary.update({
          where: { id: session.id },
          data: {
            notableQuotes: newQuotes as unknown as Prisma.InputJsonValue,
          },
        });
        totalUpdates += 1;
      }
    });

    return NextResponse.json({
      message: 'Replacement complete!',
      count: totalUpdates,
    });
  } catch (error) {
    console.error('--- API REPLACE ERROR ---', error);
    return NextResponse.json(
      { error: 'An error occurred during the replacement' },
      { status: 500 }
    );
  }
}
