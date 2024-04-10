const log = (msg) => {
	console.log(`pull-patrol POPUP DIALOG | ${msg}`);
};

let initialConfigStr;
let popup;
let container;
let configTextarea;
let configButton;
let goButton;
let cancelButton;
let defaultsButton;
let saveButton;

function setDomElements() {
	log('setDomElements');
	configTextarea = document.getElementById('content--config');
	popup = document.getElementById('popup');
	container = document.getElementById('content--container');
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
	const textAreaErrorClass = 'content--config--error';
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

function createPRLine(pr) {
	const lineElm = document.createElement('div');
	lineElm.classList.add('content--pr-line');

	const lineTopElm = document.createElement('div');
	lineTopElm.classList.add('content--pr-line--top');

	const idElm = document.createElement('a');
	idElm.setAttribute('href', pr.htmlUrl);
	idElm.setAttribute('target', '-blank');
	idElm.classList.add('content--pr-id');
	idElm.innerText = pr.id;
	lineTopElm.appendChild(idElm);

	const stateElm = document.createElement('div');
	stateElm.classList.add('content--pr-state');
	stateElm.classList.add(`content--pr-state--${pr.state}`);
	stateElm.innerText = pr.state;
	lineTopElm.appendChild(stateElm);

	const titleElm = document.createElement('div');
	titleElm.classList.add('content--pr-title');
	titleElm.setAttribute('title', pr.title);
	titleElm.innerText = pr.title;
	lineTopElm.appendChild(titleElm);

	const quickElm = document.createElement('div');
	quickElm.classList.add('build-info');
	const quickLed = document.createElement('div');
	quickLed.classList.add('build-led');
	quickLed.classList.add('build-led--green');
	quickElm.appendChild(quickLed);
	const quickTitle = document.createElement('div');
	quickTitle.classList.add('build-title');
	quickTitle.innerText = 'Q'
	quickElm.appendChild(quickTitle);
	lineTopElm.appendChild(quickElm);

	const fullElm = document.createElement('div');
	fullElm.classList.add('build-info');
	const fullLed = document.createElement('div');
	fullLed.classList.add('build-led');
	fullLed.classList.add('build-led--green');
	fullElm.appendChild(fullLed);
	const fullTitle = document.createElement('div');
	fullTitle.classList.add('build-title');
	fullTitle.innerText = 'F'
	fullElm.appendChild(fullTitle);
	lineTopElm.appendChild(fullElm);

	lineElm.appendChild(lineTopElm);

	if (pr.requestedReviewers && pr.requestedReviewers.length > 0) {
		const lineBottomElm = document.createElement('div');
		lineBottomElm.classList.add('content--pr-line--bottom');

		const peopleElm = document.createElement('div');
		peopleElm.classList.add('content--pr-people');
		peopleElm.innerText = pr.requestedReviewers;
		lineBottomElm.appendChild(peopleElm);

		lineElm.appendChild(lineBottomElm);
	}

	return lineElm;
}

async function onClickGo() {
	log('onClickGo');
	goButton.setAttribute('disabled', 'disabled');
	configButton.setAttribute('disabled', 'disabled');
	try {
		container.innerHTML = '';
		const cnf = JSON.parse(configTextarea.value);
		const myPrs = await getMyPRs(cnf.gitHub.baseUrl, cnf.gitHub.orgName, cnf.gitHub.repoName, cnf.gitHub.userName, cnf.gitHub.authToken);
		console.log(`Found ${myPrs.length} PRs`);
		myPrs.forEach(pr => {
			const prElm = createPRLine(pr);
			container.appendChild(prElm);
		})
	} catch (error) {
		log(error);
	} finally {
		goButton.removeAttribute('disabled');
		configButton.removeAttribute('disabled');
	}
}

document.addEventListener('DOMContentLoaded', onPopupLoad, false);
