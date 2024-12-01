import { CrawlQueueTable, EntitiesTable, EventsTable, ProfilesTable, SourcesTable, TasksTable } from './tables';
import { DatabaseFunctions } from './functions';
import { DatabaseEnums } from './enums';

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      crawl_queue: CrawlQueueTable;
      entities: EntitiesTable;
      events: EventsTable;
      profiles: ProfilesTable;
      sources: SourcesTable;
      tasks: TasksTable;
    };
    Views: Record<string, never>;
    Functions: DatabaseFunctions;
    Enums: DatabaseEnums;
    CompositeTypes: Record<string, never>;
  };
}