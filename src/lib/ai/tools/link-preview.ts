import { tool } from "ai";
import { z } from "zod";

/**
 * FE-07 — server-side tool: fetch and parse a URL's meta tags into a
 * link-preview payload.
 *
 * Fits CollabPro's "documents" theme: users pasting a link into the
 * assistant (a source article, a competitor page, a doc to reference) is a
 * realistic first tool for a team collaboration workspace, and it's a
 * clean example of a tool whose four lifecycle states (input-streaming,
 * input-available, output-available, output-error) are each genuinely
 * different moments a user should be able to tell apart:
 *   - input-streaming: the model is still deciding/typing which URL to fetch
 *   - input-available: the URL is locked in, the fetch hasn't resolved yet
 *   - output-available: real metadata came back — render it as a card
 *   - output-error: the fetch failed (bad URL, timeout, non-HTML, 404, etc.)
 *
 * The input schema is intentionally small (one required field) per the
 * brief's mentor tip: every optional field is something the model can
 * hallucinate a value for instead of the page just not having it.
 */

export const linkPreviewInputSchema = z.object({
  url: z
    .string()
    .describe(
      "The absolute URL to fetch and summarize, including the scheme (https://...).",
    ),
});

export type LinkPreviewInput = z.infer<typeof linkPreviewInputSchema>;

/**
 * Return shape of a successful fetch. `execute` either resolves with this
 * shape or throws — a thrown error surfaces to the client as the tool
 * part's `output-error` state with `errorText`, which is exactly the
 * "designed error state, not a crash" the brief asks for.
 */
export interface LinkPreviewOutput {
  url: string;
  finalUrl: string;
  title: string | null;
  description: string | null;
  siteName: string | null;
  image: string | null;
  fetchedAt: string;
}

const FETCH_TIMEOUT_MS = 8000;
const MAX_HTML_BYTES = 2_000_000; // 2MB cap so a huge page can't hang the tool

function extractMeta(html: string, name: string): string | null {
  // Matches <meta name="X" content="Y"> or <meta property="X" content="Y">
  // in either attribute order, tolerant of single/double quotes.
  const patterns = [
    new RegExp(
      `<meta[^>]+(?:name|property)=["']${name}["'][^>]+content=["']([^"']*)["']`,
      "i",
    ),
    new RegExp(
      `<meta[^>]+content=["']([^"']*)["'][^>]+(?:name|property)=["']${name}["']`,
      "i",
    ),
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) return decodeHtmlEntities(match[1].trim());
  }
  return null;
}

function extractTitle(html: string): string | null {
  const match = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  return match?.[1] ? decodeHtmlEntities(match[1].trim()) : null;
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'");
}

export const linkPreviewTool = tool({
  description:
    "Fetch a web page and return its title, description, site name, and preview image from its meta tags. Use this when the user shares or asks about a specific URL and wants to know what it is before opening it.",
  inputSchema: linkPreviewInputSchema,
  execute: async ({ url }: LinkPreviewInput): Promise<LinkPreviewOutput> => {
    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch {
      throw new Error(`"${url}" is not a valid URL.`);
    }

    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      throw new Error(
        `Only http/https URLs can be previewed (got "${parsed.protocol}").`,
      );
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    let response: Response;
    try {
      response = await fetch(parsed.toString(), {
        signal: controller.signal,
        redirect: "follow",
        headers: {
          "User-Agent": "CollabProLinkPreviewBot/1.0 (+https://collabpro.app)",
          Accept: "text/html,application/xhtml+xml",
        },
      });
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error(`Timed out fetching "${url}" after ${FETCH_TIMEOUT_MS}ms.`);
      }
      throw new Error(
        `Could not reach "${url}": ${error instanceof Error ? error.message : "network error"}.`,
      );
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      throw new Error(`"${url}" responded with HTTP ${response.status}.`);
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("text/html")) {
      throw new Error(
        `"${url}" is not an HTML page (content-type: ${contentType || "unknown"}).`,
      );
    }

    // Read only up to MAX_HTML_BYTES — meta tags are always in <head>, so we
    // never need the full document even for large pages.
    const reader = response.body?.getReader();
    let html = "";
    if (reader) {
      let received = 0;
      const decoder = new TextDecoder();
      while (received < MAX_HTML_BYTES) {
        const { done, value } = await reader.read();
        if (done) break;
        received += value.byteLength;
        html += decoder.decode(value, { stream: true });
        if (/<\/head>/i.test(html)) break;
      }
      await reader.cancel().catch(() => {});
    } else {
      html = await response.text();
    }

    return {
      url,
      finalUrl: response.url || url,
      title: extractMeta(html, "og:title") ?? extractTitle(html),
      description:
        extractMeta(html, "og:description") ?? extractMeta(html, "description"),
      siteName: extractMeta(html, "og:site_name"),
      image: extractMeta(html, "og:image"),
      fetchedAt: new Date().toISOString(),
    };
  },
});
