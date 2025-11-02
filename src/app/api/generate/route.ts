import { NextResponse } from "next/server";
import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from "@google/genai";

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

// 1. Initialize the Google AI Client
// It automatically finds the GEMINI_API_KEY in your .env
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

export async function POST(request: Request) {
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
    // This is the same prompt as before.
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
          - "notableQuotes": An array of interesting quotes (as strings).

      If you find no entities for a category, return an empty array [].
      Do not invent information. Only use details from the transcript.

      Here is the transcript:
      ---
      ${transcript}
      ---
    `;

    // --- 3. Call the Gemini API ---

    // We learned from our earlier tests that these properties are top-level
    const generationConfig = {
      responseMimeType: "application/json",
      temperature: 0.7,
    };

    // This is the correct, direct call
    const result = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      ...generationConfig,
      config: {
        safetySettings: safetySettings,
      },
    });

    const aiResponseText = result.text ?? "Error: No text returned from AI.";

    // --- 4. Log and Send Response ---
    console.log("--- AI RAW RESPONSE (TEXT) ---");
    console.log(aiResponseText);
    console.log("------------------------------");

    return NextResponse.json({
      message: "AI processing complete!",
      aiResponse: aiResponseText, // Send the AI's text back to the browser
    });
  } catch (error) {
    console.error("--- API ERROR ---", error);
    return NextResponse.json(
      { error: "An error occurred processing the AI request" },
      { status: 500 }
    );
  }
}
