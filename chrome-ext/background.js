self.importScripts('../common/common.js');

const jsCheckScript = 'content/octanetopus-check.js';
const cssContentScript = 'content/octanetopus-content.css';
const jsCommonScript = 'common/common.js';
const jsAudioStream = 'content/audio-streams.js';
const jsContentScript = 'content/octanetopus-content.js';
let updatedTabId = 0;

const log = (msg) => {
	console.log(`OCTANETOPUS BACKGROUND PAGE | ${msg}`);
};

const ensureConfigOk = (configObj) => {
	let isSaveNeeded = false;
	// if (configObj.rssFeed && configObj.rssFeed.url === 'http://rss.walla.co.il/feed/22') {
	// 	configObj.rssFeed.url = 'https://rss.walla.co.il/feed/22';
	// 	isSaveNeeded = true;
	// }
	// if (!configObj.audioStreaming) {
	// 	configObj.audioStreaming = {...defaultConfigObj.audioStreaming};
	// 	isSaveNeeded = true;
	// }
	if (isSaveNeeded) {
		saveValues({
			[localStorageConfigKey]: JSON.stringify(configObj)
		});
	}
};

const ensureConfigInStorage = () => {
	log('ensureConfigInStorage');
	let configObj;
	let shouldUseDefaultConfig = true;
	loadValues({
		[localStorageConfigKey]: ''
	}, vals => {
		const savedConfigStr = vals[localStorageConfigKey];
		if (savedConfigStr) {
			configObj = JSON.parse(savedConfigStr);
			shouldUseDefaultConfig = configObj.configVersion !== currentConfigVer;
		}
		if (shouldUseDefaultConfig) {
			saveValues({
				[localStorageConfigKey]: JSON.stringify(defaultConfigObj)
			});
		} else {
			ensureConfigOk(configObj);
		}
	});
};

const injectCss = async (tabId, file) => {
	log(`injecting ${file}`);
	await chrome.scripting.insertCSS({target: {tabId}, files: [file]}, () => {});
};

const injectJs = async (tabId, file) => {
	log(`injecting ${file}`);
	await chrome.scripting.executeScript({target: {tabId}, files: [file]}, () => {});
};

const addMessageListener = () => {
	chrome.runtime.onMessage.addListener((request, sender, responseFunc) => {
		if (request.type === 'octanetopus-content-to-background--inject') {
			log(request.type);
			log('injecting content scripts');
			(async () => {
				await injectCss(updatedTabId, cssContentScript);
				await injectJs(updatedTabId, jsCommonScript);
				await injectJs(updatedTabId, jsAudioStream);
				await injectJs(updatedTabId, jsContentScript);
			})();
		} else if (request.type === 'octanetopus-content-to-background--init') {
			log(request.type);
			log('send init response to content script');
			loadValues({
				[localStorageConfigKey]: ''
			}, vals => {
				responseFunc(
					{
						type: 'octanetopus-background-to-content--config',
						data: vals[localStorageConfigKey]
					}
				);
			});
		} else if (request.type === 'octanetopus-content-to-background--time') {
			log(request.type);
			fetchTime(request.timeZone).then(result => {
				log('send time response to content script');
				responseFunc(result && JSON.stringify(result) || '');
			});
			return true;
		} else if (request.type === 'octanetopus-content-to-background--news') {
			log(request.type);
			fetchNews(result => {
				log('send news response to content script');
				responseFunc(result);
			});
			return true;
		} else if (request.type === 'octanetopus-content-to-background--load-favorite-streams') {
			log(request.type);

			loadValues({
				[localStorageFavoriteStreamsKey]: '[]'
			}, vals => {
				const loadedFavoriteStreamNamesStr = vals[localStorageFavoriteStreamsKey];
				log('send favorite audio streams response to content script');
				responseFunc(loadedFavoriteStreamNamesStr);
			});
		} else if (request.type === 'octanetopus-content-to-background--save-favorite-streams') {
			log(request.type);
			saveValues({
				[localStorageFavoriteStreamsKey]: request.favoriteStreamNamesStr
			});
		}
		return true;
	});
};

const addOnTabCompleteListener = () => {
	chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
		if (!tab || !tab.url) {
			return true;
		}
		loadValues({
			[localStorageConfigKey]: '{}'
		}, vals => {
			const config = JSON.parse(vals[localStorageConfigKey]);
			if (changeInfo.status === 'complete' && config.octaneInstances && config.octaneInstances.length > 0) {
				let found = false;
				config.octaneInstances.forEach(octaneInstance => {
					if (!found && tab.url.includes(octaneInstance.urlPart)) {
						found = true;
						updatedTabId = tabId;
						injectJs(tabId, jsCheckScript).then(()=>{});
					}
				});
			}
		});
		return true;
	});
};

const fetchTime = async (timeZone) => {
	log('fetchTime');
	try {
		const r = await fetch(`http://worldtimeapi.org/api/timezone/${timeZone}`);
		if (!r.ok) {
			log(`Error on fetchTime - ${r.status} ${r.statusText}`);
			return null;
		}
		return await r.json();
	} catch(err) {
		log(`Error on fetchTime - ${err.message || err.toString()}`);
		return null;
	}
};

const fetchNews = (cb) => {
	log('fetchNews');
	const result = '';
	try {
		loadValues({
			[localStorageConfigKey]: '{}'
		}, vals => {
			(async () => {
				const rssFeedUrl = JSON.parse(vals[localStorageConfigKey]).rssFeed.url;
				const res = await fetch(rssFeedUrl);
				const result = await res.text();
				cb(result);
			})();
		});
	} catch (err) {
		log(`Error on fetchNews - ${err.message || err.toString()}`);
		cb(result);
	}
};

// const fetchAudioStreams = async () => {
// 	log('fetchAudioStreams');
// 	try {
// 		const r = await fetch(`https://raw.githubusercontent.com/alm-octane-chrome-ext/alm-octane-chrome-ext/master/audio-streams/audio-streams.json`);
// 		if (!r.ok) {
// 			log(`Error on fetchAudioStreams - ${r.status} ${r.statusText}`);
// 		}
// 		return await r.json();
// 	} catch(err) {
// 		log(`Error on fetchAudioStreams - ${err.message || err.toString()}`);
// 		return [];
// 	}
// };

log('background page loaded');
ensureConfigInStorage();
addMessageListener();
addOnTabCompleteListener();

(async function go() {
	const url = `https://github.houston.softwaregrp.net/api/v3/repos/MQM/mqm/pulls/17021`;
	const headers = {
		'Accept': 'application/vnd.github.text+json',
	};
	try {
		const res = await fetch(url, { headers });
		const json = await res.json();
		console.log(JSON.stringify(json));
	} catch (error) {
		console.log(error);
	}
})();
