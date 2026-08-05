"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useMemo, useState, type FormEvent, type KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { ChatMessage } from "@/components/assistant/chat-message";
import { ThinkingIndicator } from "@/components/assistant/thinking-indicator";
import { useStickToBottom } from "@/components/assistant/use-stick-to-bottom";

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

  const { messages, sendMessage, status, stop, error } = useChat({
    transport,
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

  return (
    <div className="flex h-[calc(100vh-8.5rem)] flex-col overflow-hidden rounded-lg border border-border bg-card sm:h-[calc(100vh-9rem)]">
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
        <div
          ref={scrollRef}
          className="flex h-full flex-col gap-3 overflow-y-auto px-4 py-4"
        >
          {messages.length === 0 && (
            <p className="text-body text-muted-foreground">
              Start a conversation — ask a question to get going.
            </p>
          )}

          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}

          {showThinkingIndicator && <ThinkingIndicator />}

          {error && (
            <div
              role="alert"
              className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-caption text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
            >
              Something went wrong reaching the assistant. Please try again.
            </div>
          )}
        </div>

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
