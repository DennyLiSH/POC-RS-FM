import { useEffect, useRef } from 'react';
import { FileTree } from '@/components/file-tree';
import { FileBrowser } from '@/components/file-browser';
import { FilePreview } from '@/components/file-preview';
import { ChatHistory, ChatInput } from '@/components/chat';
import { SearchBar } from '@/components/search/SearchBar';
import { TitleBar } from '@/components/TitleBar';
import { BookmarkList } from '@/components/bookmarks';
import { ResizablePanel } from '@/components/ui/resizable-panel';
import { useFileTreeStore } from '@/stores/fileTreeStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useBookmarkStore } from '@/stores/bookmarkStore';
import { useChatStore } from '@/stores/chatStore';
import { fileService } from '@/services/fileService';
import { detectLegacyData, executeMigration } from '@/utils/migration';
import { Toaster } from '@/components/ui/sonner';
import { Star, FolderTree, MessageSquare } from 'lucide-react';

function App() {
  const { setRootPath, loadRootEntries } = useFileTreeStore();
  const { initialize: initSettings } = useSettingsStore();
  const { initialize: initBookmarks } = useBookmarkStore();
  const { initialize: initChat } = useChatStore();
  const initRef = useRef(false);

  useEffect(() => {
    // Prevent double execution in React StrictMode
    if (initRef.current) return;
    initRef.current = true;

    const initializeApp = async () => {
      // 1. Check and migrate legacy data
      const legacyData = detectLegacyData();
      if (legacyData) {
        console.log('Detected legacy data, migrating...');
        await executeMigration(legacyData);
      }

      // 2. Initialize all stores (load from backend)
      await Promise.all([initSettings(), initBookmarks(), initChat()]);

      // 3. Prompt user to select a folder
      const path = await fileService.selectAndGrantDirectory();
      if (path) {
        setRootPath(path);
        loadRootEntries();
      }
    };

    initializeApp();
  }, [setRootPath, loadRootEntries, initSettings, initBookmarks, initChat]);

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Custom Title Bar */}
      <TitleBar />

      {/* Main Layout - 3 columns resizable */}
      <div className="flex flex-1 overflow-hidden">
        <ResizablePanel
          direction="horizontal"
          storageKey="file-explorer-main-ratio"
          defaultRatio={0.2}
          minSize={0.1}
          maxSize={0.4}
        >
          {/* Left Sidebar - Bookmarks + File Tree */}
          <aside className="h-full border-r flex flex-col bg-muted/30">
            <ResizablePanel
              direction="vertical"
              storageKey="file-explorer-sidebar-ratio"
              defaultRatio={0.4}
            >
              {/* Bookmarks Section */}
              <div className="flex flex-col h-full overflow-hidden">
                <div className="flex items-center gap-2 px-3 py-2 border-b">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm font-medium">收藏夹</span>
                </div>
                <div className="flex-1 overflow-auto">
                  <BookmarkList />
                </div>
              </div>

              {/* File Tree Section */}
              <div className="flex flex-col h-full overflow-hidden">
                <div className="flex items-center gap-2 px-3 py-2 border-b">
                  <FolderTree className="w-4 h-4" />
                  <span className="text-sm font-medium">文件树</span>
                </div>
                <div className="flex-1 overflow-hidden">
                  <FileTree />
                </div>
              </div>
            </ResizablePanel>
          </aside>

          {/* Center + Right Panels */}
          <ResizablePanel
            direction="horizontal"
            storageKey="file-explorer-center-right-ratio"
            defaultRatio={0.6}
            minSize={0.3}
            maxSize={0.8}
          >
            {/* Center Panel - Chat Area */}
            <main className="h-full border-r flex flex-col">
              <header className="flex items-center justify-between px-4 py-2 border-b">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  <h1 className="text-lg font-semibold">对话</h1>
                </div>
                <SearchBar />
              </header>
              {/* Chat: History + Input */}
              <div className="flex-1 flex flex-col overflow-hidden">
                <ChatHistory />
                <ChatInput />
              </div>
            </main>

            {/* Right Panel - File Browser + Preview */}
            <aside className="h-full flex flex-col min-w-[200px]">
              <ResizablePanel
                direction="vertical"
                storageKey="file-explorer-right-ratio"
                defaultRatio={0.5}
                minSize={0.2}
                maxSize={0.8}
              >
                <FileBrowser />
                <FilePreview />
              </ResizablePanel>
            </aside>
          </ResizablePanel>
        </ResizablePanel>
      </div>

      {/* Toast notifications */}
      <Toaster />
    </div>
  );
}

export default App;
