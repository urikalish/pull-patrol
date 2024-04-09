const log = (msg) => {
	console.log(`pull-patrol POPUP DIALOG | ${msg}`);
};

let initialConfigStr;
let configTextarea;
let cancelButton;
let defaultsButton;
let saveButton;

const setDomElements = () => {
	log('setDomElements');
	configTextarea = document.getElementById('popup__content__config');
	cancelButton = document.getElementById('popup-cancel-button');
	defaultsButton = document.getElementById('popup-defaults-button');
	saveButton = document.getElementById('popup-save-button');
	configTextarea.addEventListener('keyup', onConfigChange);
	cancelButton.addEventListener('click', onClickCancel);
	defaultsButton.addEventListener('click', onClickDefaults);
	saveButton.addEventListener('click', onClickSave);
};

const checkConfig = () => {
	log('checkConfig');
	const configStr = configTextarea.value;
	try {
		JSON.parse(configStr);
		return true;
	} catch (e) {
		return false;
	}
};

const onPopupLoad = () => {
	log('onPopupLoad');
	setDomElements();
	loadValues({
		[localStorageConfigKey]: '{}'
	}, values => {
		initialConfigStr = JSON.stringify(JSON.parse(values[localStorageConfigKey]), null, 2);
		configTextarea.value = initialConfigStr;
		onConfigChange();
	});
};

const onConfigChange = () => {
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
};

const onClickCancel = () => {
	log('onClickCancel');
	window.close();
};

const onClickDefaults = () => {
	log('onClickDefaults');
	configTextarea.value = JSON.stringify(defaultConfigObj, null, 2);
	onConfigChange();
};

const onClickSave = () => {
	log('onClickSave');
	saveValues({
		[localStorageConfigKey]: configTextarea.value.trim()
	});
	window.close();
};

document.addEventListener('DOMContentLoaded', onPopupLoad, false);
