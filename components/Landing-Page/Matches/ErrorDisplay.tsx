import { AlertCircle } from "lucide-react";

interface ErrorDisplayProps {
  message: string;
}

export const ErrorDisplay = ({ message }: ErrorDisplayProps) => (
  <div className="flex items-center justify-center py-12">
    <div className="flex items-center gap-2 text-[#ece1cf]/40">
      <AlertCircle className="w-4 h-4" />
      <p className="text-sm uppercase tracking-wider">{message}</p>
    </div>
  </div>
);
