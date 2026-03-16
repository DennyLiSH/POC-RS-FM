import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'light' | 'dark' | 'system';
export type Language = 'zh-CN' | 'en-US';

interface SettingsState {
  // 全局设置
  theme: Theme;
  language: Language;
  showHiddenFiles: boolean;
  personalIntro: string;

  // 文件夹局部设置 (path -> description)
  folderDescriptions: Record<string, string>;

  // Actions
  setTheme: (theme: Theme) => void;
  setLanguage: (language: Language) => void;
  setShowHiddenFiles: (show: boolean) => void;
  setPersonalIntro: (intro: string) => void;
  setFolderDescription: (path: string, description: string) => void;
  getFolderDescription: (path: string) => string;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      // 默认值
      theme: 'system',
      language: 'zh-CN',
      showHiddenFiles: false,
      personalIntro: '',
      folderDescriptions: {},

      // Actions
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
      setShowHiddenFiles: (showHiddenFiles) => set({ showHiddenFiles }),
      setPersonalIntro: (personalIntro) => set({ personalIntro }),
      setFolderDescription: (path, description) => {
        const { folderDescriptions } = get();
        set({
          folderDescriptions: {
            ...folderDescriptions,
            [path]: description,
          },
        });
      },
      getFolderDescription: (path) => {
        return get().folderDescriptions[path] || '';
      },
    }),
    {
      name: 'test-fm-settings',
    }
  )
);
