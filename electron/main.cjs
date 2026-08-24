const { app, BrowserWindow, globalShortcut, Tray, Menu, ipcMain, screen } = require("electron");
const path = require("path");

let mainWindow = null;
let tray = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 840,
    minWidth: 320,
    minHeight: 380,
    transparent: true,
    frame: false,
    hasShadow: false,
    alwaysOnTop: true,
    skipTaskbar: false,
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

  // IPC channel: Toggle Always on Top
  ipcMain.on("set-always-on-top", (event, flag) => {
    if (mainWindow) {
      mainWindow.setAlwaysOnTop(Boolean(flag), "screen-saver");
    }
  });

  // IPC channel: Minimize Window to taskbar
  ipcMain.on("minimize-window", () => {
    if (mainWindow) mainWindow.minimize();
  });

  // IPC channel: Hide Window to tray
  ipcMain.on("hide-window", () => {
    if (mainWindow) mainWindow.hide();
  });

  // IPC channel: Quit App
  ipcMain.on("quit-app", () => {
    app.quit();
  });

  // IPC channel: Switch to Mini Corner Widget Mode (Bottom-Right of Computer Screen)
  ipcMain.on("switch-to-corner-mode", () => {
    if (!mainWindow) return;
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width, height } = primaryDisplay.workAreaSize;
    const widgetWidth = 340;
    const widgetHeight = 440;
    mainWindow.setResizable(true);
    mainWindow.setBounds({
      x: width - widgetWidth - 16,
      y: height - widgetHeight - 16,
      width: widgetWidth,
      height: widgetHeight,
    });
    mainWindow.setAlwaysOnTop(true, "screen-saver");
  });

  // IPC channel: Switch to Full Workspace Mode
  ipcMain.on("switch-to-full-mode", () => {
    if (!mainWindow) return;
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width, height } = primaryDisplay.workAreaSize;
    const fullWidth = Math.min(1280, width - 60);
    const fullHeight = Math.min(840, height - 60);
    mainWindow.setBounds({
      x: Math.round((width - fullWidth) / 2),
      y: Math.round((height - fullHeight) / 2),
      width: fullWidth,
      height: fullHeight,
    });
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
      {
        label: "Thu nhỏ về góc màn hình máy tính",
        click: () => {
          if (!mainWindow) return;
          mainWindow.show();
          const primaryDisplay = screen.getPrimaryDisplay();
          const { width, height } = primaryDisplay.workAreaSize;
          mainWindow.setBounds({
            x: width - 356,
            y: height - 456,
            width: 340,
            height: 440,
          });
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
