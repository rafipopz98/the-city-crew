import { AlertCircle } from "lucide-react";

interface ErrorDisplayProps {
  message: string;
}

export const ErrorDisplay = ({ message }: ErrorDisplayProps) => (
  <div className="flex items-center justify-center p-4 bg-red-500/10 rounded-xl border border-red-500/20">
    <AlertCircle className="w-5 h-5 text-red-400 mr-2 shrink-0" />
    <p className="text-red-400 text-sm">{message}</p>
  </div>
);
