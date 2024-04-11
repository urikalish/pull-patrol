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
let toggleOwnerButton;
let toggleReviewerButton;
let toggleAssigneeButton;
let toggleState = {
    owner: true,
    reviewer: true,
    assignee: true
}
let myPrs;

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
    toggleReviewerButton = document.getElementById('popup-toggle-reviewer-button');
    toggleOwnerButton = document.getElementById('popup-toggle-owner-button');
    toggleAssigneeButton = document.getElementById('popup-toggle-assignee-button');
	configTextarea.addEventListener('keyup', onConfigChange);
	configButton.addEventListener('click', onClickConfig);
	goButton.addEventListener('click', onClickGo);
	cancelButton.addEventListener('click', onClickCancel);
	defaultsButton.addEventListener('click', onClickDefaults);
	saveButton.addEventListener('click', onClickSave);
    toggleReviewerButton.addEventListener('click', (event)=> onToggleRole('reviewer', event.currentTarget))
    toggleOwnerButton.addEventListener('click', (event)=>onToggleRole('owner', event.currentTarget))
    toggleAssigneeButton.addEventListener('click', (event)=>onToggleRole('assignee', event.currentTarget))
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

function createPRLine(pr, runsData) {
	const lineElm = document.createElement('div');
	lineElm.classList.add('content--pr-line');
    lineElm.classList.add(pr.prType);

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
	const quickUrl = setRunColor(quickLed, runsData.quick);
	quickElm.appendChild(quickLed);
	const quickTitle = document.createElement(quickUrl ? 'a' : 'div');
	quickTitle.classList.add('build-title');
	quickTitle.innerText = 'Q'
	if (quickUrl) {
		quickTitle.setAttribute('href', quickUrl);
	}
	quickElm.appendChild(quickTitle);
	lineTopElm.appendChild(quickElm);

	const fullElm = document.createElement('div');
	fullElm.classList.add('build-info');
	const fullLed = document.createElement('div');
	fullLed.classList.add('build-led');
	const fullUrl = setRunColor(fullLed, runsData.full);
	fullElm.appendChild(fullLed);
	const fullTitle = document.createElement(fullUrl ? 'a' : 'div');
	fullTitle.classList.add('build-title');
	fullTitle.innerText = 'F'
	if (fullUrl) {
		fullTitle.setAttribute('href', fullUrl);
	}
	fullElm.appendChild(fullTitle);
	lineTopElm.appendChild(fullElm);

	lineElm.appendChild(lineTopElm);

	if (pr.requestedReviewers && pr.requestedReviewers.length > 0) {
		const lineBottomElm = document.createElement('div');
		lineBottomElm.classList.add('content--pr-line--bottom');

		const peopleElm = document.createElement('div');
		peopleElm.classList.add('content--pr-reviewers');
		peopleElm.innerText = pr.requestedReviewers;
		lineBottomElm.appendChild(peopleElm);

		lineElm.appendChild(lineBottomElm);
	}
	if (pr.assignees && pr.assignees.length > 0) {
		const lineBottomElm = document.createElement('div');
		lineBottomElm.classList.add('content--pr-line--bottom');

		const assigneesElm = document.createElement('div');
		assigneesElm.classList.add('content--pr-assignees');
		assigneesElm.innerText = pr.assignees;
		lineBottomElm.appendChild(assigneesElm);

		lineElm.appendChild(lineBottomElm);
	}

	return lineElm;
}
function setRunColor(element, runData) {
	if (runData) {
		runData = runData.sort((rd1, rd2) => rd2.timestamp - rd1.timestamp); // sort by last run
		if (runData[0].inProgress) {
			element.classList.add('build-led--blue');
		} else {
			if (runData[0].result === 'SUCCESS') {
				element.classList.add('build-led--green');
			} else if (runData[0].result === 'FAILURE'){
				element.classList.add('build-led--red');
			} else if (runData[0].result === 'UNSTABLE'){
				element.classList.add('build-led--orange');
			} else {
				element.classList.add('build-led--black');
			}
		}
		return runData[0].url;
	} else {
		element.classList.add('build-led--gray');
	}
}
function onToggleRole(role, button) {
	button.classList.remove('button--toggle--'+toggleState[role]);
    toggleState[role] = !toggleState[role];
    console.log('toggle by '+role+':' + toggleState[role]);
    container.classList.toggle(role, toggleState[role]);
	button.classList.add('button--toggle--'+toggleState[role]);
}
async function onClickGo() {
	log('onClickGo');
	goButton.setAttribute('disabled', 'disabled');
	configButton.setAttribute('disabled', 'disabled');
	try {
		container.innerHTML = '';
		const cnf = JSON.parse(configTextarea.value);
        myPrs = await getMyPRs(cnf.gitHub.baseUrl, cnf.gitHub.orgName, cnf.gitHub.repoName, cnf.gitHub.userName, cnf.gitHub.authToken);
		console.log(`Found ${myPrs.length} PRs`);
        console.log("toggle state for reviewer: " + toggleState.reviewer);
        console.log("toggle state for owner: " + toggleState.owner);
        console.log("toggle state for assignee: " + toggleState.assignee);
		myPrs.forEach(async (pr) => {
			const runsData = await getRunsByBranch(pr.branch);
			const prElm = createPRLine(pr, runsData);
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
