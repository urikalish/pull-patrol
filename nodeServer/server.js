// Import necessary modules
const express = require('express');
const cors = require('cors');
const axios = require('axios');
// Import the dotenv package
require('dotenv').config();

const app = express();
const port = 3000; // Set your desired port number

const JENKINS_USERNAME = process.env.JENKINS_USERNAME;
const JENKINS_API_TOKEN = process.env.JENKINS_API_TOKEN;
const JENKINS_BASE_URL = 'https://jenkins-custom.octane.admlabs.aws.swinfra.net/view/%20%20MQM-CUSTOM-master-All-Jobs/view/All-MQM-Custom-Branch-CI/';
const JENKINS_CUSTOM_QUICK_DEV_URL = 'job/MQM-Root-POSTGRESQL-DEV-quick-custom-master-';
// const JENKINS_CUSTOM_QUICK_PROD_URL = 'job/MQM-Root-POSTGRESQL-PROD-quick-custom-master-';
const JENKINS_CUSTOM_FULL_URL = 'job/MQM-Root-POSTGRESQL-full-custom-master-';
const URL_SUFFIX= '/api/json'

sendRequestToJenkins = async(url) => {
    const request = `${url}${URL_SUFFIX}`;
    return await axios.get(request, {
        auth: {
          username: JENKINS_USERNAME,
          password: JENKINS_API_TOKEN
        },
    });
}

checkAllJobsInJenkins = async (jenkins_job_url) => {
    const jobs = [];

    for (let i=1; i <=5; i++) {
        const url = `${jenkins_job_url}${i}`;
        const response = await sendRequestToJenkins(url);
        const builds = response.data.builds;
        const numbers = builds.map(b => b.number);
        for (let jobNumber=0; jobNumber < 5; jobNumber++) {
            let urlJob = `${url}/${numbers[jobNumber]}`;
            const res = await sendRequestToJenkins(urlJob);
            const jobResult = res.data.result;
            const jobInProgress = res.data.inProgress;
            const jobUrl = res.data.url;
            const jobTimestamp = res.data.timestamp;
            // find username
            let action = res.data.actions.find(a => a.causes);
            const causes = action.causes.find(c => c.userId);
            const userId = causes.userId;
            const username = causes.userName;
            // find branch name
            action = res.data.actions.find(a => a.parameters);
            const branch = action.parameters.find(p => p.name === 'SCM_BRANCH');
            const branchName = branch.value;
            const rootJobName = action.parameters.find(p => p.name === 'ROOT_JOB_NAME');
            const jobName = rootJobName.value;
            jobs.push({
                name: jobName,
                number: numbers[jobNumber],
                result: jobResult,
                inProgress: jobInProgress,
                url: jobUrl,
                timestamp: jobTimestamp,
                userId,
                username,
                branchName
            })
        }
    }

    // convert array to dictionary
    return jobs.reduce((acc, jobs) => {
        const key = jobs.branchName;
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(jobs); // Add the entire object to the array under the key
        return acc;
      }, {});
}

const interval = 5 * 60 * 1000;
const quick_dev_url = `${JENKINS_BASE_URL}${JENKINS_CUSTOM_QUICK_DEV_URL}`;
// const quick_prod_url = `${JENKINS_BASE_URL}${JENKINS_CUSTOM_QUICK_PROD_URL}`;
const full_url = `${JENKINS_BASE_URL}${JENKINS_CUSTOM_FULL_URL}`;

let dictQuickDevJobs, dictFullJobs;

init = async() => {
    dictQuickDevJobs = await checkAllJobsInJenkins(quick_dev_url);
    // dictQuickProdJobs = await checkAllJobsInJenkins(quick_prod_url);
    dictFullJobs = await checkAllJobsInJenkins(full_url);
    console.log('finish initialization, server is ready..');
}

init();

setInterval(init, interval);

app.use(cors());
// Define a GET route
app.get('/get-runs-by-branch', (req, res) => {
    const brachName = req.query.branchName;
    const result = dictQuickDevJobs[brachName];
    // const result2 = dictQuickProdJobs[brachName];
    const result3 = dictFullJobs[brachName];

    const data = {
        'quick': result,
        // 'quickProd': result2,
        'full': result3,
    }

    // Send the array as a JSON response
    res.json({ data });
});

// Start the server
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
