import { cn } from "@/lib/cn";
import type { UIMessage } from "ai";

export interface ChatMessageProps {
  message: UIMessage;
}

/**
 * Renders a single chat turn. Deliberately renders streamed text as plain
 * text (via CSS `white-space: pre-wrap`) rather than parsing it as
 * markdown live: half-finished markdown (an unclosed code fence, a dangling
 * "**") visibly breaks mid-stream if you feed partial text into a naive
 * markdown renderer. Once AI SDK message "parts" are finalized this is a
 * safe upgrade path — swap the text span below for a streaming-aware
 * renderer without touching layout or state.
 */
export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  const text = message.parts
    .filter((part): part is Extract<typeof part, { type: "text" }> => part.type === "text")
    .map((part) => part.text)
    .join("");

  return (
    <div
      className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}
      data-role={message.role}
    >
      <div
        className={cn(
          "max-w-[85%] rounded-lg px-3 py-2 text-body sm:max-w-[75%]",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-foreground",
        )}
      >
        <span className="whitespace-pre-wrap break-words">{text}</span>
      </div>
    </div>
  );
}
