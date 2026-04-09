export interface GlassInputWrapperProps {
  children: React.ReactNode;
  error?: boolean;
  disabled?: boolean;
}

export const GlassInputWrapper = ({
  children,
  error,
  disabled = false,
}: GlassInputWrapperProps) => (
  <div
    className={`
      relative backdrop-blur-sm border rounded-2xl transition-all duration-200
      ${
        disabled
          ? "bg-[#06182e]/5 text-black placeholder:text-black border-[#06182e]/10 opacity-50 cursor-not-allowed"
          : "bg-white/40 border-[#06182e]/10 hover:border-[#06182e]/40 focus-within:border-[#e09225]"
      }
      ${error ? "border-red-500 bg-red-500/5" : ""}
    `}
  >
    {children}
  </div>
);
