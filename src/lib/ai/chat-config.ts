import { google } from "@ai-sdk/google";
import type { InferUITools, LanguageModel, UIMessage } from "ai";
import { linkPreviewTool } from "@/lib/ai/tools/link-preview";

/**
 * Central configuration for the CollabPro AI assistant.
 *
 * This is the single module the route handler (src/app/api/chat/route.ts)
 * and any future AI feature should import model/prompt config from, so the
 * "brain" of the assistant never gets scattered across files. FE-07 extends
 * this same route handler, so keep additions here well-commented.
 */

/**
 * The model used for the assistant chat. Swapping providers/models should
 * only ever require changing this one line.
 *
 * Uses Google Gemini rather than the Anthropic SDK: the FlyRank internship
 * Q&A for this assignment explicitly confirms Gemini is an acceptable
 * substitute, since Anthropic's API has no free tier. The AI SDK's
 * `streamText`/`useChat` pairing works identically regardless of provider,
 * so switching to `anthropic("claude-...")` later is a one-line change.
 */
export const CHAT_MODEL: LanguageModel = google("gemini-2.5-flash");

/**
 * System prompt for the assistant. Kept short and workspace-scoped: this is
 * a general-purpose assistant surfaced inside CollabPro's dashboard, not a
 * document-specific Q&A tool (that's a plausible FE-07/Phase 2 extension —
 * see the "why it matters" framing in the assignment brief).
 */
export const CHAT_SYSTEM_PROMPT = `You are the CollabPro AI assistant, embedded in a real-time team collaboration workspace (documents, comments, permissions, audit logs).

Answer questions helpfully and concisely. You do not currently have live access to the user's actual documents, teams, or audit logs — if asked about specific workspace data, say so plainly rather than inventing details, and suggest the user check the relevant CollabPro page (Documents, Settings, Audit Logs).

You have a linkPreview tool: use it whenever the user shares a URL or asks what a specific link is about, so they get real title/description/image data instead of a guess. Only call it with a URL the user actually provided or clearly implied — never invent a URL to look up.

Keep responses focused: a few short paragraphs or a tight list, not long essays, unless the user explicitly asks for depth.`;

/**
 * Generation limits. Capped to keep streaming responses fast and to bound
 * cost — the assistant is meant for quick workspace questions, not
 * long-form writing.
 */
export const CHAT_MAX_OUTPUT_TOKENS = 1024;

/**
 * FE-07 — tools available to the assistant. Each entry's key is the tool
 * name the model calls and that shows up client-side as a `tool-<name>`
 * message part (e.g. `tool-linkPreview`). Read-only / side-effect-free by
 * design: it only fetches a public URL and parses meta tags, so it needs
 * no user confirmation step before running (contrast with a write-style
 * tool, which would need one — see FL-06's guardrail for that pattern).
 */
export const CHAT_TOOLS = {
  linkPreview: linkPreviewTool,
};

/**
 * The fully-typed UIMessage shape for this app: `UIMessage`'s default TOOLS
 * parameter is the generic `UITools` bag, which erases specific tool part
 * types (`tool-linkPreview`) down to `never` under a type guard. Importing
 * this type instead of the bare `UIMessage` — on both the route handler and
 * any client component that inspects `message.parts` — keeps tool parts
 * fully typed end to end (`part.input.url`, `part.output.title`, etc.)
 * instead of requiring `as` casts at every use site.
 */
export type ChatTools = InferUITools<typeof CHAT_TOOLS>;
export type ChatUIMessage = UIMessage<unknown, never, ChatTools>;
