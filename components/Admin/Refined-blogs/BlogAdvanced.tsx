"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

import SettingGroup from "@/components/Admin/Players/SettingGroup";
import SettingRow from "@/components/Admin/Players/SettingRow";

import TCCInput from "@/components/common/TCCInput";
import TCCSelect from "@/components/common/TCCSelect";

type Props = {
  tags: string;
  setTags: (value: string) => void;

  status: string;
  setStatus: (value: string) => void;

  featured: boolean;
  setFeatured: (value: boolean) => void;
};

const BlogAdvanced = ({
  tags,
  setTags,
  status,
  setStatus,
  featured,
  setFeatured,
}: Props) => {
  const [open, setOpen] = useState(false);

  return (
    <section className="">
      <button
        onClick={() => setOpen(!open)}
        className="
          flex
          items-center
          gap-3

          text-sm
          uppercase

          tracking-[0.3em]

          text-black/45
        "
      >
        <ChevronDown
          size={18}
          className={`
            transition
            ${open ? "rotate-180" : ""}
          `}
        />
        Advanced
      </button>

      {open && (
        <div className="mt-10">
          <SettingGroup title="Settings">
            <SettingRow label="Tags">
              <TCCInput
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="premier league, city..."
              />
            </SettingRow>

            <SettingRow label="Status">
              <TCCSelect
                value={status}
                onChange={setStatus}
                options={[
                  {
                    label: "Draft",
                    value: "draft",
                  },
                  {
                    label: "Published",
                    value: "published",
                  },
                  {
                    label: "Hidden",
                    value: "hidden",
                  },
                ]}
              />
            </SettingRow>

            <SettingRow label="Featured">
              <button
                onClick={() => setFeatured(!featured)}
                className={`
                  w-14
                  h-8

                  rounded-full

                  transition

                  ${featured ? "bg-[#e09225]" : "bg-black/10"}
                `}
              >
                <div
                  className={`
                    h-6
                    w-6

                    rounded-full

                    bg-white

                    transition-all

                    ${featured ? "translate-x-7" : "translate-x-1"}
                  `}
                />
              </button>
            </SettingRow>
          </SettingGroup>
        </div>
      )}
    </section>
  );
};

export default BlogAdvanced;
