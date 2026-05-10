import Link from "next/link";

export default function BlogNotFound() {
  return (
    <div
      className="
        min-h-screen

        bg-[#FFF5E5]

        flex
        flex-col
        items-center
        justify-center

        text-center

        px-5
        pt-28
      "
    >
      <h1
        className="
          text-6xl

          font-black

          text-[#06182e]
        "
      >
        404
      </h1>

      <h2
        className="
          text-2xl

          uppercase

          mt-4

          text-[#06182e]
        "
      >
        Story Not Found
      </h2>

      <p
        className="
          mt-3

          text-[#06182e]/60
        "
      >
        This story may have been removed or never existed.
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
        Back To Stories
      </Link>
    </div>
  );
}
