const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const fs = require('fs')
const { exec } = require('child_process')

function createWindow() {
  // Preload path - adjust based on your file structure
  const preloadPath = path.join(__dirname, 'preload.js')
  
  console.log('Preload path:', preloadPath)
  console.log('__dirname:', __dirname)
  
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  // During development: point to React dev server
  // After build: load the built files
  if (!app.isPackaged) {
    win.loadURL('http://localhost:3000')
    win.webContents.openDevTools()
  } else {
    win.loadFile(path.join(__dirname, 'build', 'index.html'))
    win.webContents.openDevTools() // Add this to see errors in production
  }
}

// Handle save file
ipcMain.handle('save-file', async (event, filename, content) => {
  try {
    const filePath = path.join(app.getPath('userData'), filename)
    fs.writeFileSync(filePath, content)
    console.log('File saved to:', filePath)
    return { success: true, path: filePath }  // ← Must return this!
  } catch (error) {
    console.error('Save error:', error)
    return { success: false, error: error.message }  // ← Must return this!
  }
})

// Handle run command
ipcMain.handle('run-command', async (event, command) => {
  return new Promise((resolve, reject) => {
    exec(command, { cwd: app.getPath('userData') }, (err, stdout, stderr) => {
      if (err) {
        console.error('Command error:', stderr)
        resolve({ success: false, stdout: '', stderr: stderr })  // ← Must resolve!
      } else {
        console.log('Command executed:', command)
        console.log('Output:', stdout)
        resolve({ success: true, stdout: stdout, stderr: stderr })  // ← Must resolve!
      }
    })
  })
})

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})