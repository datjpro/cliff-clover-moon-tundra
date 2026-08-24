const { app, BrowserWindow, globalShortcut, Tray, Menu, ipcMain } = require("electron");
const path = require("path");

let mainWindow = null;
let tray = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 840,
    minWidth: 800,
    minHeight: 580,
    transparent: true,
    frame: false,
    hasShadow: false,
    alwaysOnTop: true,
    skipTaskbar: false,
    webPreferences: {
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

  // IPC channel to toggle always-on-top from UI
  ipcMain.on("set-always-on-top", (event, flag) => {
    if (mainWindow) {
      mainWindow.setAlwaysOnTop(Boolean(flag), "screen-saver");
    }
  });

  ipcMain.on("minimize-window", () => {
    if (mainWindow) mainWindow.minimize();
  });

  ipcMain.on("hide-window", () => {
    if (mainWindow) mainWindow.hide();
  });

  // System Tray Menu
  try {
    const iconPath = path.join(__dirname, "../src-tauri/icons/32x32.png");
    tray = new Tray(iconPath);
    const contextMenu = Menu.buildFromTemplate([
      {
        label: "Hiển thị / Thu gọn Lumen",
        click: () => {
          if (!mainWindow) return;
          if (mainWindow.isVisible()) mainWindow.hide();
          else {
            mainWindow.show();
            mainWindow.focus();
          }
        },
      },
      {
        label: "Ghi chú nhanh (Ctrl+Shift+N)",
        click: () => {
          if (!mainWindow) return;
          mainWindow.show();
          mainWindow.focus();
          mainWindow.webContents.send("open-quick-capture");
        },
      },
      { type: "separator" },
      { label: "Thoát ứng dụng (Quit)", click: () => app.quit() },
    ]);
    tray.setToolTip("Lumen — Desktop Spatial Workspace");
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
