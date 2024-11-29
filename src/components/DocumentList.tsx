import { FileText, Clock, CheckCircle, AlertCircle } from "lucide-react";

type Document = {
  id: string;
  name: string;
  status: "processing" | "completed" | "error";
  type: string;
  uploadedAt: string;
};

const documents: Document[] = [
  {
    id: "1",
    name: "Journal Entry 1832",
    status: "completed",
    type: "Journal",
    uploadedAt: "2024-02-20",
  },
  {
    id: "2",
    name: "Letter Collection 1835",
    status: "processing",
    type: "Correspondence",
    uploadedAt: "2024-02-21",
  },
];

const StatusIcon = ({ status }: { status: Document["status"] }) => {
  switch (status) {
    case "processing":
      return <Clock className="h-5 w-5 text-accent" />;
    case "completed":
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case "error":
      return <AlertCircle className="h-5 w-5 text-red-500" />;
  }
};

export const DocumentList = () => {
  return (
    <div className="w-full space-y-4">
      {documents.map((doc) => (
        <div
          key={doc.id}
          className="p-4 bg-white rounded-lg shadow-sm border animate-fade-up hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="h-6 w-6 text-primary" />
              <div>
                <h3 className="font-medium text-gray-900">{doc.name}</h3>
                <p className="text-sm text-gray-500">
                  {doc.type} • Uploaded on {doc.uploadedAt}
                </p>
              </div>
            </div>
            <StatusIcon status={doc.status} />
          </div>
        </div>
      ))}
    </div>
  );
};