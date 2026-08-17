import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  wrapLanguageModel,
  type UIMessage,
} from "ai";
import {
  CHAT_MAX_OUTPUT_TOKENS,
  CHAT_MODEL,
  CHAT_SYSTEM_PROMPT,
  CHAT_TOOLS,
} from "@/lib/ai/chat-config";

// Streaming responses can legitimately take longer than the default
// serverless timeout on some hosts; this only affects how long the
// platform will keep the function alive, not actual response latency.
export const maxDuration = 30;

/**
 * FE-08 sabotage helper — dev/test only. Wraps the real model so its
 * `doStream` throws an error whose message contains "429", the same shape
 * `streamText`'s `onError` sees for a genuine provider rate limit. This
 * exercises the *actual* onError branch below (see the mentor tips' "test
 * by sabotage" requirement) instead of short-circuiting before
 * `streamText` runs, which would test the wrong code path.
 */
function sabotageRateLimitedModel() {
  return wrapLanguageModel({
    // CHAT_MODEL is a real model instance (google(...)), not a bare model
    // id string, so it's safe to pass directly to wrapLanguageModel here
    // even though its exported type is the broader `LanguageModel` union.
    model: CHAT_MODEL as Parameters<typeof wrapLanguageModel>[0]["model"],
    middleware: {
      wrapStream: async () => {
        throw new Error("429 Too Many Requests — quota exceeded (sabotage mode)");
      },
    },
  });
}

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
  if (process.env.SABOTAGE_MODE === "throw") {
    throw new Error("Sabotage: simulated total network failure before any stream started.");
  }

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
    model:
      process.env.SABOTAGE_MODE === "429"
        ? sabotageRateLimitedModel()
        : CHAT_MODEL,
    system: CHAT_SYSTEM_PROMPT,
    messages: await convertToModelMessages(body.messages),
    maxOutputTokens: CHAT_MAX_OUTPUT_TOKENS,
    tools: CHAT_TOOLS,
    // Allow the model to see a tool's output and respond in the same turn
    // (call linkPreview, then talk about what it found) instead of just
    // returning the raw tool result as the final message.
    stopWhen: stepCountIs(5),
    abortSignal: request.signal,
  });

  // FE-08: a mid-stream provider error (rate limit, timeout, malformed
  // response from the model) must surface as a designed `output-error`
  // part on the client, not an unhandled crash. `onError` here is what
  // makes that possible — without it, streamText's default behavior is to
  // swallow the error into the stream in a way the UI can still render,
  // but this makes the failure explicit and logged server-side too.
  return result.toUIMessageStreamResponse({
    onError: (error) => {
      console.error("[chat route] stream error:", error);
      if (error instanceof Error) {
        // Keep provider error text terse and safe to show a user — avoid
        // leaking stack traces or internal identifiers to the client.
        if (/429|rate.?limit|quota/i.test(error.message)) {
          return "The assistant is temporarily rate-limited. Please wait a moment and try again.";
        }
        return "The assistant hit an error generating a response. Please try again.";
      }
      return "An unexpected error occurred.";
    },
  });
}
