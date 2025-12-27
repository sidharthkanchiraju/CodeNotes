const { contextBridge, ipcRenderer } = require('electron')

// Log to confirm preload is running
console.log('Preload script is running!')

contextBridge.exposeInMainWorld('api', {
  saveFile: (filename, content) => {
    console.log('saveFile called from renderer')
    return ipcRenderer.invoke('save-file', filename, content)
  },
  runCommand: (command) => {
    console.log('runCommand called from renderer')
    return ipcRenderer.invoke('run-command', command)
  },

  readDirectory: (path) => ipcRenderer.invoke('read-directory', path),
  readFile: (path) => ipcRenderer.invoke('read-file', path),
  writeFile: (path, content) => ipcRenderer.invoke('write-file', path, content),
  getHomePath: () => ipcRenderer.invoke('get-home-path'),
})

// Verify it's exposed
console.log('window.api should now be available')