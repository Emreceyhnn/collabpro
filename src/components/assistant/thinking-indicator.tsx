/**
 * Shown after the user sends a message, before the first token of the
 * assistant's reply has arrived. Rendered inline in the same message-list
 * flow (not a separate overlay) and replaced by the streaming text bubble
 * the instant the first chunk lands, so it reads as a handoff rather than a
 * flicker/swap.
 */
export function ThinkingIndicator() {
  return (
    <div className="flex w-full justify-start" aria-live="polite" aria-label="Assistant is thinking">
      <div className="flex items-center gap-1 rounded-lg bg-muted px-3 py-2.5">
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground" />
      </div>
    </div>
  );
}
