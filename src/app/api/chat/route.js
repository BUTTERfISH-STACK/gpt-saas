export const runtime = "nodejs";

const SYSTEM_PROMPT =
  "You are VantaGPT, a concise, helpful AI assistant for SaaS teams.";

export async function POST(request) {
  try {
    const body = await request.json();
    const messages = Array.isArray(body?.messages) ? body.messages : [];

    // Get vLLM configuration from environment
    const vllmBaseUrl = process.env.VLLM_BASE_URL || "http://localhost:8000";
    const vllmModel = process.env.VLLM_MODEL || "Qwen/Qwen3.5-9B";

    console.log("Using vLLM at:", vllmBaseUrl);
    console.log("Model:", vllmModel);

    // Prepare messages for vLLM (OpenAI-compatible format)
    const formattedMessages = messages.map((msg) => {
      // Handle multi-modal content (text + images)
      let content;
      if (Array.isArray(msg.content)) {
        // Content is already an array (multi-modal)
        content = msg.content;
      } else {
        // Content is a plain string
        content = msg.content;
      }
      return {
        role: msg.role,
        content: content,
      };
    });

    // Call vLLM using OpenAI-compatible API
    const response = await fetch(`${vllmBaseUrl}/v1/chat/completions`, {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        model: vllmModel,
        messages: formattedMessages,
        max_tokens: 420,
        temperature: 0.6,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`vLLM API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || "";

    return Response.json({ text, model: vllmModel });
  } catch (error) {
    console.error("Inference error:", error);
    console.error("Error cause:", error?.cause);
    return Response.json(
      {
        error:
          error?.message ||
          "The model request failed. Check if vLLM server is running.",
        details: error?.cause?.message || String(error?.cause),
      },
      { status: 500 }
    );
  }
}
