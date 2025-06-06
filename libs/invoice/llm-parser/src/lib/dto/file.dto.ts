export interface FileDto {
  id: string;
  created_at: string;
  user_id: string;
  name: string;
  size_bytes: number;
  mime_type: string;
  job_id: string;
  path: string;
}
