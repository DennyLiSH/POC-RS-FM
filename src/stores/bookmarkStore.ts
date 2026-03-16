import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Bookmark {
  id: string;
  name: string;
  path: string;
  createdAt: number;
}

interface BookmarkState {
  bookmarks: Bookmark[];
  addBookmark: (name: string, path: string) => void;
  removeBookmark: (id: string) => void;
  isBookmarked: (path: string) => boolean;
}

export const useBookmarkStore = create<BookmarkState>()(
  persist(
    (set, get) => ({
      bookmarks: [],

      addBookmark: (name, path) => {
        const { bookmarks } = get();
        // Check if already bookmarked
        if (bookmarks.some((b) => b.path === path)) {
          return;
        }
        const newBookmark: Bookmark = {
          id: crypto.randomUUID(),
          name,
          path,
          createdAt: Date.now(),
        };
        set({ bookmarks: [...bookmarks, newBookmark] });
      },

      removeBookmark: (id) => {
        const { bookmarks } = get();
        set({ bookmarks: bookmarks.filter((b) => b.id !== id) });
      },

      isBookmarked: (path) => {
        return get().bookmarks.some((b) => b.path === path);
      },
    }),
    {
      name: 'test-fm-bookmarks',
    }
  )
);
