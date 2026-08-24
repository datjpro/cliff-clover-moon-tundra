const { app, BrowserWindow, globalShortcut, Tray, Menu, ipcMain, screen } = require("electron");
const path = require("path");

let mainWindow = null;
let tray = null;

function createWindow() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.bounds;

  mainWindow = new BrowserWindow({
    x: 0,
    y: 0,
    width: width,
    height: height,
    minWidth: 320,
    minHeight: 380,
    transparent: true,
    frame: false,
    hasShadow: false,
    alwaysOnTop: true,
    skipTaskbar: false,
    backgroundColor: "#00000000",
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false,
    },
  });

  // Keep window floating above normal windows
  mainWindow.setAlwaysOnTop(true, "screen-saver");

  const devUrl = "http://localhost:8080";
  mainWindow.loadURL(devUrl).catch(() => {
    setTimeout(() => {
      if (mainWindow) mainWindow.loadURL(devUrl);
    }, 1500);
  });

  // Global hotkey Ctrl+Shift+N (Command+Shift+N on macOS)
  globalShortcut.register("CommandOrControl+Shift+N", () => {
    if (!mainWindow) return;
    mainWindow.show();
    mainWindow.focus();
    mainWindow.webContents.send("open-quick-capture");
  });

  // IPC channel: Toggle Mouse Click-Through on transparent screen areas
  ipcMain.on("set-ignore-mouse-events", (event, ignore) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.setIgnoreMouseEvents(Boolean(ignore), { forward: true });
    }
  });

  // IPC channel: Toggle Always on Top
  ipcMain.on("set-always-on-top", (event, flag) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.setAlwaysOnTop(Boolean(flag), "screen-saver");
    }
  });

  // IPC channel: Minimize Window to taskbar
  ipcMain.on("minimize-window", () => {
    if (mainWindow && !mainWindow.isDestroyed()) mainWindow.minimize();
  });

  // IPC channel: Hide Window to tray
  ipcMain.on("hide-window", () => {
    if (mainWindow && !mainWindow.isDestroyed()) mainWindow.hide();
  });

  // IPC channel: Quit App
  ipcMain.on("quit-app", () => {
    app.quit();
  });

  // IPC channel: Switch to Mini Corner Widget Mode
  ipcMain.on("switch-to-corner-mode", () => {
    if (!mainWindow || mainWindow.isDestroyed()) return;
    const { width: scrW, height: scrH } = screen.getPrimaryDisplay().workAreaSize;
    const widgetWidth = 340;
    const widgetHeight = 440;
    mainWindow.setIgnoreMouseEvents(false);
    mainWindow.setBounds({
      x: scrW - widgetWidth - 16,
      y: scrH - widgetHeight - 16,
      width: widgetWidth,
      height: widgetHeight,
    });
    mainWindow.setAlwaysOnTop(true, "screen-saver");
  });

  // IPC channel: Switch to Fullscreen Transparent Desktop Overlay Mode
  ipcMain.on("switch-to-transparent-screen-mode", () => {
    if (!mainWindow || mainWindow.isDestroyed()) return;
    const { width: scrW, height: scrH } = screen.getPrimaryDisplay().bounds;
    mainWindow.setBounds({
      x: 0,
      y: 0,
      width: scrW,
      height: scrH,
    });
    mainWindow.setAlwaysOnTop(true, "screen-saver");
  });

  // IPC channel: Switch to Full Centered Window Mode
  ipcMain.on("switch-to-full-mode", () => {
    if (!mainWindow || mainWindow.isDestroyed()) return;
    const { width: scrW, height: scrH } = screen.getPrimaryDisplay().bounds;
    mainWindow.setBounds({
      x: 0,
      y: 0,
      width: scrW,
      height: scrH,
    });
    mainWindow.setAlwaysOnTop(true, "screen-saver");
  });

  // System Tray Menu (Matching user specification)
  try {
    const iconPath = path.join(__dirname, "../src-tauri/icons/32x32.png");
    tray = new Tray(iconPath);
    const contextMenu = Menu.buildFromTemplate([
      {
        label: "+ New Note (+ Ghi chú mới)",
        click: () => {
          if (!mainWindow) return;
          mainWindow.show();
          mainWindow.webContents.send("add-new-note");
        },
      },
      {
        label: "🪟 Arrange Notes (Sắp xếp ghi chú)",
        click: () => {
          if (!mainWindow) return;
          mainWindow.webContents.send("arrange-notes");
        },
      },
      {
        label: "👁️ Show / Hide All (Ẩn / Hiện tất cả)",
        click: () => {
          if (!mainWindow) return;
          mainWindow.webContents.send("toggle-show-hide-all");
        },
      },
      { type: "separator" },
      {
        label: "🐾 Pet Settings (Cài đặt Thú cưng)",
        click: () => {
          if (!mainWindow) return;
          mainWindow.show();
          mainWindow.webContents.send("open-pet-settings");
        },
      },
      {
        label: "⚙️ App Settings (Cài đặt Chung)",
        click: () => {
          if (!mainWindow) return;
          mainWindow.show();
          mainWindow.webContents.send("open-app-settings");
        },
      },
      { type: "separator" },
      { label: "✕ Quit Lumen (Thoát ứng dụng)", click: () => app.quit() },
    ]);
    tray.setToolTip("Lumen — Desktop Spatial Companion & Sticky Notes");
    tray.setContextMenu(contextMenu);
    tray.on("click", () => {
      if (!mainWindow) return;
      if (mainWindow.isVisible()) mainWindow.hide();
      else {
        mainWindow.show();
        mainWindow.focus();
      }
    });
  } catch (err) {
    console.debug("[Electron] Tray initialization note:", err?.message);
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("will-quit", () => {
  globalShortcut.unregisterAll();
});
