use crate::error::{FileExplorerError, Result};
use crate::models::FileEntry;
use std::fs;
use std::path::Path;
use tauri::AppHandle;
use tauri_plugin_fs::FsExt;

#[tauri::command]
pub fn grant_directory_access(app: AppHandle, path: String) -> Result<()> {
    let dir_path = Path::new(&path);

    if !dir_path.exists() {
        return Err(FileExplorerError::PathNotFound(path));
    }

    if !dir_path.is_dir() {
        return Err(FileExplorerError::InvalidPath(format!("{} is not a directory", path)));
    }

    // Grant access to the directory and all subdirectories
    let scope = app.fs_scope();
    scope.allow_directory(&path, true).map_err(|e| {
        FileExplorerError::InvalidPath(format!("Failed to grant access: {}", e))
    })?;

    Ok(())
}

#[tauri::command]
pub fn get_directory_entries(path: String) -> Result<Vec<FileEntry>> {
    let dir_path = Path::new(&path);

    if !dir_path.exists() {
        return Err(FileExplorerError::PathNotFound(path));
    }

    if !dir_path.is_dir() {
        return Err(FileExplorerError::InvalidPath(format!("{} is not a directory", path)));
    }

    let entries: Vec<FileEntry> = fs::read_dir(dir_path)
        .map_err(|e| FileExplorerError::from(e))?
        .filter_map(|entry| entry.ok())
        .filter_map(|entry| FileEntry::from_path(&entry.path()))
        .collect();

    // Sort: directories first, then by name
    let mut entries = entries;
    entries.sort_by(|a, b| {
        if a.is_dir == b.is_dir {
            a.name.to_lowercase().cmp(&b.name.to_lowercase())
        } else if a.is_dir {
            std::cmp::Ordering::Less
        } else {
            std::cmp::Ordering::Greater
        }
    });

    Ok(entries)
}

#[tauri::command]
pub fn create_directory(path: String) -> Result<()> {
    let dir_path = Path::new(&path);

    if dir_path.exists() {
        return Err(FileExplorerError::AlreadyExists(path));
    }

    fs::create_dir_all(dir_path)?;
    Ok(())
}

#[tauri::command]
pub fn delete_entry(path: String, recursive: bool) -> Result<()> {
    let entry_path = Path::new(&path);

    if !entry_path.exists() {
        return Err(FileExplorerError::PathNotFound(path));
    }

    if entry_path.is_dir() {
        if recursive {
            fs::remove_dir_all(entry_path)?;
        } else {
            fs::remove_dir(entry_path).map_err(|e| {
                if e.kind() == std::io::ErrorKind::DirectoryNotEmpty {
                    FileExplorerError::NotEmpty(path)
                } else {
                    FileExplorerError::from(e)
                }
            })?;
        }
    } else {
        fs::remove_file(entry_path)?;
    }

    Ok(())
}

#[tauri::command]
pub fn rename_entry(old_path: String, new_name: String) -> Result<()> {
    let old = Path::new(&old_path);

    if !old.exists() {
        return Err(FileExplorerError::PathNotFound(old_path));
    }

    let parent = old.parent().ok_or_else(|| {
        FileExplorerError::InvalidPath("Cannot rename root directory".to_string())
    })?;

    let new = parent.join(&new_name);

    if new.exists() {
        return Err(FileExplorerError::AlreadyExists(new_name));
    }

    fs::rename(old, new)?;
    Ok(())
}

#[tauri::command]
pub fn copy_file(source: String, dest: String) -> Result<()> {
    let src_path = Path::new(&source);
    let dest_path = Path::new(&dest);

    if !src_path.exists() {
        return Err(FileExplorerError::PathNotFound(source));
    }

    if src_path.is_dir() {
        return Err(FileExplorerError::InvalidPath("Source must be a file, not a directory".to_string()));
    }

    fs::copy(src_path, dest_path)?;
    Ok(())
}

#[tauri::command]
pub fn read_file_content(path: String) -> Result<String> {
    let file_path = Path::new(&path);

    if !file_path.exists() {
        return Err(FileExplorerError::PathNotFound(path));
    }

    if file_path.is_dir() {
        return Err(FileExplorerError::InvalidPath("Cannot read directory".to_string()));
    }

    let content = fs::read_to_string(file_path)?;
    Ok(content)
}

#[tauri::command]
pub fn create_file(path: String) -> Result<()> {
    let file_path = Path::new(&path);

    if file_path.exists() {
        return Err(FileExplorerError::AlreadyExists(path));
    }

    fs::File::create(file_path)?;
    Ok(())
}

#[tauri::command]
pub fn search_files(directory: String, query: String) -> Result<Vec<FileEntry>> {
    let dir_path = Path::new(&directory);

    if !dir_path.exists() {
        return Err(FileExplorerError::PathNotFound(directory));
    }

    let query_lower = query.to_lowercase();
    let mut results = Vec::new();

    fn search_recursive(dir: &Path, query: &str, results: &mut Vec<FileEntry>) {
        if let Ok(entries) = fs::read_dir(dir) {
            for entry in entries.filter_map(|e| e.ok()) {
                let path = entry.path();
                let name = path.file_name()
                    .map(|n| n.to_string_lossy().to_lowercase())
                    .unwrap_or_default();

                if name.contains(query) {
                    if let Some(file_entry) = FileEntry::from_path(&path) {
                        results.push(file_entry);
                    }
                }

                // Only search one level deep for performance
                if path.is_dir() && results.len() < 1000 {
                    search_recursive(&path, query, results);
                }
            }
        }
    }

    search_recursive(dir_path, &query_lower, &mut results);

    // Sort results
    results.sort_by(|a, b| {
        if a.is_dir == b.is_dir {
            a.name.to_lowercase().cmp(&b.name.to_lowercase())
        } else if a.is_dir {
            std::cmp::Ordering::Less
        } else {
            std::cmp::Ordering::Greater
        }
    });

    Ok(results)
}
