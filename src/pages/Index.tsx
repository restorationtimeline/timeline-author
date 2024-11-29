import { DocumentUpload } from "@/components/DocumentUpload";
import { DocumentList } from "@/components/DocumentList";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-primary">
              Restoration Timeline Documents
            </h1>
            <p className="mt-2 text-lg text-gray-600">
              Upload and manage historical documents for research and analysis
            </p>
          </div>
          
          <DocumentUpload />
          
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Recent Documents
            </h2>
            <DocumentList />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;