export interface FileEntry {
  name: string;
  path: string;
  is_dir: boolean;
  size: number;
  modified_at: number | null;
  created_at: number | null;
  is_readonly: boolean;
  is_hidden: boolean;
  extension: string | null;
}

export interface FileExplorerError {
  type: string;
  message: string;
}

export interface TreeNodeState {
  children: FileEntry[];
  isLoaded: boolean;
  isLoading: boolean;
  error?: string;
}
