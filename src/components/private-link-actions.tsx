"use client";

import { Check, Copy, ExternalLink } from "lucide-react";
import { useState } from "react";

export function PrivateLinkActions({ href, label }: { href: string; label: string }) {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    await navigator.clipboard.writeText(href);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="flex shrink-0 items-center gap-1.5">
      <button
        type="button"
        onClick={copyLink}
        aria-label={`Copy ${label} link`}
        title={copied ? "Copied" : "Copy link"}
        className="focus-ring flex size-9 items-center justify-center rounded-full border border-[var(--fairway)]/15 bg-white text-[var(--pine)] transition hover:border-[var(--pine)] hover:bg-[var(--sand)]"
      >
        {copied ? <Check size={16} /> : <Copy size={16} />}
      </button>
      <a
        href={href}
        aria-label={`Open ${label} link`}
        title="Open link"
        className="focus-ring flex size-9 items-center justify-center rounded-full bg-[var(--pine)] text-white shadow-[0_8px_18px_rgba(17,32,23,0.16)] transition hover:bg-[#103126]"
      >
        <ExternalLink size={16} />
      </a>
    </div>
  );
}
