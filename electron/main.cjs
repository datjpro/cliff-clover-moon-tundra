const { app, BrowserWindow, globalShortcut, Tray, Menu, ipcMain, screen } = require("electron");
const path = require("path");

// Prevent Windows DWM & Chromium from occluding and pausing background video players (YouTube, media players)
app.commandLine.appendSwitch("disable-backgrounding-occluded-windows", "true");
app.commandLine.appendSwitch("disable-renderer-backgrounding", "true");
app.commandLine.appendSwitch("disable-background-timer-throttling", "true");
app.commandLine.appendSwitch("disable-features", "CalculateNativeWinOcclusion,IntensiveWakeUpThrottling,ThrottleDisplayableMips");

let mainWindow = null;
let tray = null;

// Hide app icon from macOS Dock if on Darwin, making it a pure background daemon
if (process.platform === "darwin" && app.dock) {
  app.dock.hide();
}

// Single Instance Lock: If user launches app again while running, bring window to front!
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    restoreAndFocusWindow();
  });
}

function restoreAndFocusWindow() {
  if (!mainWindow || mainWindow.isDestroyed()) return;

  if (mainWindow.isMinimized()) {
    mainWindow.restore();
  }
  if (!mainWindow.isVisible()) {
    mainWindow.show();
  }
  mainWindow.setAlwaysOnTop(true, "normal");
  mainWindow.moveTop();
  mainWindow.focus();
}

function updateWindowBounds() {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  try {
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width, height } = primaryDisplay.bounds;
    // 1px left/top offset and 5px bottom clearance ensures background Chrome/Edge never treats window as full occluder,
    // keeping background YouTube video & media players decoding smoothly without freezing, while taskbar remains 100% responsive
    mainWindow.setBounds({ x: 1, y: 1, width: width - 2, height: height - 5 });
  } catch (err) {
    console.debug("[Display] Update bounds error:", err);
  }
}

function createWindow() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.bounds;

  mainWindow = new BrowserWindow({
    x: 1,
    y: 1,
    width: width - 2,
    height: height - 5, // Non-occluding clearance ensures zero background video freezing
    icon: path.join(__dirname, "icon.png"),
    transparent: true,
    frame: false,
    hasShadow: false,
    alwaysOnTop: true,
    skipTaskbar: true, // Pure background daemon: does not show as a window on the taskbar
    focusable: true,
    acceptFirstMouse: true, // Allows single-click focus and typing into notes immediately
    fullscreenable: false,
    backgroundColor: "#00000000",
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false,
      backgroundThrottling: false, // Ensure zero lag or suspension
    },
  });

  // Keep window always on top of regular apps while letting Windows Shell Taskbar slide up
  mainWindow.setAlwaysOnTop(true, "normal");
  mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });

  // Initialize mouse click-through so desktop wallpaper, videos, and background apps work 100%
  mainWindow.setIgnoreMouseEvents(true, { forward: true });

  const isDev = !app.isPackaged && process.env.NODE_ENV !== "production";
  if (isDev) {
    const devUrl = "http://localhost:8080";
    mainWindow.loadURL(devUrl).catch(() => {
      setTimeout(() => {
        if (mainWindow) mainWindow.loadURL(devUrl);
      }, 1500);
    });
  } else {
    mainWindow.loadFile(path.join(__dirname, "../.vercel/output/static/index.html"));
  }

  // Re-sync window bounds if display resolution or connected monitors change
  screen.on("display-metrics-changed", updateWindowBounds);
  screen.on("display-added", updateWindowBounds);
  screen.on("display-removed", updateWindowBounds);

  function registerShortcuts(accelerators, callback) {
    for (const acc of accelerators) {
      try {
        const registered = globalShortcut.register(acc, callback);
        if (registered) {
          console.log(`[GlobalShortcut] Registered: ${acc}`);
        } else {
          console.debug(`[GlobalShortcut] Could not register: ${acc} (in use)`);
        }
      } catch (err) {
        console.debug(`[GlobalShortcut] Error registering ${acc}:`, err);
      }
    }
  }

  function triggerQuickCapture() {
    restoreAndFocusWindow();
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.setIgnoreMouseEvents(false);
      mainWindow.webContents.send("open-quick-capture");
    }
  }

  function triggerQuickTimer() {
    restoreAndFocusWindow();
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.setIgnoreMouseEvents(false);
      mainWindow.webContents.send("open-quick-timer");
    }
  }

  function triggerOpenSettings() {
    restoreAndFocusWindow();
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.setIgnoreMouseEvents(false);
      mainWindow.webContents.send("open-app-settings");
    }
  }

  function triggerArrangeNotes() {
    restoreAndFocusWindow();
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send("arrange-notes");
    }
  }

  function triggerToggleNotes() {
    restoreAndFocusWindow();
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send("toggle-show-hide-all");
    }
  }

  function triggerTogglePet() {
    restoreAndFocusWindow();
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send("toggle-pet");
    }
  }

  // Register clean, non-conflicting Alt-based global shortcuts (Zero collision with browser Incognito / Tabs)
  registerShortcuts(["Alt+N", "Alt+Q"], triggerQuickCapture);
  registerShortcuts(["Alt+T"], triggerQuickTimer);
  registerShortcuts(["Alt+S", "Alt+H"], triggerOpenSettings);
  registerShortcuts(["Alt+A"], triggerArrangeNotes);
  registerShortcuts(["Alt+O"], triggerToggleNotes);
  registerShortcuts(["Alt+P"], triggerTogglePet);
  registerShortcuts(["Alt+L"], () => {
    restoreAndFocusWindow();
  });

  // IPC Channels: Window Visibility & Controls
  ipcMain.on("restore-window", () => {
    restoreAndFocusWindow();
  });

  ipcMain.on("show-window", () => {
    restoreAndFocusWindow();
  });

  ipcMain.on("hide-window", () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.hide();
    }
  });

  ipcMain.on("minimize-window", () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.minimize();
    }
  });

  // IPC channel: Toggle Mouse Click-Through on transparent screen areas
  ipcMain.on("set-ignore-mouse-events", (event, ignore) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      if (ignore) {
        mainWindow.setIgnoreMouseEvents(true, { forward: true });
      } else {
        mainWindow.setIgnoreMouseEvents(false);
      }
    }
  });

  // IPC channel: Toggle Always on Top
  ipcMain.on("set-always-on-top", (event, flag) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.setAlwaysOnTop(Boolean(flag), "normal");
    }
  });

  // IPC channel: Switch to Corner Widget Mode
  ipcMain.on("switch-to-corner-mode", () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      const primaryDisplay = screen.getPrimaryDisplay();
      const { width: screenW, height: screenH } = primaryDisplay.bounds;
      mainWindow.setBounds({
        x: screenW - 360,
        y: screenH - 460,
        width: 340,
        height: 440,
      });
      restoreAndFocusWindow();
    }
  });

  // IPC channel: Switch to Full Workspace / Transparent Overlay Mode
  ipcMain.on("switch-to-full-mode", () => {
    updateWindowBounds();
    restoreAndFocusWindow();
  });

  ipcMain.on("switch-to-transparent-screen-mode", () => {
    updateWindowBounds();
    restoreAndFocusWindow();
  });

  // IPC channel: Quit App
  ipcMain.on("quit-app", () => {
    app.quit();
  });

  // Create System Tray Icon
  try {
    const iconPath = path.join(__dirname, "../src-tauri/icons/32x32.png");
    tray = new Tray(iconPath);

    const contextMenu = Menu.buildFromTemplate([
      {
        label: "🦊 Lumen Workspace",
        enabled: false,
      },
      {
        label: "🌟 Hiện Ứng Dụng (Khôi Phục Cửa Sổ — Alt+L)",
        click: () => {
          restoreAndFocusWindow();
        },
      },
      { type: "separator" },
      {
        label: "📝 + Thêm Ghi Chú Mới (Alt+N)",
        click: () => {
          triggerQuickCapture();
        },
      },
      {
        label: "⏰ + Đặt Giờ Nhanh (Alt+T)",
        click: () => {
          triggerQuickTimer();
        },
      },
      {
        label: "🪟 Sắp Xếp Ghi Chú Gọn Gàng (Alt+A)",
        click: () => {
          triggerArrangeNotes();
        },
      },
      {
        label: "👁️ Ẩn / Hiện Tất Cả Ghi Chú (Alt+O)",
        click: () => {
          triggerToggleNotes();
        },
      },
      { type: "separator" },
      {
        label: "🐾 Bật / Tắt Thú Cưng (Alt+P)",
        click: () => {
          triggerTogglePet();
        },
      },
      {
        label: "⚙️ Cài Đặt Hệ Thống (Alt+S)",
        click: () => {
          triggerOpenSettings();
        },
      },
      { type: "separator" },
      {
        label: "✕ Thoát Ứng Dụng (Quit)",
        click: () => {
          app.quit();
        },
      },
    ]);

    tray.setToolTip("Lumen — Transparent Desktop Sticky Notes & Companion");
    tray.setContextMenu(contextMenu);

    tray.on("click", () => {
      restoreAndFocusWindow();
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send("open-quick-capture");
      }
    });

    tray.on("double-click", () => {
      restoreAndFocusWindow();
    });
  } catch (err) {
    console.debug("[Tray] System tray initialization fallback:", err);
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    } else {
      restoreAndFocusWindow();
    }
  });
});

app.on("will-quit", () => {
  globalShortcut.unregisterAll();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
