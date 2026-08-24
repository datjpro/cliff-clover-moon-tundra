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
    type: "toolbar", // Informs Windows DWM that this is an overlay tool, preventing background app occlusion/freeze
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false,
      backgroundThrottling: false, // Ensure zero lag or suspension
    },
  });

  // Keep window floating without using "screen-saver" level which suspends media playback
  mainWindow.setAlwaysOnTop(true, "status");
  mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });

  // Initialize mouse click-through so desktop wallpaper, videos, and background apps work 100%
  mainWindow.setIgnoreMouseEvents(true, { forward: true });

  const devUrl = "http://localhost:8080";
  mainWindow.loadURL(devUrl).catch(() => {
    setTimeout(() => {
      if (mainWindow) mainWindow.loadURL(devUrl);
    }, 1500);
  });

  // Global hotkey Ctrl+Shift+N to open quick capture from background
  globalShortcut.register("CommandOrControl+Shift+N", () => {
    if (!mainWindow) return;
    mainWindow.show();
    mainWindow.focus();
    mainWindow.webContents.send("open-quick-capture");
  });

  // Global hotkey Ctrl+Shift+T to open quick timer from background
  globalShortcut.register("CommandOrControl+Shift+T", () => {
    if (!mainWindow) return;
    mainWindow.show();
    mainWindow.focus();
    mainWindow.webContents.send("open-quick-timer");
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
      mainWindow.setAlwaysOnTop(Boolean(flag), "status");
    }
  });

  // IPC channel: Quit App
  ipcMain.on("quit-app", () => {
    app.quit();
  });

  // Create System Tray Icon (Pure Background Daemon)
  try {
    const iconPath = path.join(__dirname, "../src-tauri/icons/32x32.png");
    tray = new Tray(iconPath);

    const contextMenu = Menu.buildFromTemplate([
      {
        label: "🦊 Lumen Workspace",
        enabled: false,
      },
      { type: "separator" },
      {
        label: "📝 + Thêm Ghi Chú Mới (Ctrl+Shift+N)",
        click: () => {
          if (mainWindow) {
            mainWindow.webContents.send("open-quick-capture");
          }
        },
      },
      {
        label: "⏰ + Đặt Giờ Nhanh (Ctrl+Shift+T)",
        click: () => {
          if (mainWindow) {
            mainWindow.webContents.send("open-quick-timer");
          }
        },
      },
      {
        label: "🪟 Sắp Xếp Ghi Chú Gọn Gàng",
        click: () => {
          if (mainWindow) {
            mainWindow.webContents.send("arrange-notes");
          }
        },
      },
      {
        label: "👁️ Ẩn / Hiện Tất Cả Ghi Chú",
        click: () => {
          if (mainWindow) {
            mainWindow.webContents.send("toggle-show-hide-all");
          }
        },
      },
      { type: "separator" },
      {
        label: "🐾 Bật / Tắt Thú Cưng",
        click: () => {
          if (mainWindow) {
            mainWindow.webContents.send("toggle-pet");
          }
        },
      },
      {
        label: "⚙️ Cài Đặt Hệ Thống",
        click: () => {
          if (mainWindow) {
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
      if (mainWindow) {
        mainWindow.webContents.send("open-quick-capture");
      }
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
