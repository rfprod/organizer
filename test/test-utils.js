const os = require('os');

module.exports = {
	karmaHeadlessChromeFlags: () => {
		const flags = [
			'--headless',
			'--disable-gpu',
			// Without a remote debugging port Chrome exits immediately
			'--remote-debugging-port=9222'
		];
		return flags;
	},
	protractorHeadlessChromeFlags: () => {
		const flags = [
			'--headless',
			'--disable-gpu',
			'--window-size=1680x1024'
		];
		return flags;
	},
	useCPUcores: () => {
		return Math.ceil(os.cpus().length / 2);
	}
};
