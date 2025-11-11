import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// This function handles GET requests to /api/characters/[charId]
export async function GET(
  request: Request,
  // 1. We must treat 'params' as a Promise
  { params: paramsPromise }: { params: Promise<{ charId: string }> }
) {
  try {
    // 2. Await the promise to get the actual params
    const params = await paramsPromise;
    const charId = params.charId;

    if (!charId) {
      return NextResponse.json(
        { error: 'Character ID is required' },
        { status: 400 }
      );
    }

    // 3. Find the character in the database
    const character = await prisma.character.findUnique({
      where: {
        id: charId,
      },
    });

    // 4. If not found, return 404
    if (!character) {
      return NextResponse.json(
        { error: 'Character not found' },
        { status: 404 }
      );
    }

    // 5. If found, return the character data
    return NextResponse.json(character);
  } catch (error) {
    console.error('--- API GET CHARACTER ERROR ---', error);
    return NextResponse.json(
      { error: 'An error occurred fetching character data' },
      { status: 500 }
    );
  }
}

// This function handles PATCH requests to /api/characters/[charId]
export async function PATCH(
  request: Request,
  { params: paramsPromise }: { params: Promise<{ charId: string }> }
) {
  try {
    // 1. Await the promise to get the params
    const params = await paramsPromise;
    const charId = params.charId;

    // 2. Get the updated data from the request body
    const body = await request.json();

    // 3. We can destructure the fields we want to update
    // This prevents any unwanted fields from being sent to the DB
    const {
      name,
      description,
      type,
      status,
      species,
      class: className, // 'class' is a reserved keyword, so we rename it
      level,
      hp,
      ac,
      strength,
      dexterity,
      constitution,
      intelligence,
      wisdom,
      charisma,
    } = body;

    // 4. Update the character in the database
    const updatedCharacter = await prisma.character.update({
      where: {
        id: charId,
      },
      data: {
        name,
        description,
        type,
        status,
        species,
        class: className, // Save the renamed 'className' to the 'class' field
        level: level ? parseInt(level) : null, // Ensure numbers are saved as numbers
        hp: hp ? parseInt(hp) : null,
        ac: ac ? parseInt(ac) : null,
        strength: strength ? parseInt(strength) : null,
        dexterity: dexterity ? parseInt(dexterity) : null,
        constitution: constitution ? parseInt(constitution) : null,
        intelligence: intelligence ? parseInt(intelligence) : null,
        wisdom: wisdom ? parseInt(wisdom) : null,
        charisma: charisma ? parseInt(charisma) : null,
      },
    });

    // 5. Return the updated character data
    return NextResponse.json(updatedCharacter);
  } catch (error) {
    console.error('--- API PATCH CHARACTER ERROR ---', error);
    return NextResponse.json(
      { error: 'An error occurred saving the character' },
      { status: 500 }
    );
  }
}
