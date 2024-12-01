import { Json } from './database';

export interface Source {
  id: string;
  name: string;
  type: string;
  status: "pending" | "processing" | "completed" | "failed";
  identifiers: {
    url?: string;
    category?: string;
  };
  created_at?: string;
  deleted_at?: string;
  error_logs?: string[];
  last_updated?: string;
  storage_path?: string;
  uploaded_at?: string;
  uploaded_by?: string;
  metadata?: Json;
}