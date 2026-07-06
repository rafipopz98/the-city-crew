import { FileText, Plus } from "lucide-react";

type Props = {
  onCreate: () => void;
};

export default function EmptyBlogs({ onCreate }: Props) {
  return (
    <div
      className="
        col-span-full
        border border-dashed border-[#06182e]/10
        rounded-3xl
        bg-[#06182e]/5
        py-20 px-6
        flex flex-col items-center
        justify-center
        text-center
      "
    >
      <div
        className="
          w-16 h-16
          rounded-2xl
          bg-[#06182e]/5
          flex items-center justify-center
          mb-5
        "
      >
        <FileText size={28} className="text-[#06182e]/50" />
      </div>

      <h3
        className="
          text-lg font-semibold
          text-[#06182e]
        "
      >
        No blogs yet
      </h3>

      <p
        className="
          text-sm
          text-[#06182e]/50
          mt-2
          max-w-sm
        "
      >
        Start creating your first story and build your content library.
      </p>

      <button
        onClick={onCreate}
        className="
          mt-6
          flex items-center gap-2
          bg-[#06182e]
          text-white
          px-5 py-3
          rounded-xl
          font-medium
        "
      >
        <Plus size={16} />
        Create Blog
      </button>
    </div>
  );
}
