# FE-06 — Streaming AI chat interface

CollabPro's "central AI interaction": a general-purpose assistant chat, embedded
in the workspace dashboard at `/assistant`.

## Files

- **Server:** `src/app/api/chat/route.ts` — route handler calling Gemini via
  the AI SDK's `streamText`, returning a UI message stream.
- **Model config:** `src/lib/ai/chat-config.ts` — model, system prompt, and
  token limit in one commented module (per the assignment's requirement and
  because FE-07 extends this same route handler).
- **Client:** `src/components/assistant/chat-panel.tsx` — `useChat`-driven
  chat UI: message list, thinking indicator, streamed text, stop button,
  input box.
- **Supporting components:** `chat-message.tsx` (message bubble),
  `thinking-indicator.tsx` (pre-first-token indicator),
  `use-stick-to-bottom.ts` (auto-scroll hook).
- **Page:** `src/app/assistant/page.tsx`, linked from the sidebar nav
  (`src/components/shell/nav-links.ts`).

## Setup to run locally

1. Get a free Gemini API key: https://aistudio.google.com/apikey
2. Copy `.env.local.example` to `.env.local` and paste the key into
   `GOOGLE_GENERATIVE_AI_API_KEY`.
3. `npm run dev`, then visit `/assistant`.

The key is read server-side only, by the `@ai-sdk/google` provider inside the
route handler — it is never sent to or read by the browser.

## How each evaluation criterion is met

- **Responses visibly stream token by token:** `streamText(...).toUIMessageStreamResponse()`
  on the server, consumed by `useChat` on the client — text renders as chunks
  arrive, not after the full response completes.
- **Generation can be stopped mid-stream without breaking state:** the Stop
  button calls `useChat`'s `stop()`. This aborts the fetch (which the server
  observes via `request.signal` and halts generation) without mutating
  `messages` — the partial assistant reply stays in the conversation, the
  input re-enables immediately, and sending a new message works right away.
- **Conversation state survives multiple turns:** `useChat` maintains the
  full `messages` array client-side and resends the whole history (via
  `convertToModelMessages`) on every request — multi-turn context is
  preserved automatically.
- **API key lives server-side only:** `GOOGLE_GENERATIVE_AI_API_KEY` is only
  ever read inside `route.ts` (server code), never exposed to client bundles.
- **Usable at phone width:** the chat panel is a single flex column with a
  bottom-anchored input bar; message bubbles cap at 85%/75% width so long
  words wrap instead of overflowing; the textarea and buttons use the
  project's existing responsive `Button`/spacing tokens.

## Known limitation / honest gap

The assistant currently has no live access to actual workspace data
(documents, comments, audit logs) — it's a general-purpose chat, not yet
grounded in CollabPro's own content. The system prompt in `chat-config.ts`
tells the model to say so rather than hallucinate specifics. Wiring real
document/audit context into the prompt (e.g. via MCP-style tool calls once
the backend has real data) is the natural FE-07 extension mentioned in the
assignment brief.
