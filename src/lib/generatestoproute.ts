// src/app/api/generate-steps/route.ts
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  const { title, neurotype, stepSize, stepSizeInstruction } = await req.json()

  // ── Build step-size instruction ───────────────────────────────────────────
  const stepInstruction = stepSizeInstruction ||
    ({
      "Very Small": "Break the task into 8 to 9 very small micro-steps. Each step should be extremely simple and take less than 2 minutes.",
      "Normal":     "Break the task into 4 to 6 balanced steps. Each step should be clear and straightforward.",
      "Detailed":   "Break the task into detailed steps with thorough instructions and context for each action. Include up to 10 steps if needed.",
    }[stepSize as string] ?? "Break the task into 4 to 6 clear steps.")

  const prompt = `
You are a productivity assistant helping neurodivergent users.

Task: "${title}"
User neurotype: ${neurotype || "not specified"}

Step size preference: ${stepInstruction}

Return ONLY a valid JSON object in this exact format, no markdown, no explanation, no code blocks:
{
  "title": "cleaned task title",
  "steps": [
    { "text": "step description", "duration": "X min" },
    ...
  ]
}

Rules:
- Each step must be a single, concrete action
- Duration should be realistic (1–15 min per step)
- Adapt language for the neurotype if specified
- Never add extra text outside the JSON
`.trim()

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model:       "llama-3.3-70b-versatile", // fast + smart Groq model
        max_tokens:  1024,
        temperature: 0.4,
        messages: [
          {
            role:    "system",
            content: "You are a helpful assistant. Always respond with valid JSON only. No markdown, no explanation.",
          },
          {
            role:    "user",
            content: prompt,
          },
        ],
      }),
    })

    if (!res.ok) {
      const err = await res.json()
      console.error("Groq API error:", err)
      return NextResponse.json(
        { error: "Groq API request failed. Please try again." },
        { status: 500 }
      )
    }

    const raw  = await res.json()
    const text = raw?.choices?.[0]?.message?.content ?? ""

    // Strip any accidental markdown code fences
    const cleaned = text.replace(/```json|```/g, "").trim()

    const parsed = JSON.parse(cleaned)
    return NextResponse.json(parsed)

  } catch (e) {
    console.error("generate-steps error:", e)
    return NextResponse.json(
      { error: "Couldn't generate steps right now. Please try again." },
      { status: 500 }
    )
  }
}