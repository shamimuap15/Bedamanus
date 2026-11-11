"use client";

import { useState } from "react";

export function CopyUrl({ path }: { path: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      title="Copy page link"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(`${window.location.origin}${path}`);
          setDone(true);
          setTimeout(() => setDone(false), 1500);
        } catch {}
      }}
      className="inline-flex max-w-full cursor-pointer items-center gap-1.5 rounded-full bg-[#f3f2ee] px-2.5 py-1 text-xs font-semibold text-[#121214] transition hover:bg-[#e9e7e1]"
    >
      <span className="truncate">{path}</span>
      <span aria-hidden>{done ? "✓" : "⧉"}</span>
      <span className="sr-only">{done ? "Copied" : "Copy link"}</span>
    </button>
  );
}
