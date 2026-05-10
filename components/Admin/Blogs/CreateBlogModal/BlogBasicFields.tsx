type Props = {
  title: string;
  setTitle: (value: string) => void;
  thumbnail: string;
  setThumbnail: (value: string) => void;
  excerpt: string;
  setExcerpt: (value: string) => void;
};

export default function BlogBasicFields({
  title,
  setTitle,
  thumbnail,
  setThumbnail,
  excerpt,
  setExcerpt,
}: Props) {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium text-[#06182e] mb-2">Title</p>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter blog title..."
          className="
            w-full
            border border-[#06182e]/10
            rounded-xl
            px-4 py-3
            outline-none
            focus:border-[#06182e]
          "
        />
      </div>

      <div>
        <p className="text-sm font-medium text-[#06182e] mb-2">Thumbnail URL</p>

        <input
          value={thumbnail}
          onChange={(e) => setThumbnail(e.target.value)}
          placeholder="Paste image URL..."
          className="
            w-full
            border border-[#06182e]/10
            rounded-xl
            px-4 py-3
          "
        />
      </div>

      <div>
        <p className="text-sm font-medium text-[#06182e] mb-2">Excerpt</p>

        <textarea
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          placeholder="Short summary..."
          rows={4}
          className="
            w-full
            border border-[#06182e]/10
            rounded-xl
            px-4 py-3
            resize-none
          "
        />
      </div>
    </div>
  );
}
