import { Header } from "@/components/Header";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold">Welcome to Your App</h1>
        <p className="mt-4 text-muted-foreground">
          This is a fresh start with Supabase integration maintained.
        </p>
      </main>
    </div>
  );
};

export default Index;