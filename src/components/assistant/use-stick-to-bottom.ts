import { useCallback, useEffect, useRef, useState } from "react";

// Pixels of slack: if the user is within this distance of the true bottom,
// we still treat them as "at the bottom" (accounts for sub-pixel rounding
// and momentum scrolling on trackpads/touch).
const BOTTOM_THRESHOLD_PX = 48;

export interface StickToBottom {
  scrollRef: (node: HTMLDivElement | null) => void;
  isAtBottom: boolean;
  scrollToBottom: () => void;
}

/**
 * Keeps a scroll container pinned to the bottom while new content streams
 * in, but only while the user is already at the bottom. The moment the user
 * scrolls up — even mid-stream — the pin releases and content stops
 * autoscrolling out from under them. Callers can offer a "jump to latest"
 * affordance driven by `isAtBottom`.
 */
export function useStickToBottom(dependency: unknown): StickToBottom {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  // Tracks whether the *user* scrolled away, vs. a programmatic scroll we
  // triggered ourselves — prevents our own scrollTo from being
  // misread as "user scrolled up".
  const isProgrammaticScroll = useRef(false);

  const checkIsAtBottom = useCallback((node: HTMLDivElement) => {
    const distanceFromBottom =
      node.scrollHeight - node.scrollTop - node.clientHeight;
    return distanceFromBottom <= BOTTOM_THRESHOLD_PX;
  }, []);

  const scrollToBottom = useCallback(() => {
    const node = containerRef.current;
    if (!node) return;
    isProgrammaticScroll.current = true;
    node.scrollTo({ top: node.scrollHeight });
    setIsAtBottom(true);
  }, []);

  const scrollRef = useCallback(
    (node: HTMLDivElement | null) => {
      containerRef.current = node;
    },
    [],
  );

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const handleScroll = () => {
      if (isProgrammaticScroll.current) {
        isProgrammaticScroll.current = false;
        return;
      }
      setIsAtBottom(checkIsAtBottom(node));
    };

    node.addEventListener("scroll", handleScroll, { passive: true });
    return () => node.removeEventListener("scroll", handleScroll);
  }, [checkIsAtBottom]);

  // Re-pin to bottom on every content update, but only if the user hadn't
  // already scrolled away — this is what makes streaming tokens
  // auto-scroll without fighting a user who scrolled up to re-read
  // something.
  useEffect(() => {
    const node = containerRef.current;
    if (!node || !isAtBottom) return;
    isProgrammaticScroll.current = true;
    node.scrollTo({ top: node.scrollHeight });
    // `dependency` is intentionally opaque (message list + streaming text) —
    // this effect should re-run on every render that changes visible content.
  }, [dependency, isAtBottom]);

  return { scrollRef, isAtBottom, scrollToBottom };
}
