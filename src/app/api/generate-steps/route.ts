import { NextRequest, NextResponse } from "next/server";

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

    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    if (!GROQ_API_KEY) {
      return NextResponse.json({ error: "API key not configured." }, { status: 500 });
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

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        max_tokens: 1024,
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: `Break this task into steps: "${title.trim()}"`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Groq API error:", errText);
      return NextResponse.json(
        { error: "Failed to generate steps. Please try again." },
        { status: 502 }
      );
    }

    const groqData = await response.json();
    const rawText = groqData?.choices?.[0]?.message?.content ?? "";

    let parsed: { title: string; steps: { text: string; duration: string }[] };
    try {
      const clean = rawText.replace(/```json|```/g, "").trim();
      parsed = JSON.parse(clean);
    } catch {
      console.error("Failed to parse Groq response:", rawText);
      return NextResponse.json(
        { error: "Couldn't generate steps right now. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json(parsed, { status: 200 });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}