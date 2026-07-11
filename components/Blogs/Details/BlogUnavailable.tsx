import Link from "next/link";
import { Lock, EyeOff, ArrowLeft } from "lucide-react";

interface BlogUnavailableProps {
  type: "draft" | "hidden";
}

export const BlogUnavailable = ({ type }: BlogUnavailableProps) => {
  const config = {
    draft: {
      icon: Lock,
      title: "Draft Article",
      message:
        "This article is still being written and isn't ready for the public yet.",
      action: "Check back soon for new content!",
    },
    hidden: {
      icon: EyeOff,
      title: "Article Hidden",
      message:
        "This article has been hidden and is currently unavailable for viewing.",
      action: "Browse our other stories below.",
    },
  };

  const { icon: Icon, title, message, action } = config[type];

  return (
    <div className="bg-[#FFF5E5] min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-6">
          <div className="bg-[#06182e]/5 p-6 rounded-full">
            <Icon size={48} className="text-[#06182e]/30" />
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-[#06182e] mb-4">
          {title}
        </h1>
        <p className="text-[#06182e]/60 mb-4 text-lg">{message}</p>
        <p className="text-[#06182e]/40 mb-8">{action}</p>
        <Link
          href="/blogs"
          className="bg-[#06182e] text-white px-6 py-3 rounded-full font-medium hover:bg-[#0a223f] transition-colors inline-flex items-center gap-2"
        >
          <ArrowLeft size={18} />
          Browse All Stories
        </Link>
      </div>
    </div>
  );
};
