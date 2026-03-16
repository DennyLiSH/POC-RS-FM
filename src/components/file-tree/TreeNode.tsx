import { useEffect, useState } from 'react';
import { useFileTreeStore } from '@/stores/fileTreeStore';
import { useBookmarkStore } from '@/stores/bookmarkStore';
import type { FileEntry } from '@/types/file';
import { formatFileSize, formatDate, getFileIcon } from '@/lib/format';
import { cn } from '@/lib/utils';
import { TreeNodeContextMenu } from './TreeNodeContextMenu';
import {
  NewFolderDialog,
  RenameDialog,
  DeleteConfirmDialog,
} from '@/components/dialogs';

interface TreeNodeProps {
  entry: FileEntry;
  depth: number;
}

export function TreeNode({ entry, depth }: TreeNodeProps) {
  const {
    expandedNodes,
    selectedNode,
    nodeCache,
    rootPath,
    toggleNode,
    selectNode,
    loadNodeChildren,
    refreshNode,
    loadRootEntries,
  } = useFileTreeStore();

  const { addBookmark } = useBookmarkStore();

  const isExpanded = expandedNodes.has(entry.path);
  const isSelected = selectedNode === entry.path;
  const nodeState = nodeCache.get(entry.path);
  const children = nodeState?.children || [];
  const isLoading = nodeState?.isLoading;

  // Dialog states
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    // Load children when node is expanded for the first time
    if (isExpanded && entry.is_dir && !nodeState?.isLoaded && !isLoading) {
      loadNodeChildren(entry.path);
    }
  }, [isExpanded, entry.is_dir, entry.path, nodeState?.isLoaded, isLoading, loadNodeChildren]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    selectNode(entry.path);

    if (entry.is_dir) {
      toggleNode(entry.path);
    }
  };

  const handleRefresh = () => {
    if (entry.path === rootPath) {
      loadRootEntries();
    } else {
      refreshNode(entry.path);
    }
  };

  const handleAddBookmark = () => {
    addBookmark(entry.name, entry.path);
  };

  const icon = getFileIcon(entry);

  // Node content to be wrapped by context menu
  const nodeContent = (
    <div
      className={cn(
        'flex items-center gap-1 px-2 py-1 cursor-pointer rounded hover:bg-accent',
        isSelected && 'bg-accent',
      )}
      style={{ paddingLeft: `${depth * 16 + 8}px` }}
      onClick={handleClick}
    >
      {/* Expand/Collapse Arrow */}
      {entry.is_dir && (
        <span className={cn('w-4 h-4 flex items-center justify-center text-xs transition-transform', isExpanded && 'rotate-90')}>
          ▶
        </span>
      )}
      {!entry.is_dir && <span className="w-4" />}

      {/* Icon */}
      <span className="text-base">{icon}</span>

      {/* Name */}
      <span className="flex-1 truncate text-sm">{entry.name}</span>

      {/* Size (for files) */}
      {!entry.is_dir && (
        <span className="text-xs text-muted-foreground w-20 text-right">
          {formatFileSize(entry.size)}
        </span>
      )}

      {/* Modified date */}
      <span className="text-xs text-muted-foreground w-32 text-right hidden md:block">
        {formatDate(entry.modified_at)}
      </span>
    </div>
  );

  return (
    <div className="select-none">
      <TreeNodeContextMenu
        entry={entry}
        onRefresh={handleRefresh}
        onRename={() => setShowRenameDialog(true)}
        onDelete={() => setShowDeleteDialog(true)}
        onNewFolder={() => setShowNewFolderDialog(true)}
        onAddBookmark={handleAddBookmark}
      >
        {nodeContent}
      </TreeNodeContextMenu>

      {/* Children */}
      {isExpanded && entry.is_dir && (
        <div>
          {isLoading ? (
            <div className="px-2 py-1 text-sm text-muted-foreground" style={{ paddingLeft: `${(depth + 1) * 16 + 8}px` }}>
              加载中...
            </div>
          ) : (
            children.map((child) => (
              <TreeNode key={child.path} entry={child} depth={depth + 1} />
            ))
          )}
        </div>
      )}

      {/* Dialogs */}
      <NewFolderDialog
        open={showNewFolderDialog}
        onOpenChange={setShowNewFolderDialog}
        parentPath={entry.path}
        onSuccess={handleRefresh}
      />
      <RenameDialog
        open={showRenameDialog}
        onOpenChange={setShowRenameDialog}
        entryPath={entry.path}
        currentName={entry.name}
        onSuccess={handleRefresh}
      />
      <DeleteConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        entryPath={entry.path}
        entryName={entry.name}
        isDir={entry.is_dir}
        onSuccess={handleRefresh}
      />
    </div>
  );
}
