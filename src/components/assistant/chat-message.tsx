import { cn } from "@/lib/cn";
import type { ChatUIMessage } from "@/lib/ai/chat-config";
import { LinkPreviewToolPart } from "@/components/assistant/link-preview-tool-part";

export interface ChatMessageProps {
  message: ChatUIMessage;
}

/**
 * Renders a single chat turn. Deliberately renders streamed text as plain
 * text (via CSS `white-space: pre-wrap`) rather than parsing it as
 * markdown live: half-finished markdown (an unclosed code fence, a dangling
 * "**") visibly breaks mid-stream if you feed partial text into a naive
 * markdown renderer. Once AI SDK message "parts" are finalized this is a
 * safe upgrade path — swap the text span below for a streaming-aware
 * renderer without touching layout or state.
 *
 * FE-07: a message's `parts` array can also contain tool parts
 * (`type: "tool-linkPreview"`), interleaved with text parts in the order
 * the model produced them. Each part type gets its own rendering — tool
 * parts are rendered full-width outside the chat bubble (a link-preview
 * card reads better as its own block than squeezed into a bubble), text
 * parts stay in the bubble as before.
 */
export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  const text = message.parts
    .filter((part): part is Extract<typeof part, { type: "text" }> => part.type === "text")
    .map((part) => part.text)
    .join("");

  const toolParts = message.parts.filter(
    (part): part is Extract<typeof part, { type: "tool-linkPreview" }> =>
      part.type === "tool-linkPreview",
  );

  return (
    <div className="flex w-full flex-col gap-2" data-role={message.role}>
      {text.length > 0 && (
        <div className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}>
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
      )}

      {toolParts.map((part) => (
        <div key={part.toolCallId} className="w-full sm:max-w-[75%]">
          <LinkPreviewToolPart
            state={part.state}
            input={part.input}
            output={part.state === "output-available" ? part.output : undefined}
            errorText={part.state === "output-error" ? part.errorText : undefined}
          />
        </div>
      ))}
    </div>
  );
}
