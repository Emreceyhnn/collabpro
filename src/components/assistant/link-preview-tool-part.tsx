import type { LinkPreviewOutput } from "@/lib/ai/tools/link-preview";
import { LinkPreviewCard } from "@/components/assistant/link-preview-card";

/**
 * FE-07 — renders one `tool-linkPreview` message part through its full
 * lifecycle. Each state gets a visual treatment that answers a different
 * question (per the assignment's mentor tips), not the same card relabeled:
 *
 *   input-streaming  -> "what is it doing, with what input?" (the URL is
 *                        still being typed out token by token)
 *   input-available   -> "it's running" (URL locked in, fetch in flight —
 *                        a skeleton, not a spinner, so it doesn't flash for
 *                        a fetch that resolves in under 200ms)
 *   output-available  -> "what came back?" (the real LinkPreviewCard)
 *   output-error      -> "what went wrong, what do I do about it?" (the
 *                        actual error text plus a plain-language reason)
 */

/**
 * The AI SDK's tool part state union also includes three approval-flow
 * states (`approval-requested`, `approval-responded`, `output-denied`) for
 * tools that require human confirmation before running. `linkPreview` is
 * read-only and side-effect-free (see the guardrail note in chat-config.ts)
 * so it never enters those states in practice — but the type is still the
 * full union, so this component maps every non-terminal state to the same
 * "still working" skeleton rather than narrowing the prop type and risking
 * a silently-unhandled state if that assumption ever changes.
 */
type ToolState =
  | "input-streaming"
  | "input-available"
  | "approval-requested"
  | "approval-responded"
  | "output-available"
  | "output-error"
  | "output-denied";

interface LinkPreviewToolPartProps {
  state: ToolState;
  input: { url?: string } | undefined;
  output: LinkPreviewOutput | undefined;
  errorText: string | undefined;
}

export function LinkPreviewToolPart({
  state,
  input,
  output,
  errorText,
}: LinkPreviewToolPartProps) {
  if (state === "input-streaming") {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-dashed border-border px-3 py-2 text-caption text-muted-foreground">
        <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-muted-foreground" />
        <span>
          Looking up a link{input?.url ? `: ${input.url}` : "…"}
        </span>
      </div>
    );
  }

  if (
    state === "input-available" ||
    state === "approval-requested" ||
    state === "approval-responded"
  ) {
    return (
      <div
        className="flex animate-pulse gap-3 rounded-lg border border-border bg-card p-3"
        aria-label="Fetching link preview"
        aria-live="polite"
      >
        <div className="h-16 w-16 shrink-0 rounded-md bg-muted" />
        <div className="min-w-0 flex-1 space-y-2 py-1">
          <div className="h-3 w-1/3 rounded bg-muted" />
          <div className="h-4 w-2/3 rounded bg-muted" />
          <div className="h-3 w-full rounded bg-muted" />
        </div>
      </div>
    );
  }

  if (state === "output-error" || state === "output-denied") {
    return (
      <div
        role="alert"
        className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-caption text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
      >
        <p className="font-medium">Couldn&apos;t load that link.</p>
        <p className="mt-0.5 opacity-90">
          {errorText ?? "The page didn't respond in a way we could read."}
        </p>
      </div>
    );
  }

  // output-available
  if (output) {
    return <LinkPreviewCard preview={output} />;
  }

  // Defensive fallback — output-available should always carry output, but
  // if a future SDK version changes that guarantee, fail into a visible
  // message instead of rendering nothing.
  return (
    <div className="rounded-lg border border-border bg-muted px-3 py-2 text-caption text-muted-foreground">
      Link preview finished with no data.
    </div>
  );
}
