export interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  created_at: string;
}

export interface ProfilesTable {
  Row: Profile;
  Insert: {
    id: string;
    first_name?: string | null;
    last_name?: string | null;
    created_at?: string;
  };
  Update: {
    id?: string;
    first_name?: string | null;
    last_name?: string | null;
    created_at?: string;
  };
}