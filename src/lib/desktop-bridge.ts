/**
 * Lumen Desktop Native Bridge (Electron & Tauri v2 IPC)
 * Provides seamless cross-platform communication between Webview and Native OS Shell.
 */

declare global {
  interface Window {
    desktopAPI?: {
      minimize: () => void;
      hide: () => void;
      restore: () => void;
      show: () => void;
      quit: () => void;
      setAlwaysOnTop: (flag: boolean) => void;
      setIgnoreMouseEvents: (ignore: boolean) => void;
      switchToCornerMode: () => void;
      switchToFullMode: () => void;
      switchToTransparentScreenMode: () => void;
      on: (channel: string, callback: (...args: unknown[]) => void) => () => void;
    };
    __TAURI_INTERNALS__?: unknown;
    __TAURI__?: unknown;
  }
}

// Safe detection of Desktop Native runtime environment (Electron or Tauri)
export function isDesktopApp(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(window.desktopAPI || window.__TAURI_INTERNALS__ || window.__TAURI__);
}

/**
 * Restore Desktop Window from minimized or occluded state, bring to top and focus
 */
export async function restoreDesktopWindow(): Promise<void> {
  if (typeof window !== "undefined" && window.desktopAPI?.restore) {
    window.desktopAPI.restore();
    return;
  }
  if (typeof window !== "undefined" && (window.__TAURI_INTERNALS__ || window.__TAURI__)) {
    try {
      const { getCurrentWindow } = await import("@tauri-apps/api/window");
      const win = getCurrentWindow();
      if (await win.isMinimized()) {
        await win.unminimize();
      }
      await win.show();
      await win.setFocus();
    } catch (err) {
      console.debug("[DesktopBridge] restore error:", err);
    }
  }
}

/**
 * Show and focus Desktop Window
 */
export async function showDesktopWindow(): Promise<void> {
  if (typeof window !== "undefined" && window.desktopAPI?.show) {
    window.desktopAPI.show();
    return;
  }
  if (typeof window !== "undefined" && (window.__TAURI_INTERNALS__ || window.__TAURI__)) {
    try {
      const { getCurrentWindow } = await import("@tauri-apps/api/window");
      const win = getCurrentWindow();
      await win.show();
      await win.setFocus();
    } catch (err) {
      console.debug("[DesktopBridge] show error:", err);
    }
  }
}

/**
 * Unified listener for native IPC desktop events (Works seamlessly across Electron & Tauri v2)
 * Returns a teardown function for symmetrical cleanup.
 */
export function listenToDesktopEvent(
  eventName: string,
  callback: (...args: unknown[]) => void,
): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  // 1. Electron IPC Bridge
  if (window.desktopAPI?.on) {
    return window.desktopAPI.on(eventName, callback);
  }

  // 2. Tauri v2 IPC Bridge
  if (window.__TAURI_INTERNALS__ || window.__TAURI__) {
    let unlistenFn: (() => void) | null = null;
    let isCleanedUp = false;

    void import("@tauri-apps/api/event").then(({ listen }) => {
      if (isCleanedUp) return;
      listen(eventName, (event) => {
        callback(event.payload);
      }).then((unlisten) => {
        if (isCleanedUp) {
          unlisten();
        } else {
          unlistenFn = unlisten;
        }
      });
    });

    return () => {
      isCleanedUp = true;
      if (unlistenFn) {
        unlistenFn();
      }
    };
  }

  // 3. Fallback Web Custom Event
  const customEventName = `lumen:${eventName}`;
  const webHandler = (e: Event) => {
    const customEvent = e as CustomEvent;
    callback(customEvent.detail);
  };
  window.addEventListener(customEventName, webHandler);
  return () => {
    window.removeEventListener(customEventName, webHandler);
  };
}

/**
 * Toggle native mouse click-through for transparent overlays.
 * When enabled (ignore = true), clicks pass straight through to OS apps underneath.
 * When disabled (ignore = false), clicks interact with notes, pet, and controls.
 */
export function setIgnoreMouseEvents(ignore: boolean): void {
  if (typeof window !== "undefined" && window.desktopAPI) {
    window.desktopAPI.setIgnoreMouseEvents(ignore);
    return;
  }
  // In Tauri Desktop, cursor events remain enabled so notes, inputs, buttons, and companion are 100% interactive.
}

/**
 * Switch OS Desktop Window to Mini Corner Widget Mode (Bottom-Right of Computer Screen)
 */
export async function switchToCornerWidgetMode(): Promise<void> {
  if (typeof window !== "undefined" && window.desktopAPI) {
    window.desktopAPI.switchToCornerMode();
    return;
  }
  if (typeof window !== "undefined" && (window.__TAURI_INTERNALS__ || window.__TAURI__)) {
    try {
      const { getCurrentWindow, LogicalPosition, LogicalSize } = await import("@tauri-apps/api/window");
      const { currentMonitor } = await import("@tauri-apps/api/window");
      const win = getCurrentWindow();
      const monitor = await currentMonitor();
      if (monitor) {
        const screenW = monitor.size.width;
        const screenH = monitor.size.height;
        await win.setSize(new LogicalSize(340, 440));
        await win.setPosition(new LogicalPosition(screenW - 360, screenH - 460));
        await win.setAlwaysOnTop(true);
      }
    } catch (err) {
      console.debug("[DesktopBridge] tauri corner mode:", err);
    }
  }
}

/**
 * Restore OS Desktop Window to Full Workspace Mode
 */
export async function switchToFullDesktopMode(): Promise<void> {
  if (typeof window !== "undefined" && window.desktopAPI) {
    window.desktopAPI.switchToFullMode();
    return;
  }
  if (typeof window !== "undefined" && (window.__TAURI_INTERNALS__ || window.__TAURI__)) {
    try {
      const { getCurrentWindow, LogicalSize } = await import("@tauri-apps/api/window");
      const win = getCurrentWindow();
      await win.setSize(new LogicalSize(1280, 840));
      await win.center();
    } catch (err) {
      console.debug("[DesktopBridge] tauri full mode:", err);
    }
  }
}

/**
 * Minimize Desktop Window to taskbar
 */
export async function minimizeDesktopWindow(): Promise<void> {
  if (typeof window !== "undefined" && window.desktopAPI) {
    window.desktopAPI.minimize();
    return;
  }
  if (typeof window !== "undefined" && (window.__TAURI_INTERNALS__ || window.__TAURI__)) {
    try {
      const { getCurrentWindow } = await import("@tauri-apps/api/window");
      await getCurrentWindow().minimize();
    } catch (err) {
      console.debug("[DesktopBridge] minimize:", err);
    }
  }
}

/**
 * Close / Quit Desktop Application completely
 */
export async function closeOrQuitDesktopApp(): Promise<void> {
  if (typeof window !== "undefined" && window.desktopAPI) {
    window.desktopAPI.quit();
    return;
  }
  if (typeof window !== "undefined" && (window.__TAURI_INTERNALS__ || window.__TAURI__)) {
    try {
      const { getCurrentWindow } = await import("@tauri-apps/api/window");
      await getCurrentWindow().close();
    } catch (err) {
      console.debug("[DesktopBridge] quit:", err);
    }
  }
}

/**
 * Native OS Notification
 */
export async function sendDesktopNotification(title: string, body: string): Promise<void> {
  if (typeof window !== "undefined" && (window.__TAURI_INTERNALS__ || window.__TAURI__)) {
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
  if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
    new Notification(title, { body });
  }
}

/**
 * Toggle Always On Top
 */
export async function toggleAlwaysOnTop(onTop: boolean): Promise<void> {
  if (typeof window !== "undefined" && window.desktopAPI) {
    window.desktopAPI.setAlwaysOnTop(onTop);
    return;
  }
  if (typeof window !== "undefined" && (window.__TAURI_INTERNALS__ || window.__TAURI__)) {
    try {
      const { getCurrentWindow } = await import("@tauri-apps/api/window");
      await getCurrentWindow().setAlwaysOnTop(onTop);
    } catch (err) {
      console.debug("[DesktopBridge] setAlwaysOnTop:", err);
    }
  }
}

