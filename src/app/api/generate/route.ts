import { NextResponse } from "next/server";
import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from "@google/genai";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

// --- DEFINE TYPESCRIPT INTERFACES ---
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
  recap: string;
  notableQuotes: NotableQuote[];
}

interface ParsedAiResponse {
  characters: WikiEntity[];
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

  try {
    const body = await request.json();
    const { transcript } = body;

    if (!transcript) {
      return NextResponse.json(
        { error: "Transcript is required" },
        { status: 400 }
      );
    }

    // --- 2. Build the Master Prompt ---
    const prompt = `
      You are a meticulous D&D campaign assistant. Your task is to read the following game session transcript and extract all relevant entities.
      You must return ONLY a single, valid JSON object (no other text, no "json" markdown wrapper).
      
      The JSON object should have 6 top-level keys: "characters", "locations", "organizations", "items", "lore", and "sessionSummary".
      
      - "characters": An array of objects. Each object must have a "name" (string) and a "description" (string, a brief summary of their actions or new info learned).
      - "locations": An array of objects. Each object must have a "name" (string) and a "description" (string, what happened here or what was learned about it).
      - "organizations": An array of objects. Each object must have a "name" (string) and a "description" (string, any new info about the faction/group).
      - "items": An array of objects. Each object must have a "name" (string) and a "description" (string, what the item is, what it does, or what happened to it).
      - "lore": An array of objects. Each object must have a "title" (string, e.g., "The Spellplague") and a "description" (string, what was learned).
      - "sessionSummary": A single object (not an array) with:
          - "title": A creative title for the session.
          - "recap": A detailed narrative summary of the session's events.
          - "notableQuotes": An array of objects. Each object must have three keys: "quote" (the full quote), "speaker" (who said it), and "context" (a brief description of the situation). Do not include duplicate quotes.

      If you find no entities for a category, return an empty array [].
      Do not invent information. Only use details from the transcript.

      Here is the transcript:
      ---
      ${transcript}
      ---
    `;

    // --- 3. Call the Gemini API ---
    const generationConfig = {
      responseMimeType: "application/json",
      temperature: 0.7,
    };

    const result = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      ...generationConfig,
      config: {
        safetySettings: safetySettings,
      },
    });

    const aiResponseText = result.text ?? null;

    if (!aiResponseText) {
      throw new Error("AI returned no text.");
    }

    // --- 4. PARSE AND SAVE TO DATABASE ---
    // We are now adding all the Prisma logic
    const cleanedJsonText = aiResponseText
      .replace(/^```json\n/, "") // Remove opening tag
      .replace(/\n```$/, "") // Remove closing tag
      .trim(); // Trim whitespace

    const data: ParsedAiResponse = JSON.parse(cleanedJsonText); // Use the cleaned text

    // We use a transaction to ensure that all data is saved,
    // or none of it is, if an error occurs.
    const newSession = await prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        // Step A: Upsert all entities (Characters, Locations, etc.)
        // We do these in parallel for speed.

        //CHARACTERS
        await Promise.all(
          data.characters.map((char) =>
            tx.character.upsert({
              where: { name: char.name! },
              update: { description: char.description },
              create: { name: char.name!, description: char.description },
            })
          )
        );

        // LOCATIONS
        await Promise.all(
          data.locations.map((loc) =>
            tx.location.upsert({
              where: { name: loc.name! },
              update: { description: loc.description },
              create: { name: loc.name!, description: loc.description },
            })
          )
        );

        // ORGANIZATIONS
        await Promise.all(
          data.organizations.map((org) =>
            tx.organization.upsert({
              where: { name: org.name! },
              update: { description: org.description },
              create: { name: org.name!, description: org.description },
            })
          )
        );

        // ITEMS
        await Promise.all(
          data.items.map((item) =>
            tx.item.upsert({
              where: { name: item.name! },
              update: { description: item.description },
              create: { name: item.name!, description: item.description },
            })
          )
        );

        // LORE (uses 'title' instead of 'name')
        await Promise.all(
          data.lore.map((loreEntry) =>
            tx.lore.upsert({
              where: { title: loreEntry.title! },
              update: { description: loreEntry.description },
              create: {
                title: loreEntry.title!,
                description: loreEntry.description,
              },
            })
          )
        );

        // Step B: Get the next session number
        const lastSession = await tx.sessionSummary.findFirst({
          orderBy: { sessionNumber: "desc" },
        });
        const nextSessionNumber = (lastSession?.sessionNumber || 0) + 1;

        // Step C: Create the new SessionSummary and connect all the entities
        const createdSession = await tx.sessionSummary.create({
          data: {
            sessionNumber: nextSessionNumber,
            title: data.sessionSummary.title,
            recap: data.sessionSummary.recap,

            // notableQuotes is now an array of objects, which Prisma stores as JSON
            notableQuotes: data.sessionSummary
              .notableQuotes as unknown as Prisma.InputJsonValue,

            // --- This is the relational magic ---
            // We connect this session to all the entities we just upserted.
            charactersPresent: {
              connect: data.characters.map((c) => ({ name: c.name! })),
            },
            locationsVisited: {
              connect: data.locations.map((l) => ({ name: l.name! })),
            },
            itemsFound: {
              connect: data.items.map((i) => ({ name: i.name! })),
            },
            loreEntries: {
              connect: data.lore.map((l) => ({ title: l.title! })),
            },
          },
        });

        return createdSession;
      }
    );

    // --- 5. Log and Send Response ---
    console.log("--- Database Save Complete! ---");
    console.log(newSession);
    console.log("-------------------------------");

    return NextResponse.json({
      message: "AI processing and database save complete!",
      session: newSession, // Send the new session data back to the browser
    });
  } catch (error) {
    // Log the error for debugging
    console.error("--- API ERROR ---", error);

    // Send a more specific error message back to the client
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";

    // Check for JSON parsing error
    if (error instanceof SyntaxError) {
      console.error("--- AI RESPONSE (NOT VALID JSON) ---");
      // We can't log aiResponseText here because it's out of scope,
      // but the server logs from the 'catch' will be enough.
      return NextResponse.json(
        { error: "AI returned invalid JSON. Check terminal for AI output." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: `An error occurred: ${errorMessage}` },
      { status: 500 }
    );
  }
}
