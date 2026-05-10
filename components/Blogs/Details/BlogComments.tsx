"use client";

import { useState } from "react";
import BlogCommentCard from "./BlogCommentCard";

type Comment = {
  _id: string;

  text: string;

  parent_id: string | null;

  user_id: {
    first_name: string;
  };
};

type Props = {
  blogId: string;

  comments: Comment[];

  pathname: string;

  router: any;

  refresh: () => void;
};

export default function BlogComments({
  blogId,

  comments,

  pathname,

  router,

  refresh,
}: Props) {
  const [text, setText] = useState("");

  const [loading, setLoading] = useState(false);

  const handleComment = async () => {
    try {
      if (!text.trim()) {
        return;
      }

      setLoading(true);

      const res = await fetch("/api/blogs/comment", {
        method: "POST",

        credentials: "include",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          blog_id: blogId,

          text,
        }),
      });

      if (res.status === 401) {
        router.push(`/login?redirect=${encodeURIComponent(pathname)}`);

        return;
      }

      setText("");

      refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="max-w-6xl mx-auto px-5 pb-20">
      <h2
        className="
          text-2xl
          font-bold

          text-[#06182e]

          mb-6
        "
      >
        Comments
      </h2>

      {/* Input */}
      <div className="mb-8">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Join the discussion..."
          className="
            w-full

            p-4

            rounded-xl

            border
            border-[#06182e]/15

            bg-white
          "
        />

        <button
          onClick={handleComment}
          disabled={loading}
          className="
            mt-4

            bg-[#06182e]
            text-[#FFF5E5]

            px-5 py-2

            rounded-full
          "
        >
          {loading ? "Posting..." : "Post"}
        </button>
      </div>

      {/* Comments */}
      <div className="space-y-5">
        {comments
          .filter((comment) => !comment.parent_id)
          .map((comment) => (
            <BlogCommentCard
              key={comment._id}
              blogId={blogId}
              comment={comment}
              allComments={comments}
              pathname={pathname}
              router={router}
              refresh={refresh}
            />
          ))}
      </div>
    </section>
  );
}
