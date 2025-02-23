/* Based on https://kilianvalkhof.com/2019/electron/notarizing-your-electron-application/ */

// eslint-disable-next-line n/no-extraneous-require, @typescript-eslint/no-require-imports
const { notarize } = require('@electron/notarize')

exports.default = async function notarizing(context) {
	const { electronPlatformName, appOutDir } = context
	if (electronPlatformName !== 'darwin') {
		return
	}

	if (!process.env.APPLEID || !process.env.APPLEIDPASS || !process.env.APPLETEAMID) {
		console.log('Skipping notarizing, due to missing APPLEID, APPLETEAMID or APPLEIDPASS environment variables')
		return
	}

	const appName = context.packager.appInfo.productFilename

	return await notarize({
		appBundleId: 'companion.bitfocus.no',
		appPath: `${appOutDir}/${appName}.app`,
		appleId: process.env.APPLEID,
		appleIdPassword: process.env.APPLEIDPASS,
		teamId: process.env.APPLETEAMID,
	})
}
