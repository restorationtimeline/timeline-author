type DocumentStatus = "pending" | "processing" | "completed" | "failed";

interface StatusIconProps {
  status: DocumentStatus;
}

export const StatusIcon = ({ status }: StatusIconProps) => {
  const getStatusColor = () => {
    switch (status) {
      case "processing":
        return "text-accent";
      case "completed":
        return "text-green-500";
      case "failed":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  return (
    <div className={`h-3 w-3 rounded-full ${getStatusColor()}`} />
  );
};