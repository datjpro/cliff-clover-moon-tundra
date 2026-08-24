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
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false,
    },
  });

  const devUrl = "http://localhost:8080";
  mainWindow.loadURL(devUrl).catch(() => {
    // If dev server not yet ready, retry shortly
    setTimeout(() => mainWindow.loadURL(devUrl), 1500);
  });

  // Global hotkey Ctrl+Shift+N
  globalShortcut.register("CommandOrControl+Shift+N", () => {
    if (!mainWindow) return;
    mainWindow.show();
    mainWindow.focus();
    mainWindow.webContents.send("open-quick-capture");
  });

  // System Tray
  try {
    const iconPath = path.join(__dirname, "../src-tauri/icons/32x32.png");
    tray = new Tray(iconPath);
    const contextMenu = Menu.buildFromTemplate([
      {
        label: "Show / Hide Lumen",
        click: () => {
          if (mainWindow.isVisible()) mainWindow.hide();
          else {
            mainWindow.show();
            mainWindow.focus();
          }
        },
      },
      {
        label: "Quick Note (Ctrl+Shift+N)",
        click: () => {
          mainWindow.show();
          mainWindow.focus();
          mainWindow.webContents.send("open-quick-capture");
        },
      },
      { type: "separator" },
      { label: "Quit Lumen", click: () => app.quit() },
    ]);
    tray.setToolTip("Lumen — Desktop Spatial Workspace");
    tray.setContextMenu(contextMenu);
    tray.on("click", () => {
      if (mainWindow.isVisible()) mainWindow.hide();
      else {
        mainWindow.show();
        mainWindow.focus();
      }
    });
  } catch (err) {
    console.debug("[Electron] Tray creation skipped:", err?.message);
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
