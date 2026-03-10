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
      process.env.HF_MODEL || "meta-llama/Meta-Llama-3.1-8B-Instruct";

    const client = new InferenceClient(process.env.HF_TOKEN);

    const response = await client.chatCompletion({
      model,
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
      max_tokens: 420,
      temperature: 0.6,
    });

    const text = response.choices?.[0]?.message?.content ?? "";

    return Response.json({ text, model });
  } catch (error) {
    return Response.json(
      {
        error:
          error?.message ||
          "The model request failed. Check your HF token and model access.",
      },
      { status: 500 }
    );
  }
}
