import { getCurrentWindow } from '@tauri-apps/api/window';
import { Minus, Square, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function TitleBar() {
  const handleMinimize = () => {
    getCurrentWindow().minimize();
  };

  const handleMaximize = () => {
    getCurrentWindow().toggleMaximize();
  };

  const handleClose = () => {
    getCurrentWindow().close();
  };

  return (
    <div
      data-tauri-drag-region
      className="flex items-center justify-between h-8 bg-background border-b select-none"
    >
      {/* App Title */}
      <div className="flex items-center px-3">
        <span className="text-sm font-medium">Test_FM</span>
      </div>

      {/* Window Controls */}
      <div className="flex items-center">
        <button
          onClick={handleMinimize}
          className={cn(
            "flex items-center justify-center w-11 h-8",
            "hover:bg-muted transition-colors"
          )}
          aria-label="Minimize"
        >
          <Minus className="w-4 h-4" />
        </button>
        <button
          onClick={handleMaximize}
          className={cn(
            "flex items-center justify-center w-11 h-8",
            "hover:bg-muted transition-colors"
          )}
          aria-label="Maximize"
        >
          <Square className="w-3 h-3" />
        </button>
        <button
          onClick={handleClose}
          className={cn(
            "flex items-center justify-center w-11 h-8",
            "hover:bg-destructive hover:text-destructive-foreground transition-colors"
          )}
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
