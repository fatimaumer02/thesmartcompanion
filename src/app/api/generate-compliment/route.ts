import { NextRequest, NextResponse } from "next/server"

type ProviderConfig = {
  name: "groq" | "openai"
  url: string
  apiKey: string
  model: string
}

function pickProvider(): ProviderConfig | null {
  const groq = process.env.GROQ_API_KEY?.trim()
  if (groq) {
    return {
      name: "groq",
      url: "https://api.groq.com/openai/v1/chat/completions",
      apiKey: groq,
      model: "llama-3.3-70b-versatile",
    }
  }
  const openai = process.env.OPENAI_API_KEY?.trim()
  if (openai) {
    return {
      name: "openai",
      url: "https://api.openai.com/v1/chat/completions",
      apiKey: openai,
      model: "gpt-4o-mini",
    }
  }
  return null
}

// System prompt tuned specifically for neurodivergent users. The goal is to
// validate the effort it takes to cross the intention→action gap, not produce
// generic cheerleading.
const SYSTEM_PROMPT = `You write short closing notes for SmartCompanion, an app for neurodivergent users (ADHD, dyslexia, autism, executive dysfunction). A user has just finished a task they broke into steps. This is the moment we acknowledge them.

Why this matters: for neurodivergent users, the gap between "knowing what to do" and "doing it" can feel uncrossable. Finishing a task — even a small one — is the achievement, not the size of the task.

Your job: write ONE short, warm, grounded compliment.

Rules:
- 1 or 2 sentences. Max ~25 words total.
- Acknowledge the effort of crossing the gap, not just the outcome.
- Be specific where you can — reference what they finished.
- No exclamation marks unless the sentence truly earns it (rare).
- BANNED phrases: "great job", "amazing", "rockstar", "crushed it", "keep it up", "now do more", "you got this", "you're on fire", "way to go", "well done"
- No streak, grind, hustle, or productivity language.
- No emojis. No quote marks around the output.
- Vary your phrasing across calls — don't always start with "You". Try opening with the task name, a feeling word, an observation, or a quiet acknowledgment.
- Warm and human, not perky. Like a friend who actually gets it.

Output the compliment text only. Nothing else.`

export async function POST(req: NextRequest) {
  const provider = pickProvider()
  if (!provider) {
    return NextResponse.json(
      { error: "API key not configured." },
      { status: 500 },
    )
  }

  let body: {
    title?: string
    stepCount?: number
    neurotype?: string[]
  }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 })
  }

  const title = body.title?.trim()
  if (!title) {
    return NextResponse.json({ error: "title is required." }, { status: 400 })
  }

  const neurotype = body.neurotype?.length
    ? body.neurotype.join(", ")
    : "unspecified"
  const stepCount = body.stepCount ?? null

  const userMessage = `Task just finished: "${title}"
Steps the user completed: ${stepCount ?? "several"}
Neurotype context: ${neurotype}

Write one short compliment as instructed.`

  try {
    const res = await fetch(provider.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${provider.apiKey}`,
      },
      body: JSON.stringify({
        model: provider.model,
        max_tokens: 90,
        temperature: 1.0, // higher temp → more variety across calls
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userMessage },
        ],
      }),
    })

    if (!res.ok) {
      const errText = await res.text()
      console.error(`${provider.name} compliment error (${res.status}):`, errText)
      return NextResponse.json(
        { error: "Couldn't generate a compliment right now." },
        { status: 502 },
      )
    }

    const data = await res.json()
    const raw: string = data?.choices?.[0]?.message?.content ?? ""
    if (!raw.trim()) {
      return NextResponse.json(
        { error: "Empty response from model." },
        { status: 502 },
      )
    }

    // Strip wrapping quotes the model sometimes adds even when told not to.
    const clean = raw
      .trim()
      .replace(/^["'“‘]+|["'”’]+$/g, "")
      .trim()

    return NextResponse.json({ compliment: clean })
  } catch (err) {
    console.error("Compliment generation unexpected error:", err)
    return NextResponse.json(
      { error: "Unexpected error" },
      { status: 500 },
    )
  }
}
