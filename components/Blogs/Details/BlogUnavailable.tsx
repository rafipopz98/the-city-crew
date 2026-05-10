import Link from "next/link";

type Props = {
  type: "draft" | "hidden";
};

export default function BlogUnavailable({ type }: Props) {
  const isDraft = type === "draft";

  return (
    <div
      className="
        min-h-screen
        pt-28
        bg-[#FFF5E5]

        flex
        flex-col
        items-center
        justify-center

        text-center

        px-5
      "
    >
      <h1
        className="
          text-4xl

          font-black

          uppercase

          text-[#06182e]
        "
      >
        {isDraft ? "Draft Story" : "Private Story"}
      </h1>

      <p
        className="
          mt-4

          text-[#06182e]/60
        "
      >
        {isDraft
          ? "This story is still being prepared."
          : "This story is currently hidden."}
      </p>

      <Link
        href="/blogs"
        className="
          mt-8

          bg-[#06182e]
          text-[#FFF5E5]

          px-6 py-3

          rounded-full
        "
      >
        Explore Stories
      </Link>
    </div>
  );
}
