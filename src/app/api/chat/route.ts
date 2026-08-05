import { convertToModelMessages, streamText, type UIMessage } from "ai";
import {
  CHAT_MAX_OUTPUT_TOKENS,
  CHAT_MODEL,
  CHAT_SYSTEM_PROMPT,
} from "@/lib/ai/chat-config";

// Streaming responses can legitimately take longer than the default
// serverless timeout on some hosts; this only affects how long the
// platform will keep the function alive, not actual response latency.
export const maxDuration = 30;

interface ChatRequestBody {
  messages: UIMessage[];
}

/**
 * POST /api/chat
 *
 * Server-side streaming endpoint for the CollabPro AI assistant. Receives
 * the full conversation as AI SDK UIMessages, calls Gemini via `streamText`,
 * and returns a UI message stream that the client's `useChat` hook consumes
 * token-by-token.
 *
 * The Gemini API key (GOOGLE_GENERATIVE_AI_API_KEY) is read by the
 * `@ai-sdk/google` provider directly from server-side environment
 * variables — it is never sent to, or readable by, the browser.
 */
export async function POST(request: Request): Promise<Response> {
  let body: ChatRequestBody;

  try {
    body = (await request.json()) as ChatRequestBody;
  } catch {
    return new Response(
      JSON.stringify({ error: "Request body must be valid JSON." }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  if (!Array.isArray(body.messages)) {
    return new Response(
      JSON.stringify({ error: "Request body must include a messages array." }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  const result = streamText({
    model: CHAT_MODEL,
    system: CHAT_SYSTEM_PROMPT,
    messages: await convertToModelMessages(body.messages),
    maxOutputTokens: CHAT_MAX_OUTPUT_TOKENS,
    abortSignal: request.signal,
  });

  return result.toUIMessageStreamResponse();
}
