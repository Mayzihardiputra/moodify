
import { GoogleGenAI, Type } from "@google/genai";

const SYSTEM_INSTRUCTION = `
You are Moodify AI, an AI music discovery assistant.

Your job is to understand the user's feelings and recommend music
that matches their mood.

Supported mood categories:
- Dreamy
- Calm
- Energized
- Melancholy
- Soulful

IMPORTANT INSTRUCTIONS:

1. Understand both Indonesian and English.
2. Always respond in the same language used by the latest user message.
3. Be friendly, empathetic, natural, and concise.
4. Never invent song titles or artists.
5. Generate a Spotify search query that matches the user's request.

CONVERSATION MEMORY:

1. Read the previous conversation before answering.
2. Remember the user's previously stated music preferences.
3. Preserve preferences such as language, genre, country, and artists.
4. If the user says "another recommendation" or
   "ada rekomendasi lainnya?", understand the previous context.
5. If the user changes their music preference, follow the latest request.
6. Do not ask the user to repeat information already provided.
7. Do not treat previous assistant recommendations as new user preferences
   unless the user explicitly agrees with them.

MUSIC LANGUAGE AND REGION:

- If the user requests Indonesian songs, prioritize Indonesian music.
- If the user requests English songs, prioritize English music.
- If the user mentions a country, artist, genre, or language,
  include that preference in the Spotify search query.
- Understand phrases such as "lagu Indonesia",
  "lagu lokal", "lagu galau Indonesia",
  and "lagu indie Indonesia".
- Preserve the user's music preferences even when their mood changes.

Examples:

User: "Aku pengen lagu Indonesia"
Query: Indonesian songs popular artists

User: "Aku lagi sedih, pengen lagu Indonesia"
Query: Indonesian sad songs mellow

User: "I need relaxing English songs"
Query: relaxing English songs chill

User: "Ada rekomendasi lainnya?"
Query: Use the previous music preferences and mood,
but create a suitable search query for more recommendations.

Return:
- A friendly response.
- A suitable mood category.
- A Spotify search query.
`;

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    reply: {
      type: Type.STRING,
    },
    mood: {
      type: Type.STRING,
      enum: [
        "Dreamy",
        "Calm",
        "Energized",
        "Melancholy",
        "Soulful",
      ],
    },
    searchQuery: {
      type: Type.STRING,
    },
  },
  required: ["reply", "mood", "searchQuery"],
};

export const analyzeMood = async (
  userMessage,
  conversationHistory = []
) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  const primaryModel =
    process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";

  const fallbackModel = process.env.GEMINI_FALLBACK_MODEL;

  const ai = new GoogleGenAI({
    apiKey,

    httpOptions: {
      timeout: 12000,
      retryOptions: {
        attempts: 2,
        initialDelay: 0.5,
        maxDelay: 1,
        expBase: 2,
        jitter: 0.1,
        httpStatusCodes: [408, 429, 500, 502, 503, 504],
      },
    },
  });

  // Convert conversation history into Gemini format.
  const historyContents = conversationHistory.map((item) => ({
    role: item.role === "assistant" ? "model" : "user",
    parts: [
      {
        text: item.text,
      },
    ],
  }));

  // Add the latest user message.
  const contents = [
    ...historyContents,
    {
      role: "user",
      parts: [
        {
          text: userMessage,
        },
      ],
    },
  ];

  const generate = async (model) => {
    console.log(`Moodify AI using model: ${model}`);
    console.log(
      `Conversation history: ${conversationHistory.length} messages`
    );

    const response = await ai.models.generateContent({
      model,
      contents,

      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema,
        temperature: 0.5,
      },
    });

    if (!response.text) {
      throw new Error("Gemini returned an empty response.");
    }

    return JSON.parse(response.text);
  };

  try {
    return await generate(primaryModel);
  } catch (error) {
    console.error(
      `Primary Gemini model failed (${primaryModel}):`,
      error.status || error.message
    );

    if (
      fallbackModel &&
      fallbackModel !== primaryModel
    ) {
      console.log("Trying Gemini fallback model...");

      return await generate(fallbackModel);
    }

    throw error;
  }
};
