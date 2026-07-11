interface ExpandableRowProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

export const ExpandableRow = ({
  title,
  isOpen,
  onToggle,
  children,
}: ExpandableRowProps) => (
  <>
    <div
      onClick={onToggle}
      className="w-full border-t border-b border-[#ece1cf]/10 py-6 flex justify-between items-center cursor-pointer group"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onToggle();
        }
      }}
      aria-expanded={isOpen}
    >
      <h2 className="text-[8vw] sm:text-[5vw] lg:text-[3rem] font-extrabold uppercase text-[#ece1cf] group-hover:text-[#ece1cf] transition-all">
        {title}
      </h2>
      <span
        className={`text-3xl text-[#ece1cf] transition-transform duration-300 ${
          isOpen ? "rotate-90" : ""
        }`}
        aria-hidden="true"
      >
        →
      </span>
    </div>

    <div
      className={`transition-all duration-500 overflow-hidden ${
        isOpen ? "max-h-500 py-8" : "max-h-0"
      }`}
    >
      {children}
    </div>
  </>
);
