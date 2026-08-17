"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AppShell } from "@/components/shell/app-shell";

/**
 * FE-08 — route-level error boundary for `/assistant`.
 *
 * This catches render-time failures in the assistant page's React tree
 * (e.g. a thrown error while rendering a tool part, a bug in a child
 * component) — a different failure mode from the in-band streaming errors
 * `useChat`'s `error` object already handles inside ChatPanel. Next.js
 * requires `error.tsx` to be a Client Component and always passes `reset`,
 * which re-mounts the segment rather than reloading the whole app, so the
 * rest of the shell (nav, header) never has to remount just because the
 * chat panel crashed.
 */
export default function AssistantError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[assistant route] render error:", error);
  }, [error]);

  return (
    <AppShell>
      <div
        role="alert"
        className="flex h-[calc(100dvh-8.5rem)] flex-col items-center justify-center gap-3 rounded-lg border border-border bg-card px-4 text-center"
      >
        <p className="text-h4 font-semibold text-card-foreground">
          The assistant hit a problem
        </p>
        <p className="max-w-sm text-body text-muted-foreground">
          Something went wrong loading the chat panel. Your conversation
          history is safe — the assistant itself hasn&apos;t crashed, just this
          view.
        </p>
        <Button type="button" onClick={reset}>
          Reload the assistant
        </Button>
      </div>
    </AppShell>
  );
}
