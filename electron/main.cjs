const { app, BrowserWindow, globalShortcut, Tray, Menu, ipcMain, screen } = require("electron");
const path = require("path");

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
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false,
    },
  });

  // Keep window floating above normal desktop apps
  mainWindow.setAlwaysOnTop(true, "screen-saver");

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
      mainWindow.setIgnoreMouseEvents(Boolean(ignore), { forward: true });
    }
  });

  // IPC channel: Toggle Always on Top
  ipcMain.on("set-always-on-top", (event, flag) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.setAlwaysOnTop(Boolean(flag), "screen-saver");
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
      { label: "✕ Quit Lumen (Thoát hoàn toàn)", click: () => app.quit() },
    ]);

    tray.setToolTip("Lumen — Background Desktop Companion & Sticky Notes");
    tray.setContextMenu(contextMenu);
    tray.on("click", () => {
      if (!mainWindow) return;
      mainWindow.webContents.send("add-new-note");
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
