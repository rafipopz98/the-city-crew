"use client";

import { useState } from "react";

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

  comment: Comment;

  allComments: Comment[];

  pathname: string;

  router: any;

  refresh: () => void;
};

export default function BlogCommentCard({
  blogId,

  comment,

  allComments,

  pathname,

  router,

  refresh,
}: Props) {
  const [replying, setReplying] = useState(false);

  const [replyText, setReplyText] = useState("");

  const [loading, setLoading] = useState(false);

  const replies = allComments.filter((item) => item.parent_id === comment._id);

  const handleReply = async () => {
    try {
      if (!replyText.trim()) {
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

          parent_id: comment._id,

          text: replyText,
        }),
      });

      if (res.status === 401) {
        router.push(`/login?redirect=${encodeURIComponent(pathname)}`);

        return;
      }

      setReplyText("");

      setReplying(false);

      refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="
        bg-white

        border
        border-[#06182e]/10

        rounded-2xl

        p-5
      "
    >
      {/* Main comment */}
      <p
        className="
          font-semibold

          text-[#06182e]
        "
      >
        {comment.user_id?.first_name}
      </p>

      <p
        className="
          mt-2

          text-[#06182e]/80
        "
      >
        {comment.text}
      </p>

      {/* Reply button */}
      <button
        onClick={() => setReplying(!replying)}
        className="
          mt-3

          text-sm

          text-[#e09225]

          font-semibold
        "
      >
        Reply
      </button>

      {/* Reply input */}
      {replying && (
        <div className="mt-4">
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Write a reply..."
            className="
              w-full

              border
              border-[#06182e]/10

              rounded-xl

              p-3
            "
          />

          <button
            onClick={handleReply}
            disabled={loading}
            className="
              mt-3

              bg-[#06182e]
              text-[#FFF5E5]

              px-4 py-2

              rounded-full
            "
          >
            {loading ? "Posting..." : "Post Reply"}
          </button>
        </div>
      )}

      {/* Replies */}
      {replies.length > 0 && (
        <div
          className="
            mt-6
            ml-5

            border-l-2
            border-[#e09225]/30

            pl-5

            space-y-4
          "
        >
          {replies.map((reply) => (
            <div key={reply._id}>
              <p
                className="
                    font-semibold
                    text-sm

                    text-[#06182e]
                  "
              >
                {reply.user_id?.first_name}
              </p>

              <p
                className="
                    mt-1
                    text-sm

                    text-[#06182e]/70
                  "
              >
                {reply.text}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
