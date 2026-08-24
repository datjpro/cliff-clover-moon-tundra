/**
 * Lumen Desktop Native Bridge (Tauri v2 / Rust IPC)
 * Provides seamless cross-platform communication between Webview and Native OS Shell.
 */

// Safe detection of Tauri Native runtime environment
export function isDesktopApp(): boolean {
  if (typeof window === "undefined") return false;
  return "__TAURI_INTERNALS__" in window || "__TAURI__" in window;
}

/**
 * Toggle native mouse click-through for transparent overlays.
 * When enabled (ignore = true), mouse clicks fall straight through to Windows / macOS desktop apps.
 * When disabled (ignore = false), mouse clicks interact with Pip, sticky notes, and menus.
 */
export async function setNativeClickThrough(ignore: boolean): Promise<void> {
  if (!isDesktopApp()) return;
  try {
    const { invoke } = await import("@tauri-apps/api/core");
    await invoke("set_ignore_cursor_events", { ignore });
  } catch (err) {
    console.debug("[DesktopBridge] setNativeClickThrough:", err);
  }
}

/**
 * Native OS Notification (bypasses browser permissions when running in desktop shell)
 */
export async function sendDesktopNotification(title: string, body: string): Promise<void> {
  if (isDesktopApp()) {
    try {
      const { sendNotification, isPermissionGranted, requestPermission } = await import(
        "@tauri-apps/plugin-notification"
      );
      let permissionGranted = await isPermissionGranted();
      if (!permissionGranted) {
        const permission = await requestPermission();
        permissionGranted = permission === "granted";
      }
      if (permissionGranted) {
        sendNotification({ title, body });
        return;
      }
    } catch (err) {
      console.debug("[DesktopBridge] native notification fallback:", err);
    }
  }

  // Web Notification API fallback
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification(title, { body });
  }
}

/**
 * Native Window Minimize / Maximize / Close controls
 */
export async function minimizeDesktopWindow(): Promise<void> {
  if (!isDesktopApp()) return;
  try {
    const { getCurrentWindow } = await import("@tauri-apps/api/window");
    await getCurrentWindow().minimize();
  } catch (err) {
    console.debug("[DesktopBridge] minimize:", err);
  }
}

export async function toggleAlwaysOnTop(onTop: boolean): Promise<void> {
  if (!isDesktopApp()) return;
  try {
    const { getCurrentWindow } = await import("@tauri-apps/api/window");
    await getCurrentWindow().setAlwaysOnTop(onTop);
  } catch (err) {
    console.debug("[DesktopBridge] setAlwaysOnTop:", err);
  }
}
