const localStorageConfigKey = 'pull-patrol-config';
const defaultConfigObj = {
	configVersion: 1,
	gitHub: {
		baseUrl: 'https://github.houston.softwaregrp.net',
		orgName: 'MQM',
		repoName: 'mqm',
		userName: 'uri-kalish',
		authToken: 'ghp_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'
	}
};

function loadValues(obj, cb) {
	chrome.storage.local.get(obj, vals => {
		cb(vals);
	});
}

function saveValues(obj) {
	for (let [k, v] of Object.entries(obj)) {
		chrome.storage.local.set({[k]: v}, () => {});
	}
}

function getDefaultConfigObj() {
	return defaultConfigObj;

function loadConfig(cb) {
	loadValues({[localStorageConfigKey]: ''},
	values => {
			cb(values[localStorageConfigKey] || '');
		});
	}
}

function saveConfig(configObj) {
	saveValues({
		[localStorageConfigKey]: JSON.stringify(configObj)
	});
}
