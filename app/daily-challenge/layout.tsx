import { CompleteProfileModal } from "@/components/auth/CompleteProfileModal";

export default function DailyChallengeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      {/* Profile completion prompt (auto-created / incomplete accounts) */}
      <CompleteProfileModal />
    </>
  );
}
