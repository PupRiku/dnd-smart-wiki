import { NextResponse } from 'next/server';
import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from '@google/genai';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// --- DEFINE TYPESCRIPT INTERFACES ---
interface CharacterEntity {
  name: string;
  description: string;
  type?: string;
  status?: string;
  species?: string;
  class?: string;
  level?: number;
  hp?: number;
  ac?: number;
  strength?: number;
  dexterity?: number;
  constitution?: number;
  intelligence?: number;
  wisdom?: number;
  charisma?: number;
}

// This helps TypeScript understand the shape of the AI's JSON output
interface WikiEntity {
  name?: string; // Used by most
  title?: string; // Used by Lore
  description: string;
}

interface NotableQuote {
  quote: string;
  speaker: string;
  context: string;
}

interface SessionSummaryData {
  title: string;
  recap: string; // This will now be the long "Storybook" recap
  chapterTitle?: string; // Optional new field
  outline?: string; // Optional field
  notes?: string; // Optional field
  notableQuotes: NotableQuote[];
}

interface ParsedAiResponse {
  characters: CharacterEntity[]; // Use the new detailed interface
  locations: WikiEntity[];
  organizations: WikiEntity[];
  items: WikiEntity[];
  lore: WikiEntity[];
  sessionSummary: SessionSummaryData;
}

const safetySettings = [
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
];

export async function POST(request: Request) {
  const genAI = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY as string,
  });

  let aiResponseText: string | null = null;
  let result: any = null; // To store the result for error logging

  try {
    const body = await request.json();
    const { transcript, campaignName } = body;

    if (!transcript) {
      return NextResponse.json(
        { error: 'Transcript is required' },
        { status: 400 }
      );
    }
    if (!campaignName) {
      return NextResponse.json(
        { error: 'Campaign name is required' },
        { status: 400 }
      );
    }

    // --- Get or create the campaign ---
    const campaign = await prisma.campaign.upsert({
      where: { name: campaignName },
      update: {},
      create: { name: campaignName },
    });
    const campaignId = campaign.id;

    // --- Build the Master Prompt ---
    const prompt = `
      You are a fantasy novelist and meticulous D&D campaign assistant. 
      Your task is to read the following game session transcript and extract all relevant entities into a JSON object.
      You must return ONLY a single, valid JSON object (no other text, no "json" markdown wrapper).
      
      The JSON object should have 6 top-level keys: "characters", "locations", "organizations", "items", "lore", and "sessionSummary".

      RULES FOR ENTITIES (characters, locations, organizations, items, lore):
      - "name" or "title": The unique name of the entity.
      - "description": A detailed summary of their actions, new information learned, or historical context from the transcript.
      - "characters" ONLY: If mentioned, include these *exact* fields: 'type' ('PC' or 'NPC'), 'species' (the character's race, e.g., 'Half-elf'), 'class', 'level', 'hp', 'ac', 'strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'.
      - **IMPORTANT FOR CHARACTERS**: For any number-based fields ('level', 'hp', 'ac', stats), if the information is unknown or not mentioned, you **must** omit the field or set its value to 'null'. Do **NOT** use strings like "N/A".

      RULES FOR "sessionSummary":
      - "title": A creative, short title for this specific session.
      - "recap": This is the MOST IMPORTANT. Write a long, novelistic, and highly detailed "Storybook" chapter of the session's events. Write it in the past tense, as if it were a fantasy novel. Use descriptive language, capture character emotions, and detail actions in a 'show, don't tell' style. Make it a long, engaging read.
      - "chapterTitle": (Optional) If the session seems to end at a natural "chapter break" in the story, suggest a title for the chapter that just concluded (e.g., "The Fall of Greendale").
      - "outline": A brief, bulleted list of the key events that happened.
      - "notes": Any miscellaneous notes or DM reminders found in the transcript.
      - "notableQuotes": An array of objects. Each object must have "quote", "speaker", and "context". Do not include duplicate quotes.

      Here is the transcript:
      ---
      ${transcript}
      ---
    `;

    // --- Call the Gemini API ---
    const generationConfig = {
      responseMimeType: 'application/json',
      temperature: 0.7,
    };

    const result = await genAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      ...generationConfig,
      config: {
        safetySettings: safetySettings,
      },
    });

    const aiResponseText = result.text ?? null;

    if (!aiResponseText) {
      throw new Error('AI returned no text.');
    }

    // --- PARSE AND SAVE TO DATABASE ---
    // Use a regex to find the first '{' and the last '}'
    const match = aiResponseText.match(/{[\s\S]*}/);

    if (!match) {
      // If we can't find any JSON, throw an error and log the bad response.
      console.error('--- AI RESPONSE (NO JSON FOUND) ---');
      console.log(aiResponseText);
      throw new Error('AI response did not contain a valid JSON object.');
    }

    const cleanedJsonText = match[0];

    const data: ParsedAiResponse = JSON.parse(cleanedJsonText);

    // We use a transaction to ensure that all data is saved,
    // or none of it is, if an error occurs.
    const newSession = await prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        // Step A: Upsert all entities (Characters, Locations, etc.)

        // CHARACTERS
        await Promise.all(
          data.characters.map((char) => {
            // Helper function to clean number fields
            // It checks if a value is a valid number, otherwise returns null
            const sanitizeInt = (value: any): number | null => {
              const num = parseInt(value, 10);
              return isNaN(num) ? null : num;
            };

            // Explicitly map fields and sanitize all number fields
            const characterData = {
              description: char.description,
              type: char.type,
              status: char.status,
              species: char.species,
              class: char.class,
              level: sanitizeInt(char.level), // <-- SANITIZE
              hp: sanitizeInt(char.hp), // <-- SANITIZE
              ac: sanitizeInt(char.ac), // <-- SANITIZE
              strength: sanitizeInt(char.strength),
              dexterity: sanitizeInt(char.dexterity),
              constitution: sanitizeInt(char.constitution),
              intelligence: sanitizeInt(char.intelligence),
              wisdom: sanitizeInt(char.wisdom),
              charisma: sanitizeInt(char.charisma),
            };

            return tx.character.upsert({
              where: {
                name_campaignId: { name: char.name, campaignId: campaignId },
              },
              update: characterData, // Update with clean, sanitized data
              create: {
                name: char.name,
                ...characterData, // Create with clean, sanitized data
                campaignId: campaignId,
              },
            });
          })
        );

        // LOCATIONS
        await Promise.all(
          data.locations.map((loc) =>
            tx.location.upsert({
              where: {
                name_campaignId: { name: loc.name!, campaignId: campaignId },
              },
              update: { description: loc.description },
              create: {
                name: loc.name!,
                description: loc.description,
                campaignId: campaignId,
              },
            })
          )
        );

        // ORGANIZATIONS
        await Promise.all(
          data.organizations.map((org) =>
            tx.organization.upsert({
              where: {
                name_campaignId: { name: org.name!, campaignId: campaignId },
              },
              update: { description: org.description },
              create: {
                name: org.name!,
                description: org.description,
                campaignId: campaignId,
              },
            })
          )
        );

        // ITEMS
        await Promise.all(
          data.items.map((item) =>
            tx.item.upsert({
              where: {
                name_campaignId: { name: item.name!, campaignId: campaignId },
              },
              update: { description: item.description },
              create: {
                name: item.name!,
                description: item.description,
                campaignId: campaignId,
              },
            })
          )
        );

        // LORE
        await Promise.all(
          data.lore
            .filter((loreEntry) => !!loreEntry.title) // <-- Add this filter step
            .map((loreEntry) =>
              tx.lore.upsert({
                where: {
                  title_campaignId: {
                    title: loreEntry.title!,
                    campaignId: campaignId,
                  },
                },
                update: { description: loreEntry.description },
                create: {
                  title: loreEntry.title!,
                  description: loreEntry.description,
                  campaignId: campaignId,
                },
              })
            )
        );

        // Step B: Get the next session number
        const lastSession = await tx.sessionSummary.findFirst({
          where: { campaignId: campaignId }, // <-- Filter by campaign
          orderBy: { sessionNumber: 'desc' },
        });
        const nextSessionNumber = (lastSession?.sessionNumber || 0) + 1;

        // Step C: Create the new SessionSummary and connect all the entities
        const createdSession = await tx.sessionSummary.create({
          data: {
            sessionNumber: nextSessionNumber,
            title: data.sessionSummary.title,
            recap: data.sessionSummary.recap,
            chapterTitle: data.sessionSummary.chapterTitle,

            outline: Array.isArray(data.sessionSummary.outline)
              ? data.sessionSummary.outline.join('\n- ') // Join with newlines/bullets
              : data.sessionSummary.outline,

            notes: Array.isArray(data.sessionSummary.notes)
              ? data.sessionSummary.notes.join('\n- ') // Join with newlines/bullets
              : data.sessionSummary.notes,

            notableQuotes: data.sessionSummary
              .notableQuotes as unknown as Prisma.InputJsonValue,

            campaignId: campaignId,

            // Connect all the entities
            charactersPresent: {
              connect: data.characters.map((c) => ({
                name_campaignId: { name: c.name!, campaignId: campaignId },
              })),
            },
            locationsVisited: {
              connect: data.locations.map((l) => ({
                name_campaignId: { name: l.name!, campaignId: campaignId },
              })),
            },
            itemsFound: {
              connect: data.items.map((i) => ({
                name_campaignId: { name: i.name!, campaignId: campaignId },
              })),
            },

            loreEntries: {
              connect: data.lore
                .filter((l) => !!l.title)
                .map((l) => ({
                  title_campaignId: { title: l.title!, campaignId: campaignId },
                })),
            },
          },
        });

        return createdSession;
      }
    );

    // --- Log and Send Response ---
    console.log('--- Database Save Complete! ---');
    console.log(`Campaign: ${campaign.name} (ID: ${campaign.id})`);
    console.log(
      `New Session: ${newSession.title} (Number: ${newSession.sessionNumber})`
    );
    console.log('-------------------------------');

    return NextResponse.json({
      message: 'AI processing and database save complete!',
      session: newSession,
    });
  } catch (error) {
    console.error('--- API ERROR ---', error);

    const errorMessage =
      error instanceof Error ? error.message : 'An unknown error occurred';

    if (error instanceof SyntaxError) {
      console.error('--- AI RESPONSE (NOT VALID JSON) ---');
      // Use the 'result' variable we saved earlier to log the bad response
      console.log(result?.text ?? 'No AI text available on SyntaxError');
      return NextResponse.json(
        { error: 'AI returned invalid JSON. Check terminal for AI output.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: `An error occurred: ${errorMessage}` },
      { status: 500 }
    );
  }
}
