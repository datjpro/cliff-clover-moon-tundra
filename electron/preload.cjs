const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("desktopAPI", {
  minimize: () => ipcRenderer.send("minimize-window"),
  hide: () => ipcRenderer.send("hide-window"),
  restore: () => ipcRenderer.send("restore-window"),
  show: () => ipcRenderer.send("show-window"),
  quit: () => ipcRenderer.send("quit-app"),
  setAlwaysOnTop: (flag) => ipcRenderer.send("set-always-on-top", flag),
  setIgnoreMouseEvents: (ignore) => ipcRenderer.send("set-ignore-mouse-events", ignore),
  switchToCornerMode: () => ipcRenderer.send("switch-to-corner-mode"),
  switchToFullMode: () => ipcRenderer.send("switch-to-full-mode"),
  switchToTransparentScreenMode: () => ipcRenderer.send("switch-to-transparent-screen-mode"),
  createNoteWindow: (noteId, initialX, initialY) => ipcRenderer.send("create-note-window", { noteId, initialX, initialY }),
  closeNoteWindow: (noteId) => ipcRenderer.send("close-note-window", noteId),
  setWindowPosition: (x, y) => ipcRenderer.send("set-window-position", { x, y }),
  openHubWindow: () => ipcRenderer.send("open-hub-window"),
  openProWindow: () => ipcRenderer.send("open-pro-window"),
  on: (channel, callback) => {
    const handler = (_event, ...args) => callback(...args);
    ipcRenderer.on(channel, handler);
    return () => {
      ipcRenderer.removeListener(channel, handler);
    };
  },
});

