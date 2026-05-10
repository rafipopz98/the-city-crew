export default function BlogLoading() {
  return (
    <div
      className="
        min-h-screen

        bg-[#FFF5E5]

        animate-pulse
      "
    >
      <div className="max-w-6xl mx-auto px-5 pt-28">
        <div className="flex gap-2 mb-8">
          <div className="w-20 h-7 rounded-full bg-black/10" />

          <div className="w-20 h-7 rounded-full bg-black/10" />
        </div>

        <div className="w-full h-20 bg-black/10 rounded mb-4" />

        <div className="w-3/4 h-20 bg-black/10 rounded mb-8" />

        <div className="w-full h-[60vh] bg-black/10 rounded-2xl mb-12" />

        <div className="space-y-4 max-w-3xl">
          <div className="h-4 w-full bg-black/10 rounded" />

          <div className="h-4 w-full bg-black/10 rounded" />

          <div className="h-4 w-3/4 bg-black/10 rounded" />
        </div>
      </div>
    </div>
  );
}
