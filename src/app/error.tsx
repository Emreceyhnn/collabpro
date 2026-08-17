"use client";

import { useEffect } from "react";

/**
 * FE-08 — global route boundary. Catches anything not already caught by a
 * more specific segment boundary (e.g. `src/app/assistant/error.tsx`).
 * Next.js's root `error.tsx` cannot rely on the root layout still being
 * mounted, so — unlike the assistant-specific boundary — this renders a
 * fully self-contained page rather than wrapping children in `AppShell`.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[root] unhandled render error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center gap-3 bg-neutral-50 px-4 text-center text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
        <p className="text-2xl font-semibold">Something went wrong</p>
        <p className="max-w-sm text-neutral-500 dark:text-neutral-400">
          CollabPro hit an unexpected error. Reloading usually fixes it.
        </p>
        <button
          type="button"
          onClick={reset}
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:opacity-90 dark:bg-white dark:text-neutral-900"
        >
          Try again
        </button>
      </body>
    </html>
  );
}
