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
  }
})

// Verify it's exposed
console.log('window.api should now be available')