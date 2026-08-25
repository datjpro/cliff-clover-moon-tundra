// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    std::panic::set_hook(Box::new(|info| {
        let msg = format!("PANIC: {:?}\nLocation: {:?}", info.payload().downcast_ref::<&str>(), info.location());
        let _ = std::fs::write("tauri_panic.log", msg.clone());
        let _ = std::fs::write("D:\\Demo\\cliff-clover-moon-tundra\\tauri_panic.log", msg);
    }));
    lumen_lib::run();
}
