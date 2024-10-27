import { MenuItem, dialog } from 'electron'
import electronUpdater from 'electron-updater'
import { createRequire } from 'module'

const { autoUpdater } = electronUpdater

// For development testing
// autoUpdater.forceDevUpdateConfig = true

const require = createRequire(import.meta.url)
const pkgJson = require('../package.json')
const updateChannel: string | undefined = pkgJson.updateChannel

// Configure the updater
autoUpdater.autoDownload = false
autoUpdater.autoInstallOnAppQuit = true
autoUpdater.autoRunAppAfterInstall = true
autoUpdater.requestHeaders = { 'User-Agent': `Companion Satellite v${autoUpdater.currentVersion}` }
autoUpdater.channel = updateChannel ?? ''

export function isUpdateSupported(): boolean {
	return (
		!!updateChannel &&
		(process.platform === 'win32' || process.platform === 'darwin') &&
		autoUpdater.isUpdaterActive()
	)
}

export class ElectronUpdater {
	readonly menuItem: MenuItem
	readonly installMenuItem: MenuItem

	constructor() {
		this.menuItem = new MenuItem({
			label: 'Check for updates',
			visible: isUpdateSupported(),
			click: () => this.check(true),
		})
		this.installMenuItem = new MenuItem({
			label: 'Install pending update',
			visible: false,
			click: () => this.installPending(),
		})
	}

	installPending(): void {
		autoUpdater
			.downloadUpdate()
			.then(() => {
				autoUpdater.quitAndInstall()
			})
			.catch((e) => {
				dialog.showErrorBox(
					'Install update failed',
					'Failed to download update.\nTry again later, or try installing the update manually.',
				)
				console.log('failed to download', e)
			})
	}

	check(notify = false): void {
		if (!isUpdateSupported()) return

		autoUpdater
			.checkForUpdates()
			.then((info) => {
				this.menuItem.visible = !info
				this.installMenuItem.visible = !!info

				if (!notify) return

				if (info) {
					dialog
						.showMessageBox({
							title: 'Companion Satellite',
							message: 'An update is available',
							buttons: ['Install', 'Cancel'],
						})
						.then((v) => {
							if (v.response === 0) {
								this.installPending()
							}
						})
						.catch((e) => {
							console.error('dialog error', e)
						})
				} else {
					dialog
						.showMessageBox({
							title: 'Companion Satellite',
							message: 'No update is available',
							buttons: ['Close'],
						})
						.catch((e) => {
							console.error('dialog error', e)
						})
				}
			})
			.catch((e) => {
				console.error('Failed to check for updates', e)
			})
	}
}
