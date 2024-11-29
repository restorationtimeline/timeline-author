interface ErrorLogsProps {
  errors: string[];
}

export const ErrorLogs = ({ errors }: ErrorLogsProps) => {
  if (!errors || errors.length === 0) return null;

  return (
    <div className="mt-6 p-4 bg-red-50 rounded-lg">
      <h3 className="text-red-800 font-medium mb-2">Error Logs</h3>
      <ul className="list-disc list-inside space-y-1">
        {errors.map((error, index) => (
          <li key={index} className="text-red-600 text-sm">{error}</li>
        ))}
      </ul>
    </div>
  );
};