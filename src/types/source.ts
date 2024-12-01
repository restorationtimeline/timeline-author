export interface Source {
  id: string;
  name: string;
  type: string;
  status: string;
  identifiers?: {
    url?: string;
    category?: string;
  };
}