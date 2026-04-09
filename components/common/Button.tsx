import { CircleLoading } from "./loading";

export const Button = ({
  children,
  className = "",
  loading = false,
  disabled = false,
  onClick,
  type = "button",
}: {
  children: React.ReactNode;
  className?: string;
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  type?: "button" | "submit" | "reset" | undefined;
}) => {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`${className} rounded-2xl py-4 cursor-pointer text-[#FFF5E5] bg-[#e09225] disabled:bg-opacity-80`}
      onClick={onClick}
    >
      {loading ? (
        <div className="mx-auto h-6 w-6 ">
          <CircleLoading />
        </div>
      ) : (
        children
      )}
    </button>
  );
};
