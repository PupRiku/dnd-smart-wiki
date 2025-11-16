import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// This function handles GET requests to /api/items/[itemId]
export async function GET(
  request: Request,
  { params: paramsPromise }: { params: Promise<{ itemId: string }> }
) {
  try {
    const params = await paramsPromise;
    const itemId = params.itemId;

    if (!itemId) {
      return NextResponse.json(
        { error: 'Item ID is required' },
        { status: 400 }
      );
    }

    const item = await prisma.item.findUnique({
      where: {
        id: itemId,
      },
    });

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    return NextResponse.json(item);
  } catch (error) {
    console.error('--- API GET ITEM ERROR ---', error);
    return NextResponse.json(
      { error: 'An error occurred fetching item data' },
      { status: 500 }
    );
  }
}

// This function handles PATCH requests to /api/items/[itemId]
export async function PATCH(
  request: Request,
  { params: paramsPromise }: { params: Promise<{ itemId: string }> }
) {
  try {
    const params = await paramsPromise;
    const itemId = params.itemId;
    const body = await request.json();

    // Get only the fields we want to update
    const { name, description, type, rarity } = body;

    const updatedItem = await prisma.item.update({
      where: {
        id: itemId,
      },
      data: {
        name,
        description,
        type,
        rarity,
      },
    });

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error('--- API PATCH ITEM ERROR ---', error);
    return NextResponse.json(
      { error: 'An error occurred saving the item' },
      { status: 500 }
    );
  }
}
