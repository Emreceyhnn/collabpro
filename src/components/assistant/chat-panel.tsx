"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useMemo, useState, type FormEvent, type KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { ChatMessage } from "@/components/assistant/chat-message";
import { ThinkingIndicator } from "@/components/assistant/thinking-indicator";
import { useStickToBottom } from "@/components/assistant/use-stick-to-bottom";
import { EmptyState } from "@/components/assistant/empty-state";
import type { ChatUIMessage } from "@/lib/ai/chat-config";

/**
 * The CollabPro AI assistant — FE-06's streaming chat interface.
 *
 * State model (see mentor tips in the assignment): stop is a state
 * transition, not just a UI action. After `stop()`, the partial assistant
 * message must remain in `messages`, the input must re-enable, and sending
 * a new message must work immediately — the AI SDK's `useChat` guarantees
 * this by design (stopping only aborts the network stream; it never
 * mutates message history), so no extra bookkeeping is needed here beyond
 * wiring the button to `stop`.
 */
export function ChatPanel() {
  const [input, setInput] = useState("");

  const transport = useMemo(
    () => new DefaultChatTransport({ api: "/api/chat" }),
    [],
  );

  const { messages, sendMessage, status, stop, error, regenerate } = useChat<ChatUIMessage>({
    transport,
    onError: (err) => {
      // FE-08: log client-side so a failed stream is visible in the
      // browser console during development/review, without leaking
      // anything to the rendered UI beyond the designed error banner below.
      console.error("[assistant] chat error:", err);
    },
  });

  const isStreaming = status === "streaming";
  const isSubmitting = status === "submitted";
  const isBusy = isStreaming || isSubmitting;

  // Re-pin scroll on every message list change and on each streamed chunk.
  // `messages` is a new array reference on every token, so this dependency
  // alone is sufficient to trigger the effect during streaming.
  const { scrollRef, isAtBottom, scrollToBottom } = useStickToBottom(messages);

  const canSend = input.trim().length > 0 && !isBusy;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSend) return;
    sendMessage({ text: input });
    setInput("");
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    // Enter sends, Shift+Enter inserts a newline — standard chat UX and
    // works the same on mobile soft keyboards that emit a real Enter key.
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (canSend) {
        sendMessage({ text: input });
        setInput("");
      }
    }
  }

  const lastMessage = messages[messages.length - 1];
  const showThinkingIndicator =
    isSubmitting || (isStreaming && lastMessage?.role !== "assistant");

  function handleRetry() {
    // FE-08: retry without duplicating history. `regenerate()` re-sends the
    // last request from where it left off — if the failure happened before
    // any assistant text streamed in, this is equivalent to resending the
    // last user message; if a partial assistant reply already streamed,
    // useChat's own bookkeeping (not ours) decides what gets replaced, so
    // we never manually slice `messages` and risk dropping/duplicating a
    // turn.
    void regenerate();
  }

  return (
    <div
      className="flex flex-col overflow-hidden rounded-lg border border-border bg-card"
      style={{ height: "calc(100dvh - 8.5rem)" }}
    >
      {/*
        FE-08 mobile Safari note: 100vh on iOS Safari is the *largest*
        possible viewport height (as if the address bar/keyboard were
        hidden), so a fixed `h-[100vh]` panel gets clipped under the browser
        chrome and — worse — doesn't shrink when the keyboard opens, which
        pushes the input off-screen behind the keyboard. `100dvh` (dynamic
        viewport height) tracks the *actual* visible viewport and resizes
        live as the keyboard opens/closes, so the input bar stays reachable.
        Kept as an inline style rather than a Tailwind class since this repo's
        Tailwind v4 setup doesn't have a `dvh` height utility configured.
      */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div>
          <h2 className="text-h4 font-semibold text-card-foreground">
            CollabPro Assistant
          </h2>
          <p className="text-caption text-muted-foreground">
            Ask about your workspace, or anything else.
          </p>
        </div>
      </div>

      <div className="relative flex-1 overflow-hidden">
        {messages.length === 0 && !error ? (
          <EmptyState
            onPick={(suggestion) => {
              setInput(suggestion);
            }}
          />
        ) : (
          <div
            ref={scrollRef}
            className="flex h-full flex-col gap-3 overflow-y-auto px-4 py-4"
          >
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}

            {showThinkingIndicator && <ThinkingIndicator />}

            {/*
              FE-08: the error state names what happened in plain language
              and gives a working retry action — not just "something went
              wrong." `error` clears itself the next time useChat submits
              successfully, so this banner is transient by construction.
            */}
            {error && (
              <div
                role="alert"
                className="flex items-center justify-between gap-3 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-caption text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
              >
                <span>
                  {error.message || "Something went wrong reaching the assistant."}
                </span>
                <button
                  type="button"
                  onClick={handleRetry}
                  className="shrink-0 rounded-md border border-red-300 bg-white px-2 py-1 font-medium text-red-700 transition-colors hover:bg-red-100 dark:border-red-800 dark:bg-red-950 dark:text-red-300 dark:hover:bg-red-900"
                >
                  Retry
                </button>
              </div>
            )}
          </div>
        )}

        {!isAtBottom && (
          <button
            type="button"
            onClick={scrollToBottom}
            className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full border border-border bg-card px-3 py-1.5 text-caption font-medium text-card-foreground shadow-md transition-colors hover:bg-muted"
          >
            Jump to latest ↓
          </button>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex items-end gap-2 border-t border-border p-3"
      >
        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message the assistant…"
          rows={1}
          disabled={isBusy}
          className={cn(
            "max-h-32 min-h-10 flex-1 resize-none rounded-md border border-border bg-background px-3 py-2 text-body text-foreground",
            "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
            "disabled:opacity-60",
          )}
        />

        {isBusy ? (
          <Button type="button" variant="outline" onClick={stop} aria-label="Stop generating">
            Stop
          </Button>
        ) : (
          <Button type="submit" disabled={!canSend} aria-label="Send message">
            Send
          </Button>
        )}
      </form>
    </div>
  );
}
