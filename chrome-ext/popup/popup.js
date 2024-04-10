const log = (msg) => {
	console.log(`pull-patrol POPUP DIALOG | ${msg}`);
};

let initialConfigStr;
let popup;
let configTextarea;
let configButton;
let goButton;
let cancelButton;
let defaultsButton;
let saveButton;

function setDomElements() {
	log('setDomElements');
	configTextarea = document.getElementById('popup__content__config');
	popup = document.getElementById('popup');
	goButton = document.getElementById('popup-go-button');
	configButton = document.getElementById('popup-config-button');
	cancelButton = document.getElementById('popup-cancel-button');
	defaultsButton = document.getElementById('popup-defaults-button');
	saveButton = document.getElementById('popup-save-button');
	configTextarea.addEventListener('keyup', onConfigChange);
	configButton.addEventListener('click', onClickConfig);
	goButton.addEventListener('click', onClickGo);
	cancelButton.addEventListener('click', onClickCancel);
	defaultsButton.addEventListener('click', onClickDefaults);
	saveButton.addEventListener('click', onClickSave);
}

function showConfig() {
	log('showConfig');
	popup.classList.toggle('show-config', true);
}

function hideConfig() {
	log('hideConfig');
	popup.classList.toggle('show-config', false);
}

function checkConfig() {
	log('checkConfig');
	const configStr = configTextarea.value;
	try {
		JSON.parse(configStr);
		return true;
	} catch (e) {
		return false;
	}
}

function onPopupLoad() {
	log('onPopupLoad');
	setDomElements();
	loadValues({[localStorageConfigKey]: ''}, (values) => {
		const configStr = values[localStorageConfigKey] || '';
		if (!configStr) {
			initialConfigStr = JSON.stringify(getDefaultConfigObj(), null, 2);
			popup.classList.toggle('show-config', true);
		} else {
			initialConfigStr = JSON.stringify(JSON.parse(configStr), null, 2);
			popup.classList.toggle('show-config', false);
		}
		configTextarea.value = initialConfigStr;
		onConfigChange();
	})
}

function onConfigChange() {
	log('onConfigChange');
	const configOK = checkConfig();
	const canSave = configOK && (initialConfigStr !== configTextarea.value);
	const textAreaErrorClass = 'popup__content__config--error';
	if (configOK) {
		configTextarea.classList.remove(textAreaErrorClass);
	} else {
		configTextarea.classList.add(textAreaErrorClass);
	}
	if (configOK && (JSON.stringify(JSON.parse(configTextarea.value), null, 2) === JSON.stringify(defaultConfigObj, null, 2))) {
		defaultsButton.setAttribute('disabled', 'disabled');
	} else {
		defaultsButton.removeAttribute('disabled');
	}
	if (canSave) {
		saveButton.removeAttribute('disabled');
	} else {
		saveButton.setAttribute('disabled', 'disabled');
	}
}

function onClickConfig() {
	log('onClickConfig');
	showConfig();
}

function onClickCancel() {
	log('onClickCancel');
	hideConfig();
}

function onClickDefaults() {
	log('onClickDefaults');
	configTextarea.value = JSON.stringify(defaultConfigObj, null, 2);
	onConfigChange();
}

function onClickSave() {
	log('onClickSave');
	saveValues({
		[localStorageConfigKey]: configTextarea.value.trim()
	});
	window.close();
}

async function onClickGo() {
	log('onClickGo');
	try {
		const cnf = JSON.parse(configTextarea.value);
		const myPrs = await getMyPRs(cnf.gitHub.baseUrl, cnf.gitHub.orgName, cnf.gitHub.repoName, cnf.gitHub.userName, cnf.gitHub.authToken);
		console.log(`Found ${myPrs.length} PRs`);
	} catch (error) {
		log(error);
	}
}

document.addEventListener('DOMContentLoaded', onPopupLoad, false);


console.log(localStorageConfigKey);
