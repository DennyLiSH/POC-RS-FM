mod commands;
mod error;
mod models;

use commands::*;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            grant_directory_access,
            get_directory_entries,
            create_directory,
            delete_entry,
            rename_entry,
            copy_file,
            search_files,
            read_file_content,
            create_file
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
