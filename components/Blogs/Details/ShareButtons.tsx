"use client";

import { useState } from "react";
import { Share2, Link as LinkIcon, Check } from "lucide-react";
import X from "@/components/common/x";

interface ShareButtonsProps {
  title: string;
  url: string;
}

export const ShareButtons = ({ title, url }: ShareButtonsProps) => {
  const [copied, setCopied] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const shareLinks = [
    {
      name: "Twitter",
      icon: X,
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
    },
  ];

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowTooltip(!showTooltip)}
        className="flex items-center gap-2 text-[#06182e]/50 hover:text-[#06182e] transition-colors"
      >
        <Share2 size={18} />
        <span className="text-sm">Share</span>
      </button>

      {showTooltip && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowTooltip(false)}
          />
          <div className="absolute top-full mt-2 left-0 bg-white shadow-xl rounded-xl p-3 z-20 min-w-50 border border-gray-100">
            <div className="space-y-1">
              {shareLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  <link.icon size={16} />
                  {link.name}
                </a>
              ))}
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm w-full"
              >
                {copied ? (
                  <Check size={16} className="text-green-500" />
                ) : (
                  <LinkIcon size={16} />
                )}
                {copied ? "Copied!" : "Copy Link"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
