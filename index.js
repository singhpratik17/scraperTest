const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    try {
        const browser = await puppeteer.launch({ headless: false });
        const page = await browser.newPage();
        await page.setRequestInterception(true);

        // blocks css, fonts and images
        page.on('request', (req) => {
            if (req.resourceType() == 'stylesheet' || req.resourceType() == 'font' || req.resourceType() == 'image') {
                req.abort();
            }
            else {
                req.continue();
            }
        });

        await page.goto('https://jobs.uhsinc.com/careers/jobs?page=2&limit=100', { waitUntil: 'networkidle2' });


        const jobsArr = await page.evaluate(() => {
            let jobs = [];
            const matPanels = document.querySelectorAll('.mat-expansion-panel');
            matPanels.forEach((item) => {
                const jobTitle = item.querySelector('.job-title .job-title-link span').innerText;
                const jobReqId = item.querySelector('.req-id span').innerText;
                const jobLink = item.querySelector('.job-title .job-title-link').getAttribute('href');
                const jobFacility = item.querySelector('.job-result__brand p .label-value').innerText;
                const jobLocation = item.querySelector('.job-result__location p .label-value').innerText;

                jobs.push({ jobTitle, jobLink: `https://jobs.uhsinc.com/${jobLink}`, jobFacility, jobLocation, jobReqId });
            });

            return jobs;
        });

        fs.writeFileSync(`${Date.now()}.json`, JSON.stringify(jobsArr, null, 2), (err) => err ? console.log(err) : console.log("Saved to File."));

        await browser.close();
    }
    catch (e) {
        console.log(e);
    }
})();