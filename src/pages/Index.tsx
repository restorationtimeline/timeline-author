import { Header } from "@/components/Header";
import { SourceInputForm } from "@/components/source-input/SourceInputForm";
import { SourcesTable } from "@/components/source-list/SourcesTable";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 space-y-6">
        <SourceInputForm />
        <SourcesTable />
      </main>
    </div>
  );
};

export default Index;