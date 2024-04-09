async function getMyPRs(baseUrl, orgName, repoName, userName, authToken) {
	const allMyPrs = [];

	const headers = {
		'Accept': 'application/vnd.github.text+json',
		'Authorization': `token ${authToken}`
	};
	for (let page = 1; page <= 3; page++) {
		let prs;
		const url = `${baseUrl}/api/v3/repos/${orgName}/${repoName}/pulls?per_page=100&page=${page}`;
		try {
			const res = await fetch(url, { headers });
			prs = await res.json();
			const myPrs = prs.filter(pr => pr.user.url.endsWith(`/${userName}`));
			myPrs.forEach(pr => {
				console.log(`id: ${pr.id}, state: ${pr.state}, title: ${pr.title}`);
				allMyPrs.push(pr);
			})
		} catch (error) {
			console.log(error);
		}
	}
	return allMyPrs;
}
