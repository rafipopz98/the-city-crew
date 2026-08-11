import GoalGraphicsBuilder from "@/components/Admin/GoalGraphics/GoalGraphicsBuilder";

export const metadata = {
  title: "Goal Graphics",
};

export default function GoalGraphicsPage() {
  return (
    <main className="min-h-screen bg-[#ece1cf]">
      <div className="w-full px-5 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#06182e]">Goal Graphics</h1>
          <p className="mt-1 text-sm text-[#06182e]/60">
            Design a goal celebration graphic — pick a player, drag and resize
            layers, then download as a PNG. Everything runs in your browser;
            nothing is uploaded.
          </p>
        </div>

        <GoalGraphicsBuilder />
      </div>
    </main>
  );
}
