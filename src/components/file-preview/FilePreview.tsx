import { FileText } from 'lucide-react';
import { useFileTreeStore } from '@/stores/fileTreeStore';
import { TxtPreview } from './TxtPreview';

export function FilePreview() {
  const { previewFile, previewContent, isLoadingPreview, previewError } = useFileTreeStore();

  if (!previewFile) {
    return (
      <div className="flex flex-col h-full">
        <div className="px-4 py-2 border-b">
          <h2 className="text-sm font-medium">文件预览</h2>
        </div>
        <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
          选择文件以预览内容
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-2 border-b flex items-center gap-2">
        <FileText className="w-4 h-4" />
        <span className="text-sm font-medium truncate">{previewFile.name}</span>
      </div>
      <div className="flex-1 overflow-hidden">
        <TxtPreview
          content={previewContent}
          isLoading={isLoadingPreview}
          error={previewError}
        />
      </div>
    </div>
  );
}
