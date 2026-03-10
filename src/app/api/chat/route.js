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

    const client = new InferenceClient(process.env.HF_TOKEN);

    // Build conversation for conversational API
    const conversation = [
      { role: "system", content: SYSTEM_PROMPT },
      ...messages,
    ];

    const response = await client.conversational({
      model,
      messages: conversation,
      max_tokens: 420,
      temperature: 0.6,
    });

    const text = response?.generated_text ?? "";

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
