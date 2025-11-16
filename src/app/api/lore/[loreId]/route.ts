import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// This function handles GET requests to /api/lore/[loreId]
export async function GET(
  request: Request,
  { params: paramsPromise }: { params: Promise<{ loreId: string }> }
) {
  try {
    const params = await paramsPromise;
    const loreId = params.loreId;

    if (!loreId) {
      return NextResponse.json(
        { error: 'Lore ID is required' },
        { status: 400 }
      );
    }

    const loreEntry = await prisma.lore.findUnique({
      where: {
        id: loreId,
      },
    });

    if (!loreEntry) {
      return NextResponse.json(
        { error: 'Lore entry not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(loreEntry);
  } catch (error) {
    console.error('--- API GET LORE ERROR ---', error);
    return NextResponse.json(
      { error: 'An error occurred fetching lore data' },
      { status: 500 }
    );
  }
}

// This function handles PATCH requests to /api/lore/[loreId]
export async function PATCH(
  request: Request,
  { params: paramsPromise }: { params: Promise<{ loreId: string }> }
) {
  try {
    const params = await paramsPromise;
    const loreId = params.loreId;
    const body = await request.json();

    // Get only the fields we want to update
    const {
      title,
      description,
      type,
      tag, // Include the new tag field
    } = body;

    const updatedLore = await prisma.lore.update({
      where: {
        id: loreId,
      },
      data: {
        title,
        description,
        type,
        tag, // Save the new tag field
      },
    });

    return NextResponse.json(updatedLore);
  } catch (error) {
    console.error('--- API PATCH LORE ERROR ---', error);
    return NextResponse.json(
      { error: 'An error occurred saving the lore entry' },
      { status: 500 }
    );
  }
}
