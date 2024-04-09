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

// (async function go() {
// 	const url = `https://github.houston.softwaregrp.net/api/v3/repos/MQM/mqm/pulls/17021`;
// 	const headers = {
// 		'Accept': 'application/vnd.github.text+json',
// 	};
// 	try {
// 		const res = await fetch(url, { headers });
// 		const json = await res.json();
// 		console.log(JSON.stringify(json));
// 	} catch (error) {
// 		console.log(error);
// 	}
// })();
