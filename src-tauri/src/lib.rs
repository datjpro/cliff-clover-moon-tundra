use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    Emitter, Manager, Runtime,
};

#[tauri::command]
fn set_ignore_cursor_events<R: Runtime>(window: tauri::WebviewWindow<R>, ignore: bool) -> Result<(), String> {
    window
        .set_ignore_cursor_events(ignore)
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn show_window<R: Runtime>(window: tauri::WebviewWindow<R>) -> Result<(), String> {
    if window.is_minimized().unwrap_or(false) {
        let _ = window.unminimize();
    }
    window.show().map_err(|e| e.to_string())?;
    window.set_focus().map_err(|e| e.to_string())
}

#[tauri::command]
fn hide_window<R: Runtime>(window: tauri::WebviewWindow<R>) -> Result<(), String> {
    window.hide().map_err(|e| e.to_string())
}

#[tauri::command]
fn toggle_window<R: Runtime>(window: tauri::WebviewWindow<R>) -> Result<(), String> {
    let is_minimized = window.is_minimized().unwrap_or(false);
    let is_visible = window.is_visible().unwrap_or(true);
    if is_visible && !is_minimized {
        window.hide().map_err(|e| e.to_string())
    } else {
        if is_minimized {
            let _ = window.unminimize();
        }
        window.show().map_err(|e| e.to_string())?;
        window.set_focus().map_err(|e| e.to_string())
    }
}

#[tauri::command]
fn exit_app<R: Runtime>(app: tauri::AppHandle<R>) {
    app.exit(0);
}

pub fn run() {
    match tauri::Builder::default()
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            set_ignore_cursor_events,
            show_window,
            hide_window,
            toggle_window,
            exit_app
        ])
        .setup(|app| {
            // System Tray Menu Setup
            let show_i = MenuItem::with_id(app, "show", "🌟 Show / Hide Lumen (Alt+L)", true, None::<&str>)?;
            let capture_i = MenuItem::with_id(app, "capture", "📝 Quick Note (Alt+N)", true, None::<&str>)?;
            let timer_i = MenuItem::with_id(app, "timer", "⏰ Quick Timer (Alt+T)", true, None::<&str>)?;
            let hub_i = MenuItem::with_id(app, "hub", "⚙️ Settings Hub (Alt+S)", true, None::<&str>)?;
            let quit_i = MenuItem::with_id(app, "quit", "✕ Quit Lumen", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&show_i, &capture_i, &timer_i, &hub_i, &quit_i])?;

            let mut tray_builder = TrayIconBuilder::with_id("lumen-tray-icon")
                .menu(&menu)
                .tooltip("Lumen — Desktop Spatial Companion");

            if let Some(icon) = app.default_window_icon() {
                tray_builder = tray_builder.icon(icon.clone());
            }

            let _tray = tray_builder
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "show" => {
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = toggle_window(window);
                        }
                    }
                    "capture" => {
                        if let Some(window) = app.get_webview_window("main") {
                            if window.is_minimized().unwrap_or(false) {
                                let _ = window.unminimize();
                            }
                            let _ = window.show();
                            let _ = window.set_focus();
                            let _ = window.emit("open-quick-capture", ());
                        }
                    }
                    "timer" => {
                        if let Some(window) = app.get_webview_window("main") {
                            if window.is_minimized().unwrap_or(false) {
                                let _ = window.unminimize();
                            }
                            let _ = window.show();
                            let _ = window.set_focus();
                            let _ = window.emit("open-quick-timer", ());
                        }
                    }
                    "hub" => {
                        if let Some(window) = app.get_webview_window("main") {
                            if window.is_minimized().unwrap_or(false) {
                                let _ = window.unminimize();
                            }
                            let _ = window.show();
                            let _ = window.set_focus();
                            let _ = window.emit("open-app-settings", ());
                        }
                    }
                    "quit" => {
                        app.exit(0);
                    }
                    _ => {}
                })
                .on_tray_icon_event(|tray, event| {
                    if let TrayIconEvent::Click {
                        button: MouseButton::Left,
                        button_state: MouseButtonState::Up,
                        ..
                    } = event
                    {
                        let app = tray.app_handle();
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = toggle_window(window);
                        }
                    }
                })
                .build(app)?;

            Ok(())
        })
        .build(tauri::generate_context!()) {
        Ok(app) => {
            app.run(|_app_handle, _event| {});
        }
        Err(e) => {
            let err_msg = format!("TAURI BUILD ERROR: {:#?}\nDetails: {}\n", e, e);
            let _ = std::fs::write("tauri_error.log", err_msg.clone());
            let _ = std::fs::write("D:\\Demo\\cliff-clover-moon-tundra\\tauri_error.log", err_msg);
        }
    }
}

