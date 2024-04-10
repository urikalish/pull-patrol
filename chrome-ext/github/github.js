async function getMyPRs(baseUrl, orgName, repoName, userName, authToken) {
	const allMyPrs = [];

	const headers = {
		'Accept': 'application/vnd.github.text+json',
		'Authorization': `token ${authToken}`
	};
	for (let page = 1; page <= 3; page++) {
		let prs;
		const url = `${baseUrl}/api/v3/repos/${orgName}/${repoName}/pulls?state=all&per_page=100&page=${page}`;
		try {
			const res = await fetch(url, { headers });
			prs = await res.json();
			const myPrs = prs.filter(pr => {
				if (pr.user.url.endsWith(`/${userName}`)) {
					return true;
				}
				if (pr['requested_reviewers'] && pr['requested_reviewers'].length > 0) {
					return !!pr['requested_reviewers'].find(rr => rr['login'] === userName);
				}
				if (pr['assignees'] && pr['assignees'].length > 0) {
					return !!pr['assignees'].find(rr => rr['login'] === userName);
				}
				return false;
			});
			myPrs.forEach(pr => {
				const prRecord = {
					id: pr.id,
					htmlUrl: pr['html_url'],
					state: pr.state,
					title: pr.title,
					branch: pr.head.ref,
					requestedReviewers: pr['requested_reviewers'] ? pr['requested_reviewers'].map(rr => rr['login']) : [],
					assignees: pr['assignees'] ? pr['assignees'].map(rr => rr['login']) : [],
					prType: getPrType(pr['requested_reviewers'],pr['assignees'], userName)
				}
				//console.log('----------------------------------------')
				//console.log(JSON.stringify(pr));
				//console.log(prRecord);
				allMyPrs.push(prRecord);
			})
		} catch (error) {
			console.log(error);
		}
	}
	return allMyPrs;
}
function getPrType(reviewers, assignees, userName){
	if (reviewers.length > 0){
		for (let i=0; i< reviewers.length; i++) {
			if (reviewers[i].login === userName){
				return "reviewer";
			}
		}
	}
	if (assignees.length > 0){
		for (let i=0; i< assignees.length; i++) {
			if (assignees[i].login === userName){
				return "assignee";
			}
		}
	}
	return "owner";
}