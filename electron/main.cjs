const { app, BrowserWindow, globalShortcut, Tray, Menu, ipcMain, screen } = require("electron");
const path = require("path");

// Prevent Windows DWM & Chromium from occluding and pausing background video players (YouTube, media players)
app.commandLine.appendSwitch("disable-backgrounding-occluded-windows", "true");
app.commandLine.appendSwitch("disable-renderer-backgrounding", "true");
app.commandLine.appendSwitch("disable-features", "CalculateNativeWinOcclusion");

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
  mainWindow.setAlwaysOnTop(true, "screen-saver");
  mainWindow.moveTop();
  mainWindow.focus();
}

function updateWindowBounds() {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  try {
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width, height } = primaryDisplay.bounds;
    mainWindow.setBounds({ x: 0, y: 0, width, height });
  } catch (err) {
    console.debug("[Display] Update bounds error:", err);
  }
}

function createWindow() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.bounds;

  mainWindow = new BrowserWindow({
    x: 0,
    y: 0,
    width: width,
    height: height,
    transparent: true,
    frame: false,
    hasShadow: false,
    alwaysOnTop: true,
    skipTaskbar: true, // Pure background daemon: does not show as a window on the taskbar
    focusable: true,
    fullscreenable: false,
    backgroundColor: "#00000000",
    type: "toolbar", // Informs Windows DWM that this is an overlay tool
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false,
      backgroundThrottling: false, // Ensure zero lag or suspension
    },
  });

  // Keep window floating without using "screen-saver" level which suspends media playback
  mainWindow.setAlwaysOnTop(true, "screen-saver");
  mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });

  // Initialize mouse click-through so desktop wallpaper, videos, and background apps work 100%
  mainWindow.setIgnoreMouseEvents(true, { forward: true });

  const devUrl = "http://localhost:8080";
  mainWindow.loadURL(devUrl).catch(() => {
    setTimeout(() => {
      if (mainWindow) mainWindow.loadURL(devUrl);
    }, 1500);
  });

  // Re-sync window bounds if display resolution or connected monitors change
  screen.on("display-metrics-changed", updateWindowBounds);
  screen.on("display-added", updateWindowBounds);
  screen.on("display-removed", updateWindowBounds);

  // Global hotkeys to restore window and trigger actions
  globalShortcut.register("CommandOrControl+Shift+N", () => {
    restoreAndFocusWindow();
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send("open-quick-capture");
    }
  });

  globalShortcut.register("CommandOrControl+Shift+T", () => {
    restoreAndFocusWindow();
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send("open-quick-timer");
    }
  });

  globalShortcut.register("CommandOrControl+Shift+L", () => {
    restoreAndFocusWindow();
  });

  globalShortcut.register("CommandOrControl+Shift+H", () => {
    restoreAndFocusWindow();
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send("open-app-settings");
    }
  });

  globalShortcut.register("CommandOrControl+Shift+A", () => {
    restoreAndFocusWindow();
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send("arrange-notes");
    }
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
      mainWindow.setAlwaysOnTop(Boolean(flag), "screen-saver");
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
        label: "🌟 Hiện Ứng Dụng (Khôi Phục Cửa Sổ)",
        click: () => {
          restoreAndFocusWindow();
        },
      },
      { type: "separator" },
      {
        label: "📝 + Thêm Ghi Chú Mới (Ctrl+Shift+N)",
        click: () => {
          restoreAndFocusWindow();
          if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send("open-quick-capture");
          }
        },
      },
      {
        label: "⏰ + Đặt Giờ Nhanh (Ctrl+Shift+T)",
        click: () => {
          restoreAndFocusWindow();
          if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send("open-quick-timer");
          }
        },
      },
      {
        label: "🪟 Sắp Xếp Ghi Chú Gọn Gàng",
        click: () => {
          restoreAndFocusWindow();
          if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send("arrange-notes");
          }
        },
      },
      {
        label: "👁️ Ẩn / Hiện Tất Cả Ghi Chú",
        click: () => {
          restoreAndFocusWindow();
          if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send("toggle-show-hide-all");
          }
        },
      },
      { type: "separator" },
      {
        label: "🐾 Bật / Tắt Thú Cưng",
        click: () => {
          restoreAndFocusWindow();
          if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send("toggle-pet");
          }
        },
      },
      {
        label: "⚙️ Cài Đặt Hệ Thống (Ctrl+Shift+H)",
        click: () => {
          restoreAndFocusWindow();
          if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send("open-app-settings");
          }
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
