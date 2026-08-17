import type { LinkPreviewOutput } from "@/lib/ai/tools/link-preview";

/**
 * FE-07 — the `output-available` render for the `linkPreview` tool: a real
 * component (image + title + description + host), not a JSON dump.
 */
export function LinkPreviewCard({ preview }: { preview: LinkPreviewOutput }) {
  let host = preview.finalUrl;
  try {
    host = new URL(preview.finalUrl).hostname.replace(/^www\./, "");
  } catch {
    // finalUrl came back malformed from the tool somehow — fall back to
    // showing the raw string rather than throwing during render.
  }

  return (
    <a
      href={preview.finalUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="flex gap-3 overflow-hidden rounded-lg border border-border bg-card p-3 transition-colors hover:bg-muted"
    >
      {preview.image ? (
        // Arbitrary external og:image URLs aren't known to next/image at
        // build time, so a plain <img> is the correct choice here.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={preview.image}
          alt=""
          className="h-16 w-16 shrink-0 rounded-md border border-border object-cover"
        />
      ) : (
        <div
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-md border border-border bg-muted text-caption text-muted-foreground"
          aria-hidden
        >
          {host.slice(0, 1).toUpperCase()}
        </div>
      )}

      <div className="min-w-0 flex-1">
        <p className="truncate text-caption font-medium text-muted-foreground">
          {preview.siteName ?? host}
        </p>
        <p className="truncate text-body font-semibold text-card-foreground">
          {preview.title ?? preview.finalUrl}
        </p>
        {preview.description && (
          <p className="mt-0.5 line-clamp-2 text-caption text-muted-foreground">
            {preview.description}
          </p>
        )}
      </div>
    </a>
  );
}
