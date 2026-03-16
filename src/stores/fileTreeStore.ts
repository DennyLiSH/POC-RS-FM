import { create } from 'zustand';
import { fileService } from '@/services/fileService';
import type { FileEntry, TreeNodeState } from '@/types/file';

interface FileTreeState {
  // State
  rootPath: string | null;
  rootEntries: FileEntry[];
  expandedNodes: Set<string>;
  selectedNode: string | null;
  nodeCache: Map<string, TreeNodeState>;
  searchQuery: string;
  searchResults: FileEntry[];
  isSearching: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  setRootPath: (path: string | null) => void;
  setExpanded: (path: string, expanded: boolean) => void;
  toggleNode: (path: string) => void;
  selectNode: (path: string | null) => void;
  loadNodeChildren: (path: string) => Promise<void>;
  loadRootEntries: () => Promise<void>;
  setSearchQuery: (query: string) => void;
  search: (query: string) => Promise<void>;
  refreshNode: (path: string) => Promise<void>;
  clearError: () => void;
}

export const useFileTreeStore = create<FileTreeState>((set, get) => ({
  // Initial state
  rootPath: null,
  rootEntries: [],
  expandedNodes: new Set(),
  selectedNode: null,
  nodeCache: new Map(),
  searchQuery: '',
  searchResults: [],
  isSearching: false,
  isLoading: false,
  error: null,

  // Actions
  setRootPath: (path) => set({ rootPath: path }),

  setExpanded: (path, expanded) => {
    const { expandedNodes } = get();
    const newExpanded = new Set(expandedNodes);
    if (expanded) {
      newExpanded.add(path);
    } else {
      newExpanded.delete(path);
    }
    set({ expandedNodes: newExpanded });
  },

  toggleNode: (path) => {
    const { expandedNodes } = get();
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    set({ expandedNodes: newExpanded });
  },

  selectNode: (path) => set({ selectedNode: path }),

  loadNodeChildren: async (path) => {
    const { nodeCache } = get();
    const cached = nodeCache.get(path);

    // Skip if already loading
    if (cached?.isLoading) return;

    // Update cache to show loading state
    const newCache = new Map(nodeCache);
    newCache.set(path, {
      children: cached?.children || [],
      isLoaded: cached?.isLoaded || false,
      isLoading: true,
    });
    set({ nodeCache: newCache });

    try {
      const children = await fileService.getDirectoryEntries(path);
      const newCache = new Map(get().nodeCache);
      newCache.set(path, {
        children,
        isLoaded: true,
        isLoading: false,
      });
      set({ nodeCache: newCache, error: null });
    } catch (err) {
      const newCache = new Map(get().nodeCache);
      newCache.set(path, {
        children: [],
        isLoaded: false,
        isLoading: false,
        error: String(err),
      });
      set({ nodeCache: newCache, error: String(err) });
    }
  },

  loadRootEntries: async () => {
    const { rootPath } = get();
    if (!rootPath) return;

    set({ isLoading: true, error: null });
    try {
      const entries = await fileService.getDirectoryEntries(rootPath);
      set({ rootEntries: entries, isLoading: false });
    } catch (err) {
      set({ error: String(err), isLoading: false });
    }
  },

  setSearchQuery: (query) => set({ searchQuery: query }),

  search: async (query) => {
    const { rootPath } = get();
    if (!rootPath || !query.trim()) {
      set({ searchResults: [], isSearching: false });
      return;
    }

    set({ isSearching: true, searchQuery: query });
    try {
      const results = await fileService.searchFiles(rootPath, query);
      set({ searchResults: results, isSearching: false });
    } catch (err) {
      set({ searchResults: [], isSearching: false, error: String(err) });
    }
  },

  refreshNode: async (path) => {
    const { rootPath, nodeCache } = get();

    // If refreshing root
    if (path === rootPath) {
      await get().loadRootEntries();
      return;
    }

    // Refresh specific node
    const newCache = new Map(nodeCache);
    newCache.set(path, {
      children: [],
      isLoaded: false,
      isLoading: false,
    });
    set({ nodeCache: newCache });
    await get().loadNodeChildren(path);
  },

  clearError: () => set({ error: null }),
}));
