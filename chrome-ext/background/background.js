self.importScripts('../config/config.js');

const log = (msg) => {
	console.log(`pull-patrol BACKGROUND PAGE | ${msg}`);
};

const ensureConfigInStorage = () => {
	log('ensureConfigInStorage');
	let configObj;
	loadValues({
		[localStorageConfigKey]: ''
	}, values => {
		const savedConfigStr = values[localStorageConfigKey];
		if (savedConfigStr) {
			configObj = JSON.parse(savedConfigStr);
		} else {
			configObj = defaultConfigObj;
			saveValues({
				[localStorageConfigKey]: JSON.stringify(configObj)
			});
		}
	});
};

log('background page loaded');
ensureConfigInStorage();
