export const BlogDetailsSkeleton = () => (
  <div className="bg-[#FFF5E5] min-h-screen animate-pulse">
    {/* Reading Progress Bar */}
    <div className="fixed top-0 left-0 right-0 z-50 h-0.5 bg-gray-200" />

    {/* Hero Section Skeleton */}
    <section className="max-w-6xl mx-auto px-5 pt-20 pb-12">
      {/* Tags */}
      <div className="flex gap-2 mb-6">
        <div className="h-8 w-24 bg-[#06182e]/5 rounded-full" />
        <div className="h-8 w-32 bg-[#06182e]/5 rounded-full" />
      </div>

      {/* Title */}
      <div className="space-y-3 mb-6">
        <div className="h-10 md:h-14 lg:h-16 bg-[#06182e]/5 rounded-lg w-full" />
        <div className="h-10 md:h-14 lg:h-16 bg-[#06182e]/5 rounded-lg w-3/4" />
      </div>

      {/* Excerpt */}
      <div className="space-y-2 mb-8 max-w-3xl">
        <div className="h-5 bg-[#06182e]/5 rounded w-full" />
        <div className="h-5 bg-[#06182e]/5 rounded w-5/6" />
        <div className="h-5 bg-[#06182e]/5 rounded w-2/3" />
      </div>

      {/* Meta */}
      <div className="flex items-center gap-6 mb-12">
        <div className="h-5 w-32 bg-[#06182e]/5 rounded" />
        <div className="h-5 w-16 bg-[#06182e]/5 rounded" />
        <div className="h-10 w-24 bg-[#06182e]/5 rounded-full" />
      </div>

      {/* Hero Image */}
      <div className="h-[45vh] md:h-[70vh] bg-[#06182e]/5 rounded-2xl" />
    </section>

    {/* Content Skeleton */}
    <div className="max-w-6xl mx-auto px-5">
      <div className="flex gap-8 lg:gap-12">
        <div className="flex-1 space-y-6">
          {/* Paragraph blocks */}
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-[#06182e]/5 rounded w-full" />
              <div className="h-4 bg-[#06182e]/5 rounded w-11/12" />
              <div className="h-4 bg-[#06182e]/5 rounded w-4/5" />
              <div className="h-4 bg-[#06182e]/5 rounded w-full" />
              <div className="h-4 bg-[#06182e]/5 rounded w-3/4" />
            </div>
          ))}

          {/* Image block */}
          <div className="h-64 md:h-96 bg-[#06182e]/5 rounded-2xl my-8" />

          {/* More paragraphs */}
          {[1, 2, 3].map((i) => (
            <div key={`more-${i}`} className="space-y-2">
              <div className="h-4 bg-[#06182e]/5 rounded w-full" />
              <div className="h-4 bg-[#06182e]/5 rounded w-5/6" />
              <div className="h-4 bg-[#06182e]/5 rounded w-full" />
              <div className="h-4 bg-[#06182e]/5 rounded w-2/3" />
            </div>
          ))}

          {/* Quote block */}
          <div className="border-l-4 border-[#e09225]/20 pl-6 my-8">
            <div className="space-y-2">
              <div className="h-5 bg-[#06182e]/5 rounded w-full" />
              <div className="h-5 bg-[#06182e]/5 rounded w-3/4" />
            </div>
          </div>

          {/* Final paragraphs */}
          {[1, 2].map((i) => (
            <div key={`final-${i}`} className="space-y-2">
              <div className="h-4 bg-[#06182e]/5 rounded w-full" />
              <div className="h-4 bg-[#06182e]/5 rounded w-4/5" />
              <div className="h-4 bg-[#06182e]/5 rounded w-full" />
            </div>
          ))}
        </div>

        {/* Sidebar Skeleton */}
        <aside className="hidden md:block w-64 shrink-0">
          <div className="sticky top-24 space-y-3">
            <div className="h-4 w-24 bg-[#06182e]/5 rounded mb-4" />
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className={`h-4 bg-[#06182e]/5 rounded ${i === 2 || i === 4 ? "ml-3 w-36" : "w-44"}`}
              />
            ))}
          </div>
        </aside>
      </div>
    </div>

    {/* Related Posts Skeleton */}
    <div className="bg-[#FFF5E5] py-16 mt-16">
      <div className="max-w-6xl mx-auto px-5">
        <div className="h-8 w-48 bg-[#06182e]/5 rounded mb-10" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i}>
              <div className="h-48 bg-[#06182e]/5 rounded-xl mb-4" />
              <div className="h-5 bg-[#06182e]/5 rounded w-3/4 mb-2" />
              <div className="h-4 bg-[#06182e]/5 rounded w-full mb-1" />
              <div className="h-4 bg-[#06182e]/5 rounded w-2/3" />
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Comments Section Skeleton */}
    <div className="max-w-3xl mx-auto px-5 pb-20">
      <div className="h-7 w-32 bg-[#06182e]/5 rounded mb-6" />
      <div className="h-32 bg-[#06182e]/5 rounded-xl mb-8" />
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-2xl p-5 mb-4">
          <div className="h-4 w-24 bg-[#06182e]/5 rounded mb-2" />
          <div className="h-3 w-full bg-[#06182e]/5 rounded mb-1" />
          <div className="h-3 w-3/4 bg-[#06182e]/5 rounded" />
        </div>
      ))}
    </div>
  </div>
);
