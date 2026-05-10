type Props = {
  tags: string;
  setTags: (value: string) => void;
  status: string;
  setStatus: (value: string) => void;
  isFeatured: boolean;
  setIsFeatured: (value: boolean) => void;
};

export default function BlogSettings({
  tags,
  setTags,
  status,
  setStatus,
  isFeatured,
  setIsFeatured,
}: Props) {
  return (
    <div className="grid md:grid-cols-3 gap-4">
      <input
        value={tags}
        onChange={(e) => setTags(e.target.value)}
        placeholder="tags..."
        className="
          border border-[#06182e]/10
          rounded-xl
          px-4 py-3
        "
      />

      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="
          border border-[#06182e]/10
          rounded-xl
          px-4 py-3
        "
      >
        <option value="draft">Draft</option>

        <option value="published">Published</option>

        <option value="hidden">Hidden</option>
      </select>

      <label
        className="
          flex items-center gap-3
          border border-[#06182e]/10
          rounded-xl
          px-4
        "
      >
        <input
          type="checkbox"
          checked={isFeatured}
          onChange={(e) => setIsFeatured(e.target.checked)}
        />

        <span className="text-sm font-medium">Featured</span>
      </label>
    </div>
  );
}
