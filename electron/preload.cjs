const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("desktopAPI", {
  minimize: () => ipcRenderer.send("minimize-window"),
  hide: () => ipcRenderer.send("hide-window"),
  restore: () => ipcRenderer.send("restore-window"),
  show: () => ipcRenderer.send("show-window"),
  focus: () => ipcRenderer.send("focus-window"),
  quit: () => ipcRenderer.send("quit-app"),
  setAlwaysOnTop: (flag) => ipcRenderer.send("set-always-on-top", flag),
  setIgnoreMouseEvents: (ignore) => ipcRenderer.send("set-ignore-mouse-events", ignore),
  switchToCornerMode: () => ipcRenderer.send("switch-to-corner-mode"),
  switchToFullMode: () => ipcRenderer.send("switch-to-full-mode"),
  switchToTransparentScreenMode: () => ipcRenderer.send("switch-to-transparent-screen-mode"),
  on: (channel, callback) => {
    const handler = (_event, ...args) => callback(...args);
    ipcRenderer.on(channel, handler);
    return () => {
      ipcRenderer.removeListener(channel, handler);
    };
  },
});

