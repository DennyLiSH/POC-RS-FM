import { invoke } from '@tauri-apps/api/core';
import type { FileEntry } from '@/types/file';

export const fileService = {
  async getDirectoryEntries(path: string): Promise<FileEntry[]> {
    return invoke('get_directory_entries', { path });
  },

  async createDirectory(path: string): Promise<void> {
    return invoke('create_directory', { path });
  },

  async deleteEntry(path: string, recursive: boolean = false): Promise<void> {
    return invoke('delete_entry', { path, recursive });
  },

  async renameEntry(oldPath: string, newName: string): Promise<void> {
    return invoke('rename_entry', { oldPath, newName });
  },

  async copyFile(source: string, dest: string): Promise<void> {
    return invoke('copy_file', { source, dest });
  },

  async searchFiles(directory: string, query: string): Promise<FileEntry[]> {
    return invoke('search_files', { directory, query });
  },

  async grantDirectoryAccess(path: string): Promise<void> {
    return invoke('grant_directory_access', { path });
  },

  async selectDirectory(): Promise<string | null> {
    // Use Tauri dialog plugin dynamically
    const { open } = await import('@tauri-apps/plugin-dialog');
    const result = await open({
      directory: true,
      multiple: false,
      title: '选择文件夹',
    });
    return result as string | null;
  },

  async selectAndGrantDirectory(): Promise<string | null> {
    const path = await this.selectDirectory();
    if (path) {
      await this.grantDirectoryAccess(path);
    }
    return path;
  },
};
