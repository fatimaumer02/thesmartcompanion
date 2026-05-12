import OpenAI from "openai";
import { NextRequest } from "next/server";

const SYSTEM_PROMPT = `You are a task-breakdown assistant for SmartCompanion, an app for neurodivergent users (ADHD, dyslexia, autism). Given a high-level task, break it into small, concrete micro-steps the user can act on without overthinking.

Rules:
- Output 4 to 8 steps. Each step is one specific, physical action.
- Each step's "text" is short (≤ 10 words), imperative voice, concrete verbs.
- Estimate a realistic "duration" string (e.g. "3 min", "5 min", "10 min"). Keep each step under 15 minutes.
- Order steps logically — easiest, most grounding action first.
- Skip vague prep ("gather supplies", "prepare yourself") — start with a real action.
- Adjust depth to the user's stated step-size preference.`;

const stepsSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    steps: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          text: { type: "string" },
          duration: { type: "string" },
        },
        required: ["text", "duration"],
      },
    },
  },
  required: ["steps"],
} as const;

type GenerateStepsBody = {
  title?: string;
  neurotype?: string[];
  stepSize?: string;
};

export async function POST(request: NextRequest) {
  if (!process.env.OPENAI_API_KEY) {
    return Response.json(
      { error: "Server is not configured — OPENAI_API_KEY is missing." },
      { status: 500 },
    );
  }

  let body: GenerateStepsBody;
  try {
    body = (await request.json()) as GenerateStepsBody;
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const title = body.title?.trim();
  if (!title) {
    return Response.json({ error: "title is required." }, { status: 400 });
  }
  if (title.length > 200) {
    return Response.json({ error: "title is too long." }, { status: 400 });
  }

  const stepSize = body.stepSize || "Normal";
  const neurotype = body.neurotype?.length ? body.neurotype.join(", ") : "unspecified";

  const userMessage = `Task: ${title}

User context:
- Step size preference: ${stepSize} (Very Small = ultra-tiny atomic actions, Normal = balanced, Detailed = more granular intermediate steps)
- Neurotype: ${neurotype}`;

  const client = new OpenAI();

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.7,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "steps_response",
          schema: stepsSchema,
          strict: true,
        },
      },
    });

    const text = completion.choices[0]?.message?.content;
    if (!text) {
      return Response.json(
        { error: "Model returned no text response." },
        { status: 502 },
      );
    }

    const parsed = JSON.parse(text) as {
      steps: { text: string; duration: string }[];
    };

    if (!parsed.steps?.length) {
      return Response.json(
        { error: "Model returned no steps." },
        { status: 502 },
      );
    }

    return Response.json({ title, steps: parsed.steps });
  } catch (err) {
    // Log the technical details server-side, return a clean message to the client.
    console.error("OpenAI request failed:", err);

    if (err instanceof OpenAI.APIError) {
      if (err.status === 429) {
        return Response.json(
          { error: "AI service is rate-limited. Please try again in a moment." },
          { status: 429 },
        );
      }
      if (err.status === 401) {
        return Response.json(
          { error: "AI service authentication failed. Check the API key." },
          { status: 401 },
        );
      }
      if (err.status === 402 || /quota|billing/i.test(err.message)) {
        return Response.json(
          { error: "AI quota exceeded. Add credits or try again later." },
          { status: 402 },
        );
      }
      return Response.json(
        { error: "AI service is temporarily unavailable. Try again shortly." },
        { status: err.status ?? 502 },
      );
    }

    return Response.json(
      { error: "Something went wrong generating steps. Please try again." },
      { status: 500 },
    );
  }
}
