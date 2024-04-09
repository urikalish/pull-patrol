const localStorageConfigKey = 'pull-patrol-config';
const defaultConfigObj = {
	configVersion: 1,
	gitHub: {
		repoUrl: 'https://github.houston.softwaregrp.net/MQM/mqm/',
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
