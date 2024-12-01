import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { Clock } from "lucide-react";
import { StatusIcon } from "@/components/document-list/StatusIcon";

const CrawlQueue = () => {
  const { data: queueItems, isLoading } = useQuery({
    queryKey: ["crawl-queue"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("crawl_queue")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center">
            <Clock className="h-6 w-6 animate-spin text-primary" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold mb-6">Crawl Queue</h1>
        <div className="bg-card rounded-lg border shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>URL</TableHead>
                <TableHead>Domain</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Parent URL</TableHead>
                <TableHead>Created At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {queueItems?.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium max-w-md truncate">
                    {item.url}
                  </TableCell>
                  <TableCell>{item.domain}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <StatusIcon status={item.status} />
                      <span className="capitalize">{item.status}</span>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-md truncate">
                    {item.parent_url || "-"}
                  </TableCell>
                  <TableCell>
                    {new Date(item.created_at).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default CrawlQueue;