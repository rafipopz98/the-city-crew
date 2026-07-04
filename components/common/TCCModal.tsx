"use client";

import { X } from "lucide-react";
import { ReactNode } from "react";

type Props = {
  open: boolean;
  onClose: () => void;

  title: string;
  description?: string;

  children: ReactNode;

  footer?: ReactNode;
};

const TCCModal = ({
  open,
  onClose,
  title,
  description,
  children,
  footer,
}: Props) => {
  if (!open) return null;

  return (
    <div
      onClick={onClose}
      className="
        fixed
        inset-0
        z-999

        bg-black/55
        backdrop-blur-sm

        p-4
        lg:p-10
      "
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="
          mx-auto

          flex
          h-full
          max-h-[95vh]
          w-full
          max-w-7xl

          flex-col

          overflow-hidden

          bg-[#ece1cf]

          shadow-[0_35px_100px_rgba(0,0,0,.30)]
        "
      >
        {/* Header */}

        <div
          className="
            flex
            items-start
            justify-between

            border-b
            border-black/10

            px-6
            py-6

            lg:px-12
            lg:py-10
          "
        >
          <div>
            <p
              className="
                text-[11px]
                uppercase
                tracking-[0.35em]
                text-black/40
              "
            >
              TCC ADMIN
            </p>

            <h2
              className="
                para

                mt-4

                text-5xl

                uppercase

                leading-none
              "
            >
              {title}
            </h2>

            {description && (
              <p className="mt-5 max-w-2xl leading-8 text-black/60">
                {description}
              </p>
            )}
          </div>

          <button
            onClick={onClose}
            className="
              transition

              hover:rotate-90
              hover:text-[#e09225]
            "
          >
            <X size={28} />
          </button>
        </div>

        {/* Content */}

        <div
          className="
            flex-1

            overflow-y-auto

            px-6
            py-10

            lg:px-12
          "
        >
          {children}
        </div>

        {/* Footer */}

        {footer && (
          <div
            className="
              border-t
              border-black/10

              px-6
              py-6

              lg:px-12
            "
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default TCCModal;
