import { NextResponse } from 'next/server';
import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from '@google/genai';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// --- HELPER: Parse Scrybe Quill Quotes ---
// Format: "Quote text." (Speaker context...)
function parseScrybeQuillQuotes(rawText: string) {
  const quotes = [];
  // Regex to find: "text" (context)
  const regex = /"([^"]+)"\s*\(([^)]+)\)/g;
  let match;

  while ((match = regex.exec(rawText)) !== null) {
    const quoteText = match[1];
    const fullContext = match[2];

    // Attempt to extract speaker from context (usually the first word or two)
    // E.g., "Meek refused to fight..." -> Speaker: Meek
    const contextWords = fullContext.split(' ');
    let speaker = 'Unknown';
    let context = fullContext;

    if (contextWords.length > 0) {
      // Simple heuristic: Assume first word is speaker if it starts with uppercase
      if (/^[A-Z]/.test(contextWords[0])) {
        speaker = contextWords[0].replace(/['’]s?$/, ''); // Remove possessives
      }
    }

    quotes.push({
      quote: quoteText,
      speaker: speaker,
      context: fullContext,
    });
  }
  return quotes;
}

// --- HELPER: Parse Scrybe Quill Notes ---
// Parses sections like "NPCS:", "ITEMS:", etc.
type WikiUpdateData = {
  characters: { name: string; description: string; type: string }[];
  items: { name: string; description: string }[];
  locations: { name: string; description: string }[];
  organizations: { name: string; description: string }[];
};

function parseScrybeQuillNotes(rawText: string): WikiUpdateData {
  const data: WikiUpdateData = {
    characters: [],
    items: [],
    locations: [],
    organizations: [],
  };

  const lines = rawText.split('\n');
  let currentCategory: string | null = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Check for Headers (ending in :)
    if (
      /^(NPCS|PLAYER CHARACTERS|ITEMS|LOCATIONS|FACTIONS|QUESTS):$/i.test(
        trimmed
      )
    ) {
      currentCategory = trimmed.replace(':', '').toUpperCase();
      continue;
    }

    // Parse Bullet Points: "- Name: Description"
    if (trimmed.startsWith('-') && currentCategory) {
      // Remove dash and split by first colon
      const content = trimmed.substring(1).trim();
      const separatorIndex = content.indexOf(':');

      if (separatorIndex !== -1) {
        const name = content.substring(0, separatorIndex).trim();
        const description = content.substring(separatorIndex + 1).trim();

        if (currentCategory === 'NPCS') {
          data.characters.push({ name, description, type: 'NPC' });
        } else if (currentCategory === 'PLAYER CHARACTERS') {
          data.characters.push({ name, description, type: 'PC' });
        } else if (currentCategory === 'ITEMS') {
          data.items.push({ name, description });
        } else if (currentCategory === 'LOCATIONS') {
          data.locations.push({ name, description });
        } else if (currentCategory === 'FACTIONS') {
          data.organizations.push({ name, description });
        }
      }
    }
  }
  return data;
}

// --- API ROUTE ---
export async function POST(
  request: Request,
  { params: paramsPromise }: { params: Promise<{ sessionId: string }> }
) {
  const genAI = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY as string,
  });

  try {
    const params = await paramsPromise;
    const sessionId = params.sessionId;
    const body = await request.json();

    const {
      recap: sqRecap,
      outline: sqOutline,
      quotes: sqQuotes,
      notes: sqNotes,
      currentStorybook,
      campaignId,
    } = body;

    if (!sessionId || !campaignId) {
      return NextResponse.json({ error: 'Missing IDs' }, { status: 400 });
    }

    // --- 1. AI ENHANCEMENT (STORYBOOK) ---
    // We skip this if there is no current storybook to enhance
    let enhancedRecap = currentStorybook;

    if (sqRecap && currentStorybook) {
      const prompt = `
        You are a fantasy novel editor. 
        
        Here is the "Original Draft" of a D&D session chapter:
        ---
        ${currentStorybook}
        ---

        Here are the "Editor's Notes" (accurate recap) for the same session:
        ---
        ${sqRecap}
        ---

        Your task is to rewrite the "Original Draft" to improve it.
        1. **Source of Truth:** The "Editor's Notes" contain the CORRECT spellings of names and the correct facts. Fix any discrepancies in the Draft.
        2. **Add Detail:** If the "Editor's Notes" contain details, dialogue, or events missing from the Draft, weave them seamlessly into the narrative.
        3. **Maintain Style:** Keep the novelistic, past-tense, 'show-don't-tell' style of the Original Draft. Do not turn it into a bulleted list.

        Return ONLY the enhanced story text.
      `;

      const result = await genAI.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          safetySettings: [
            {
              category: HarmCategory.HARM_CATEGORY_HARASSMENT,
              threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            },
            {
              category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
              threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            },
            {
              category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
              threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            },
            {
              category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
              threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            },
          ],
        },
      });

      enhancedRecap = result.text ?? currentStorybook;
    } else if (sqRecap) {
      // If we don't have a current storybook, just use the SQ recap
      enhancedRecap = sqRecap;
    }

    // --- 2. PARSE DATA ---
    const wikiUpdates = parseScrybeQuillNotes(sqNotes || '');
    const parsedQuotes = parseScrybeQuillQuotes(sqQuotes || '');

    // --- 3. DATABASE TRANSACTION ---
    await prisma.$transaction(async (tx) => {
      // A. Update Session (Recap, Outline, Notes, Quotes)
      await tx.sessionSummary.update({
        where: { id: sessionId },
        data: {
          recap: enhancedRecap,
          outline: sqOutline, // We overwrite the outline with SQ's version
          notes: sqNotes, // We overwrite the notes with SQ's version
          // Merge new quotes with existing ones? For now, let's overwrite/set.
          // Cast to InputJsonValue to satisfy Prisma
          notableQuotes: parsedQuotes as unknown as Prisma.InputJsonValue,
        },
      });

      // B. Upsert Wiki Entries from Notes
      // Characters (PCs & NPCs)
      for (const char of wikiUpdates.characters) {
        await tx.character.upsert({
          where: { name_campaignId: { name: char.name, campaignId } },
          update: { description: char.description, type: char.type },
          create: {
            name: char.name,
            description: char.description,
            type: char.type,
            campaignId,
          },
        });
      }

      // Items
      for (const item of wikiUpdates.items) {
        await tx.item.upsert({
          where: { name_campaignId: { name: item.name, campaignId } },
          update: { description: item.description },
          create: {
            name: item.name,
            description: item.description,
            campaignId,
          },
        });
      }

      // Locations
      for (const loc of wikiUpdates.locations) {
        await tx.location.upsert({
          where: { name_campaignId: { name: loc.name, campaignId } },
          update: { description: loc.description },
          create: {
            name: loc.name,
            description: loc.description,
            campaignId,
          },
        });
      }

      // Organizations (Factions)
      for (const org of wikiUpdates.organizations) {
        await tx.organization.upsert({
          where: { name_campaignId: { name: org.name, campaignId } },
          update: { description: org.description },
          create: {
            name: org.name,
            description: org.description,
            campaignId,
          },
        });
      }
    });

    return NextResponse.json({
      success: true,
      enhancedRecap,
      outline: sqOutline,
      notes: sqNotes,
      quotes: parsedQuotes,
    });
  } catch (error) {
    console.error('--- API ENHANCE ERROR ---', error);
    return NextResponse.json(
      { error: 'An error occurred enhancing the session' },
      { status: 500 }
    );
  }
}
