import { Clock, CheckCircle, AlertCircle } from "lucide-react";

type SourceStatus = "pending" | "processing" | "completed" | "failed";

interface StatusIconProps {
  status: SourceStatus;
}

export const StatusIcon = ({ status }: StatusIconProps) => {
  switch (status) {
    case "processing":
      return <Clock className="h-5 w-5 text-accent animate-spin" />;
    case "completed":
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case "failed":
      return <AlertCircle className="h-5 w-5 text-red-500" />;
    default:
      return <Clock className="h-5 w-5 text-gray-500" />;
  }
};