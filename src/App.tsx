import { useEffect } from 'react';
import { FileTree } from '@/components/file-tree';
import { SearchBar } from '@/components/search/SearchBar';
import { TitleBar } from '@/components/TitleBar';
import { BookmarkList } from '@/components/bookmarks';
import { useFileTreeStore } from '@/stores/fileTreeStore';
import { fileService } from '@/services/fileService';
import { Toaster } from '@/components/ui/sonner';
import { Star } from 'lucide-react';

function App() {
  const { setRootPath, loadRootEntries } = useFileTreeStore();

  useEffect(() => {
    // Prompt user to select a folder on startup
    const initFolder = async () => {
      const path = await fileService.selectAndGrantDirectory();
      if (path) {
        setRootPath(path);
        loadRootEntries();
      }
    };
    initFolder();
  }, [setRootPath, loadRootEntries]);

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Custom Title Bar */}
      <TitleBar />

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-56 border-r flex flex-col bg-muted/30">
          {/* Sidebar Header */}
          <div className="flex items-center gap-2 px-3 py-2 border-b">
            <Star className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-medium">收藏夹</span>
          </div>

          {/* Bookmarks */}
          <div className="flex-1 overflow-auto">
            <BookmarkList />
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="flex items-center justify-between px-4 py-2 border-b">
            <h1 className="text-lg font-semibold">文件浏览器</h1>
            <SearchBar />
          </header>

          {/* File Tree */}
          <div className="flex-1 overflow-hidden">
            <FileTree />
          </div>
        </main>
      </div>

      {/* Toast notifications */}
      <Toaster />
    </div>
  );
}

export default App;
