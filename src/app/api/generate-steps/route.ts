import { NextRequest, NextResponse } from "next/server";

// Provider is auto-selected based on which key is in the environment.
// Groq is preferred (faster + free tier); OpenAI is the fallback so the route
// works without anyone reconfiguring keys.
type ProviderConfig = {
  name: "groq" | "openai";
  url: string;
  apiKey: string;
  model: string;
};

function pickProvider(): ProviderConfig | null {
  const groqKey = process.env.GROQ_API_KEY?.trim();
  if (groqKey) {
    return {
      name: "groq",
      url: "https://api.groq.com/openai/v1/chat/completions",
      apiKey: groqKey,
      model: "llama-3.3-70b-versatile",
    };
  }
  const openaiKey = process.env.OPENAI_API_KEY?.trim();
  if (openaiKey) {
    return {
      name: "openai",
      url: "https://api.openai.com/v1/chat/completions",
      apiKey: openaiKey,
      model: "gpt-4o-mini",
    };
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, neurotype, stepSize } = body as {
      title: string;
      neurotype?: string[];
      stepSize?: string;
    };

    if (!title || typeof title !== "string" || !title.trim()) {
      return NextResponse.json({ error: "Task title is required." }, { status: 400 });
    }

    const provider = pickProvider();
    if (!provider) {
      return NextResponse.json(
        { error: "API key not configured. Set GROQ_API_KEY or OPENAI_API_KEY in .env.local." },
        { status: 500 },
      );
    }

    const neuroContext = neurotype?.length
      ? `The user has these neurotypes/preferences: ${neurotype.join(", ")}. Tailor steps accordingly.`
      : "";

    const sizeContext =
      stepSize === "small"
        ? "Break the task into many small, very simple steps (6–10 steps)."
        : stepSize === "large"
        ? "Break the task into fewer, broader steps (3–5 steps)."
        : "Break the task into a balanced number of steps (4–7 steps).";

    const systemPrompt = `You are a helpful productivity assistant that breaks tasks into clear, actionable steps.
${neuroContext}
${sizeContext}
Always respond with ONLY valid JSON in this exact format — no extra text, no markdown:
{
  "title": "cleaned up task title",
  "steps": [
    { "text": "step description", "duration": "estimated time e.g. 5 mins" }
  ]
}`;

    const response = await fetch(provider.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${provider.apiKey}`,
      },
      body: JSON.stringify({
        model: provider.model,
        max_tokens: 1024,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Break this task into steps: "${title.trim()}"` },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`${provider.name} API error (status ${response.status}):`, errText);

      // Map common upstream errors to user-facing messages.
      let userMessage: string;
      if (response.status === 401) {
        userMessage = `Invalid ${provider.name.toUpperCase()} API key. Check .env.local.`;
      } else if (response.status === 402 || /quota|insufficient|billing/i.test(errText)) {
        userMessage = `${provider.name.toUpperCase()} quota exceeded. Add credits or switch providers.`;
      } else if (response.status === 429) {
        userMessage = "Rate limit hit. Wait a moment and try again.";
      } else if (response.status === 404 || /model.*not.*found/i.test(errText)) {
        userMessage = `${provider.name.toUpperCase()} doesn't recognize the model. Check the route config.`;
      } else {
        // Pull the upstream error.message if possible, otherwise show status.
        let detail = `HTTP ${response.status}`;
        try {
          const parsed = JSON.parse(errText) as { error?: { message?: string } | string };
          if (typeof parsed.error === "string") detail = parsed.error;
          else if (parsed.error?.message) detail = parsed.error.message;
        } catch {
          /* keep status code fallback */
        }
        userMessage = `${provider.name.toUpperCase()} error: ${detail.slice(0, 200)}`;
      }

      return NextResponse.json({ error: userMessage }, { status: 502 });
    }

    const data = await response.json();
    const rawText = data?.choices?.[0]?.message?.content ?? "";

    let parsed: { title: string; steps: { text: string; duration: string }[] };
    try {
      const clean = rawText.replace(/```json|```/g, "").trim();
      parsed = JSON.parse(clean);
    } catch {
      console.error(`Failed to parse ${provider.name} response:`, rawText);
      return NextResponse.json(
        { error: "Couldn't generate steps right now. Please try again." },
        { status: 500 },
      );
    }

    return NextResponse.json(parsed, { status: 200 });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 },
    );
  }
}
