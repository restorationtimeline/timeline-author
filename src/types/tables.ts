import { Json } from './database';
import { CrawlStatusEnum, DocumentStatusEnum, EntityTypeEnum, TaskStatusEnum } from './enums';

export interface CrawlQueueTable {
  Row: {
    id: string;
    url: string;
    domain: string;
    status: CrawlStatusEnum | null;
    parent_url: string | null;
    created_at: string | null;
    started_at: string | null;
    completed_at: string | null;
    error_message: string | null;
    uploaded_by: string | null;
  };
  Insert: {
    id?: string;
    url: string;
    domain: string;
    status?: CrawlStatusEnum | null;
    parent_url?: string | null;
    created_at?: string | null;
    started_at?: string | null;
    completed_at?: string | null;
    error_message?: string | null;
    uploaded_by?: string | null;
  };
  Update: {
    id?: string;
    url?: string;
    domain?: string;
    status?: CrawlStatusEnum | null;
    parent_url?: string | null;
    created_at?: string | null;
    started_at?: string | null;
    completed_at?: string | null;
    error_message?: string | null;
    uploaded_by?: string | null;
  };
}

export interface EntitiesTable {
  Row: {
    id: string;
    source_id: string | null;
    name: string;
    entity_type: EntityTypeEnum;
    context: string | null;
    linked_data: Json | null;
    created_at: string | null;
    last_updated: string | null;
  };
  Insert: {
    id?: string;
    source_id?: string | null;
    name: string;
    entity_type: EntityTypeEnum;
    context?: string | null;
    linked_data?: Json | null;
    created_at?: string | null;
    last_updated?: string | null;
  };
  Update: {
    id?: string;
    source_id?: string | null;
    name?: string;
    entity_type?: EntityTypeEnum;
    context?: string | null;
    linked_data?: Json | null;
    created_at?: string | null;
    last_updated?: string | null;
  };
}

export interface EventsTable {
  Row: {
    id: string;
    title: string;
    date: string | null;
    description: string | null;
    related_sources: string[] | null;
    created_at: string | null;
    last_updated: string | null;
  };
  Insert: {
    id?: string;
    title: string;
    date?: string | null;
    description?: string | null;
    related_sources?: string[] | null;
    created_at?: string | null;
    last_updated?: string | null;
  };
  Update: {
    id?: string;
    title?: string;
    date?: string | null;
    description?: string | null;
    related_sources?: string[] | null;
    created_at?: string | null;
    last_updated?: string | null;
  };
}

export interface ProfilesTable {
  Row: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    created_at: string;
  };
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

export interface SourcesTable {
  Row: {
    id: string;
    name: string;
    status: DocumentStatusEnum | null;
    type: string | null;
    uploaded_by: string | null;
    uploaded_at: string | null;
    last_updated: string | null;
    error_logs: string[] | null;
    identifiers: Json | null;
    created_at: string | null;
    deleted_at: string | null;
    storage_path: string | null;
    metadata: Json | null;
  };
  Insert: {
    id?: string;
    name: string;
    status?: DocumentStatusEnum | null;
    type?: string | null;
    uploaded_by?: string | null;
    uploaded_at?: string | null;
    last_updated?: string | null;
    error_logs?: string[] | null;
    identifiers?: Json | null;
    created_at?: string | null;
    deleted_at?: string | null;
    storage_path?: string | null;
    metadata?: Json | null;
  };
  Update: {
    id?: string;
    name?: string;
    status?: DocumentStatusEnum | null;
    type?: string | null;
    uploaded_by?: string | null;
    uploaded_at?: string | null;
    last_updated?: string | null;
    error_logs?: string[] | null;
    identifiers?: Json | null;
    created_at?: string | null;
    deleted_at?: string | null;
    storage_path?: string | null;
    metadata?: Json | null;
  };
}

export interface TasksTable {
  Row: {
    id: string;
    source_id: string | null;
    task_name: string;
    status: TaskStatusEnum | null;
    started_at: string | null;
    completed_at: string | null;
    created_at: string | null;
    last_updated: string | null;
  };
  Insert: {
    id?: string;
    source_id?: string | null;
    task_name: string;
    status?: TaskStatusEnum | null;
    started_at?: string | null;
    completed_at?: string | null;
    created_at?: string | null;
    last_updated?: string | null;
  };
  Update: {
    id?: string;
    source_id?: string | null;
    task_name?: string;
    status?: TaskStatusEnum | null;
    started_at?: string | null;
    completed_at?: string | null;
    created_at?: string | null;
    last_updated?: string | null;
  };
}