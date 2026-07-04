"use client";

import { ReactNode } from "react";

type Props = {
  title: string;
  children: ReactNode;
};

const SettingGroup = ({ title, children }: Props) => {
  return (
    <section className="py-10 first:pt-0">
      <div className="mb-8">
        <p
          className="
            text-[11px]
            uppercase

            tracking-[0.35em]

            text-black/40
          "
        >
          {title}
        </p>
      </div>

      <div className="space-y-8">{children}</div>
    </section>
  );
};

export default SettingGroup;
