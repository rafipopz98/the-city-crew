"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api/axios";

export default function GameRootPage() {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    api
      .get("/game/user")
      .then(({ data }) => {
        if (data.gameUser?.has_completed_onboarding) {
          router.replace("/game/home");
        } else {
          router.replace("/game/onboarding");
        }
      })
      .catch(() => {
        router.replace("/game/onboarding");
      })
      .finally(() => setChecked(true));
  }, [router]);

  if (!checked) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#e09225] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return null;
}
