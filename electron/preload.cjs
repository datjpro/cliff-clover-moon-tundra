const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("desktopAPI", {
  minimize: () => ipcRenderer.send("minimize-window"),
  hide: () => ipcRenderer.send("hide-window"),
  quit: () => ipcRenderer.send("quit-app"),
  setAlwaysOnTop: (flag) => ipcRenderer.send("set-always-on-top", flag),
  switchToCornerMode: () => ipcRenderer.send("switch-to-corner-mode"),
  switchToFullMode: () => ipcRenderer.send("switch-to-full-mode"),
});
