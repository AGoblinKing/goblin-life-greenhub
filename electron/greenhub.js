const { BrowserWindow, app, session } = require('electron')
const serve = require('electron-serve')
const electronDl = require('electron-dl')

const { greenhub, openDirectoryOnSave } = require('../package.json')

electronDl({
	directory: `${process.cwd()}/saves`,
	openFolderWhenDone: openDirectoryOnSave,
})

const settings = require('./settings.js')

const args = process.argv.join('|')
const dev = args.indexOf('dev') !== -1
const steam = args.indexOf('steam') !== -1

let win
const root = serve({ directory: 'www' })

// persist key/value store into a JSON file
function Settings(windowName) {
	let window, windowState

	function setBounds() {
		// Restore from appConfig
		if (settings.has(windowName)) {
			windowState = settings.get(windowName)
			return
		}

		// Default
		windowState = {
			x: undefined,
			y: undefined,
			width: 1024,
			height: 800,
		}
	}

	function saveState() {
		if (!windowState.isMaximized) {
			windowState = window.getBounds()
		}
		windowState.isMaximized = window.isMaximized()
		settings.set(windowName, windowState)
	}

	function track(win) {
		window = win
		;['resize', 'move', 'close'].forEach((event) => {
			win.on(event, saveState)
		})
	}

	setBounds()

	return {
		x: windowState.x,
		y: windowState.y,
		width: windowState.width,
		height: windowState.height,
		isMaximized: windowState.isMaximized,
		track,
	}
}

function createWindow() {
	root(win)

	const mainWindowStateKeeper = Settings('main')
	win = new BrowserWindow({
		backgroundColor: 'black',
		x: mainWindowStateKeeper.x,
		y: mainWindowStateKeeper.y,
		width: mainWindowStateKeeper.width,
		height: mainWindowStateKeeper.height,
		webPreferences: {
			nodeIntegration: false,
		},
		icon: 'build/icon.png',
	})

	win.setMenu(null)

	if (dev) {
		win.webContents.openDevTools({ detach: true, activate: false })
	}

	mainWindowStateKeeper.track(win)

	win.webContents.on('did-fail-load', () => {
		win.loadURL('app://index.html')
	})

	win.loadURL(dev ? greenhub.dev : greenhub.live)
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit()
	}
})

// Steam!
if (steam) {
	const greenworks = require('./greenworks')

	if (greenworks.init()) console.log('Steam API has been initalized.')
}
