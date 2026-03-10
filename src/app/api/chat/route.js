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
      process.env.HF_MODEL || "mistralai/Mistral-7B-Instruct-v0.2";

    console.log("Using model:", model);
    console.log("Token starts with:", process.env.HF_TOKEN?.substring(0, 5));

    const client = new InferenceClient(process.env.HF_TOKEN);

    // Build prompt from messages
    let prompt = SYSTEM_PROMPT + "\n\n";
    for (const msg of messages) {
      prompt += `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}\n`;
    }
    prompt += "Assistant:";

    const response = await client.generate({
      model,
      inputs: prompt,
      parameters: {
        max_new_tokens: 420,
        temperature: 0.6,
        return_full_text: false,
      },
    });

    const text = response?.[0]?.generated_text ?? "";

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
