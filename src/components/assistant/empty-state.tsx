/**
 * FE-08 — designed empty state for the assistant's first-run/no-messages
 * case. Per the brief's mentor tips: "'No conversations yet' is a dead
 * end; 'No conversations yet — try asking about X' with a click-to-fill
 * example is a designed empty state." Each suggestion fills the input
 * (via onPick) rather than sending immediately, so the user can edit
 * before committing — consistent with every other send path in this UI
 * going through the same form submit.
 */

const SUGGESTIONS = [
  "What can you help me with in CollabPro?",
  "Summarize https://ai-sdk.dev/docs — what is this page about?",
  "Draft a short update for my team about this week's progress.",
];

interface EmptyStateProps {
  onPick: (suggestion: string) => void;
}

export function EmptyState({ onPick }: EmptyStateProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 px-4 text-center">
      <div>
        <p className="text-body font-medium text-card-foreground">
          No conversation yet
        </p>
        <p className="mt-1 text-caption text-muted-foreground">
          Try asking about one of these, or type your own question below.
        </p>
      </div>

      <div className="flex w-full max-w-sm flex-col gap-2">
        {SUGGESTIONS.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            onClick={() => onPick(suggestion)}
            className="rounded-lg border border-border bg-background px-3 py-2 text-left text-caption text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}
