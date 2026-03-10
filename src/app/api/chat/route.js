import { InferenceClient } from "@huggingface/inference";

export const runtime = "nodejs";

const SYSTEM_PROMPT =
  "You are VantaGPT, a concise, helpful AI assistant for SaaS teams.";

export async function POST(request) {
  try {
    const body = await request.json();
    const messages = Array.isArray(body?.messages) ? body.messages : [];

    if (!process.env.HF_TOKEN) {
      return Response.json(
        { error: "Missing HF_TOKEN in the server environment." },
        { status: 500 }
      );
    }

    const model =
      process.env.HF_MODEL || "microsoft/Phi-3-mini-4k-instruct";

    console.log("Using model:", model);
    console.log("Token starts with:", process.env.HF_TOKEN?.substring(0, 5));

    // Use Hugging Face Inference API directly with new endpoint
    const response = await fetch(
      `https://router.huggingface.co/${model}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.HF_TOKEN}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          inputs: SYSTEM_PROMPT + "\n\n" + messages.map(m => `${m.role}: ${m.content}`).join("\n"),
          parameters: {
            max_new_tokens: 420,
            temperature: 0.6,
            return_full_text: false,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HF API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const text = Array.isArray(data) ? data[0]?.generated_text : data.generated_text;

    return Response.json({ text, model });
  } catch (error) {
    console.error("Inference error:", error);
    console.error("Error cause:", error?.cause);
    return Response.json(
      {
        error:
          error?.message ||
          "The model request failed. Check your HF token and model access.",
        details: error?.cause?.message || String(error?.cause),
      },
      { status: 500 }
    );
  }
}
