async function getRunsByBranch(branchName) {

    const serverUrl = 'http://localhost:3000';
    //branchName = 'defect_2477138_modify_lookup_filter_message_idogal';

	const url = `${serverUrl}/getRunsByBranch?branchName=${branchName}`;

	try {
		const response = await fetch(url);
		const result = await response.json();
		return result.data;
	} catch (e) {
		console.log(e);
	}
}


// async function getMyBuilds(baseUrl) {
//     const quicCustomMaster1_url = 'https://jenkins-custom.octane.admlabs.aws.swinfra.net/view/%20%20MQM-CUSTOM-master-All-Jobs/view/All-MQM-Custom-Branch-CI/job/MQM-Root-POSTGRESQL-DEV-quick-custom-master-1/api/json';

//     const username = '';
//     const apiToken = '';

//     try {
//         const res = await fetch(quicCustomMaster1_url, {headers: {
//             'Authorization': 'Basic ' + btoa(username + ":" + apiToken),
//           }});
//         const result = await res.json();
//         console.log(result);
//     } catch (e) {
//         console.log(e);
//     }
// }
