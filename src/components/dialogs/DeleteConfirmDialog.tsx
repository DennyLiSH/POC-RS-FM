import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { fileService } from '@/services/fileService';
import { toast } from 'sonner';

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entryPath: string;
  entryName: string;
  isDir: boolean;
  onSuccess: () => void;
}

export function DeleteConfirmDialog({
  open,
  onOpenChange,
  entryPath,
  entryName,
  isDir,
  onSuccess,
}: DeleteConfirmDialogProps) {
  const handleDelete = async () => {
    try {
      await fileService.deleteEntry(entryPath, isDir);
      toast.success('删除成功');
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      toast.error(`删除失败: ${err}`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>确认删除</DialogTitle>
          <DialogDescription>
            确定要删除 "{entryName}" 吗？
            {isDir && ' 文件夹内所有内容也将被删除。'}
            此操作无法撤销。
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            取消
          </Button>
          <Button type="button" variant="destructive" onClick={handleDelete}>
            删除
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
