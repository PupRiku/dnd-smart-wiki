import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(
  request: Request,
  { params: paramsPromise }: { params: Promise<{ id: string }> }
) {
  try {
    const params = await paramsPromise;
    const campaignId = params.id;
    const body = await request.json();
    const { type, sourceName, targetName } = body;

    if (!campaignId || !sourceName || !targetName || !type) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // 1. Find Source and Target IDs
    // We use (prisma as any) to bypass TypeScript checking for the dynamic key access
    // This fixes the "Property findFirst does not exist" error
    const modelDelegate = (prisma as any)[type.toLowerCase()];

    if (!modelDelegate) {
      return NextResponse.json(
        { error: `Invalid type: ${type}` },
        { status: 400 }
      );
    }

    const source = await modelDelegate.findFirst({
      where: { name: sourceName, campaignId },
    });
    const target = await modelDelegate.findFirst({
      where: { name: targetName, campaignId },
    });

    if (!source)
      return NextResponse.json(
        { error: `Source "${sourceName}" not found.` },
        { status: 404 }
      );
    if (!target)
      return NextResponse.json(
        { error: `Target "${targetName}" not found.` },
        { status: 404 }
      );

    // 2. Perform the Merge Transaction
    await prisma.$transaction(async (tx) => {
      // --- A. HANDLE SESSIONS (Common to all types) ---
      // We need to find sessions that reference the SOURCE and point them to the TARGET.

      // Define the field name based on the type (e.g. "charactersPresent")
      const sessionField =
        type === 'Lore'
          ? 'loreEntries'
          : type === 'Character'
          ? 'charactersPresent'
          : type === 'Item'
          ? 'itemsFound'
          : type === 'Location'
          ? 'locationsVisited'
          : type === 'Organization'
          ? 'organizations'
          : null; // Assuming orgs might be tracked later, but currently not in SessionSummary

      if (sessionField) {
        // Find sessions containing the source
        const sourceSessions = await tx.sessionSummary.findMany({
          where: {
            [sessionField]: { some: { id: source.id } },
          } as any,
        });

        // Update each session to connect the target
        for (const session of sourceSessions) {
          await tx.sessionSummary.update({
            where: { id: session.id },
            data: {
              [sessionField]: { connect: { id: target.id } },
            } as any,
          });
        }
      }

      // --- B. HANDLE TYPE-SPECIFIC RELATIONS ---

      if (type === 'Character') {
        // 1. Handle Organization Memberships (Many-to-Many)
        // We cannot use updateMany for this. We must find, then update loop.
        const charOrgs = await tx.organization.findMany({
          where: { members: { some: { id: source.id } } },
        });

        for (const org of charOrgs) {
          await tx.organization.update({
            where: { id: org.id },
            data: { members: { connect: { id: target.id } } },
          });
        }

        // 2. Handle Organization Leadership (One-to-One/Many)
        // This is a standard column update, so updateMany works here.
        await tx.organization.updateMany({
          where: { leaderId: source.id },
          data: { leaderId: target.id },
        });
      }

      if (type === 'Location') {
        // 1. Move Characters (Origin)
        await tx.character.updateMany({
          where: { originId: source.id },
          data: { originId: target.id },
        });

        // 2. Move Organizations (Headquarters)
        await tx.organization.updateMany({
          where: { headquartersId: source.id },
          data: { headquartersId: target.id },
        });
      }

      if (type === 'Organization') {
        // 1. Move Members (Characters)
        // Find characters belonging to the source org
        const memberChars = await tx.character.findMany({
          where: { organizations: { some: { id: source.id } } },
        });

        // Move them to the target org
        for (const char of memberChars) {
          await tx.character.update({
            where: { id: char.id },
            data: { organizations: { connect: { id: target.id } } },
          });
        }

        // 2. Move HQ/Leader logic is inverse and handled in Location/Character blocks
      }

      // --- C. DELETE SOURCE ---
      // We use (tx as any) to allow the dynamic delete call
      await (tx as any)[type.toLowerCase()].delete({
        where: { id: source.id },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('--- API MERGE ERROR ---', error);
    return NextResponse.json(
      { error: 'An error occurred during the merge' },
      { status: 500 }
    );
  }
}
