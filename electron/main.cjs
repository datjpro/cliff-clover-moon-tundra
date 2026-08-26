const { app, BrowserWindow, globalShortcut, Tray, Menu, ipcMain, screen } = require("electron");
const path = require("path");
const fs = require("fs");

// Prevent Windows DWM & Chromium from occluding and pausing background video players (YouTube, media players)
app.commandLine.appendSwitch("disable-backgrounding-occluded-windows", "true");
app.commandLine.appendSwitch("disable-renderer-backgrounding", "true");
app.commandLine.appendSwitch("disable-background-timer-throttling", "true");
app.commandLine.appendSwitch("disable-features", "CalculateNativeWinOcclusion,IntensiveWakeUpThrottling,ThrottleDisplayableMips");

let mainWindow = null;
let tray = null;
const noteWindows = new Map();
let pipWindow = null;
let hubWindow = null;

// Hide app icon from macOS Dock if on Darwin, making it a pure background daemon
if (process.platform === "darwin" && app.dock) {
  app.dock.hide();
}

// Single Instance Lock
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    restoreAndFocusWindow();
  });
}

function getAppEntryUrl(queryString = "") {
  const staticFile = path.join(__dirname, "../.vercel/output/static/index.html");
  if (process.env.ELECTRON_DEV) {
    return `http://localhost:8080${queryString ? `?${queryString}` : ""}`;
  }
  if (fs.existsSync(staticFile)) {
    return `file://${staticFile}${queryString ? `?${queryString}` : ""}`;
  }
  return `http://localhost:8080${queryString ? `?${queryString}` : ""}`;
}

function restoreAndFocusWindow() {
  if (mainWindow && !mainWindow.isDestroyed()) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    if (!mainWindow.isVisible()) mainWindow.show();
    mainWindow.setAlwaysOnTop(true, "normal");
    mainWindow.moveTop();
    mainWindow.focus();
  }
  noteWindows.forEach((win) => {
    if (win && !win.isDestroyed()) {
      if (win.isMinimized()) win.restore();
      if (!win.isVisible()) win.show();
      win.setAlwaysOnTop(true, "normal");
    }
  });
  if (pipWindow && !pipWindow.isDestroyed()) {
    if (!pipWindow.isVisible()) pipWindow.show();
    pipWindow.setAlwaysOnTop(true, "normal");
  }
}

function updateWindowBounds() {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  try {
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width, height } = primaryDisplay.bounds;
    mainWindow.setBounds({ x: 1, y: 1, width: width - 2, height: height - 5 });
  } catch (err) {
    console.debug("[Display] Update bounds error:", err);
  }
}

function createMainWindow() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.bounds;

  mainWindow = new BrowserWindow({
    x: 1,
    y: 1,
    width: width - 2,
    height: height - 5,
    icon: path.join(__dirname, "icon.png"),
    transparent: true,
    frame: false,
    hasShadow: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    focusable: true,
    acceptFirstMouse: true,
    fullscreenable: false,
    backgroundColor: "#00000000",
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false,
      backgroundThrottling: false,
    },
  });

  mainWindow.setAlwaysOnTop(true, "normal");
  mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  mainWindow.setIgnoreMouseEvents(true, { forward: true });

  const url = getAppEntryUrl();
  mainWindow.loadURL(url).catch((err) => {
    console.debug("[Window] Load URL error:", err);
  });

  // Re-sync window bounds if display resolution changes
  screen.on("display-metrics-changed", updateWindowBounds);
  screen.on("display-added", updateWindowBounds);
  screen.on("display-removed", updateWindowBounds);
}

// 🪟 Create Individual Sticky Note Window (Multi-Window mode)
function createNoteWindow(noteId, x = 100, y = 100) {
  if (noteWindows.has(noteId)) {
    const existing = noteWindows.get(noteId);
    if (existing && !existing.isDestroyed()) {
      existing.show();
      existing.focus();
      return existing;
    }
  }

  const win = new BrowserWindow({
    x: Math.round(x),
    y: Math.round(y),
    width: 280,
    height: 320,
    icon: path.join(__dirname, "icon.png"),
    transparent: true,
    frame: false,
    hasShadow: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    focusable: true,
    acceptFirstMouse: true,
    backgroundColor: "#00000000",
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false,
      backgroundThrottling: false,
    },
  });

  const url = getAppEntryUrl(`view=note&id=${noteId}`);
  win.loadURL(url);
  noteWindows.set(noteId, win);

  win.on("closed", () => {
    noteWindows.delete(noteId);
  });

  return win;
}

// 🦊 Create Pip Companion Mini Window
function createPipWindow() {
  if (pipWindow && !pipWindow.isDestroyed()) {
    pipWindow.show();
    pipWindow.focus();
    return pipWindow;
  }

  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.bounds;

  pipWindow = new BrowserWindow({
    x: width - 240,
    y: height - 240,
    width: 180,
    height: 180,
    icon: path.join(__dirname, "icon.png"),
    transparent: true,
    frame: false,
    hasShadow: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    backgroundColor: "#00000000",
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false,
      backgroundThrottling: false,
    },
  });

  const url = getAppEntryUrl("view=pip");
  pipWindow.loadURL(url);

  pipWindow.on("closed", () => {
    pipWindow = null;
  });

  return pipWindow;
}

// ⚙️ Create Settings Hub Window
function createHubWindow() {
  if (hubWindow && !hubWindow.isDestroyed()) {
    hubWindow.show();
    hubWindow.focus();
    return hubWindow;
  }

  hubWindow = new BrowserWindow({
    width: 780,
    height: 600,
    center: true,
    icon: path.join(__dirname, "icon.png"),
    transparent: false,
    frame: true,
    title: "Lumen Settings & Pro Hub",
    backgroundColor: "#14161D",
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false,
    },
  });

  const url = getAppEntryUrl("view=hub");
  hubWindow.loadURL(url);

  hubWindow.on("closed", () => {
    hubWindow = null;
  });

  return hubWindow;
}

function registerShortcuts(accelerators, callback) {
  for (const acc of accelerators) {
    try {
      const registered = globalShortcut.register(acc, callback);
      if (registered) {
        console.log(`[GlobalShortcut] Registered: ${acc}`);
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

function createTray() {
  try {
    const iconPath = path.join(__dirname, "../src-tauri/icons/32x32.png");
    const fallbackPath = path.join(__dirname, "icon.png");
    const resolvedIcon = fs.existsSync(iconPath) ? iconPath : fallbackPath;

    tray = new Tray(resolvedIcon);

    const contextMenu = Menu.buildFromTemplate([
      {
        label: "🌟 Lumen — Spatial Companion",
        enabled: false,
      },
      { type: "separator" },
      {
        label: "📝 + Ghi Chú Mới (Alt+N)",
        click: () => triggerQuickCapture(),
      },
      {
        label: "⏰ + Đặt Giờ Nhanh (Alt+T)",
        click: () => triggerQuickTimer(),
      },
      {
        label: "🪟 Sắp Xếp Ghi Chú Gọn Gàng (Alt+A)",
        click: () => triggerArrangeNotes(),
      },
      {
        label: "👁️ Ẩn / Hiện Tất Cả Ghi Chú (Alt+O)",
        click: () => triggerToggleNotes(),
      },
      { type: "separator" },
      {
        label: "🐾 Bật / Tắt Thú Cưng (Alt+P)",
        click: () => triggerTogglePet(),
      },
      {
        label: "⚙️ Cài Đặt Hệ Thống (Alt+S)",
        click: () => triggerOpenSettings(),
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
  createMainWindow();
  createTray();

  // Register clean Alt global shortcuts
  registerShortcuts(["Alt+N", "Alt+Q"], triggerQuickCapture);
  registerShortcuts(["Alt+T"], triggerQuickTimer);
  registerShortcuts(["Alt+S", "Alt+H"], triggerOpenSettings);
  registerShortcuts(["Alt+A"], triggerArrangeNotes);
  registerShortcuts(["Alt+O"], triggerToggleNotes);
  registerShortcuts(["Alt+P"], triggerTogglePet);
  registerShortcuts(["Alt+L"], () => {
    restoreAndFocusWindow();
  });

  // IPC Channels
  ipcMain.on("restore-window", () => restoreAndFocusWindow());
  ipcMain.on("show-window", () => restoreAndFocusWindow());
  ipcMain.on("hide-window", () => {
    if (mainWindow && !mainWindow.isDestroyed()) mainWindow.hide();
  });
  ipcMain.on("minimize-window", () => {
    if (mainWindow && !mainWindow.isDestroyed()) mainWindow.minimize();
  });

  // Toggle Mouse Click-Through on transparent screen areas
  ipcMain.on("set-ignore-mouse-events", (event, ignore) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win && !win.isDestroyed()) {
      if (ignore) {
        win.setIgnoreMouseEvents(true, { forward: true });
      } else {
        win.setIgnoreMouseEvents(false);
      }
    }
  });

  ipcMain.on("set-always-on-top", (event, flag) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win && !win.isDestroyed()) {
      win.setAlwaysOnTop(Boolean(flag), "normal");
    }
  });

  // Multi-Window IPC Commands
  ipcMain.on("create-note-window", (_event, { noteId, initialX, initialY }) => {
    createNoteWindow(noteId, initialX, initialY);
  });
  ipcMain.on("close-note-window", (_event, noteId) => {
    if (noteWindows.has(noteId)) {
      const win = noteWindows.get(noteId);
      if (win && !win.isDestroyed()) win.close();
      noteWindows.delete(noteId);
    }
  });
  ipcMain.on("open-hub-window", () => createHubWindow());
  ipcMain.on("open-pro-window", () => createHubWindow());

  ipcMain.on("quit-app", () => {
    app.quit();
  });

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
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
