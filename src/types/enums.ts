export type CrawlStatusEnum = 'pending' | 'processing' | 'completed' | 'failed';
export type DocumentStatusEnum = 'pending' | 'processing' | 'completed' | 'failed';
export type EntityTypeEnum = 'person' | 'location' | 'date' | 'organization' | 'artifact' | 'citation' | 'factual_claim';
export type TaskStatusEnum = 'pending' | 'in_progress' | 'completed' | 'failed';

export interface DatabaseEnums {
  crawl_status_enum: CrawlStatusEnum;
  document_status_enum: DocumentStatusEnum;
  entity_type_enum: EntityTypeEnum;
  log_level_enum: 'info' | 'warning' | 'error' | 'debug';
  source_type_enum: 'pdf' | 'epub' | 'url' | 'youtube' | 'wikipedia' | 'google_books' | 'google_scholar' | 'internet_archive' | 'family_search' | 'ancestry';
  status_enum: 'pending' | 'processing' | 'completed' | 'failed';
  task_status_enum: TaskStatusEnum;
}