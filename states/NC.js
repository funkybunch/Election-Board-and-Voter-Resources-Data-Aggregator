const parser = require('node-html-parser');
const puppeteer = require('puppeteer');

async function getSPAHTML(url){
    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto(url);
        await page.waitForSelector('.ui-ig-record > tr', { timeout: 1000 });

        const body = await page.evaluate(() => {
            return document.querySelector('body').innerHTML;
        });

        await browser.close();
        return body;

    } catch (error) {
        console.log(error);
    }
}

async function parseNCBOEs() {
    const boeHTML = await getSPAHTML('https://vt.ncsbe.gov/BOEInfo/PrintableVersion/');
    let output = [];
    let source = await parser.parse(boeHTML);
    let boes;
    try {
        boes = await source.querySelectorAll('tbody.ui-iggrid-tablebody tr');
        for(let i = 0; i < boes.length; i++) {
            let boe = {};
            boe.name = boes[i].childNodes[0].childNodes[1].childNodes[1].rawText.replace(/\r?\t|\r|\t/g, '');
            boe.website = boes[i].childNodes[0].childNodes[1].childNodes[1].getAttribute("href");
            boe.hours = boes[i].childNodes[0].childNodes[1].childNodes[4].rawText.replace(/\r?\t|\r|\t/g, '');
            boe.director = boes[i].childNodes[1].rawText.replace(/\r?\t|\r|\t/g, '');
            if(boes[i].childNodes[2].childNodes[1].childNodes.length <= 6){
                boe.mailingAddress = {
                    street: boes[i].childNodes[2].childNodes[1].childNodes[1].rawText.replace(/\r?\t|\r|\t/g, ''),
                    cityStateZip: boes[i].childNodes[2].childNodes[1].childNodes[4].innerHTML.replace(/\r?\t|\r|\t/g, '')
                };
            } else {
                boe.mailingAddress = {
                    street: boes[i].childNodes[2].childNodes[1].childNodes[1].rawText.replace(/\r?\t|\r|\t/g, ''),
                    suite: boes[i].childNodes[2].childNodes[1].childNodes[4].rawText.replace(/\r?\t|\r|\t/g, ''),
                    cityStateZip: boes[i].childNodes[2].childNodes[1].childNodes[7].innerHTML.replace(/\r?\t|\r|\t/g, '')
                };
            }
            if(boes[i].childNodes[3].childNodes[1].childNodes.length <= 6){
                boe.mailingAddress = {
                    street: boes[i].childNodes[3].childNodes[1].childNodes[1].rawText.replace(/\r?\t|\r|\t/g, ''),
                    cityStateZip: boes[i].childNodes[3].childNodes[1].childNodes[4].innerHTML.replace(/\r?\t|\r|\t/g, '')
                };
            } else {
                boe.mailingAddress = {
                    street: boes[i].childNodes[3].childNodes[1].childNodes[1].rawText.replace(/\r?\t|\r|\t/g, ''),
                    suite: boes[i].childNodes[3].childNodes[1].childNodes[4].rawText.replace(/\r?\t|\r|\t/g, ''),
                    cityStateZip: boes[i].childNodes[3].childNodes[1].childNodes[7].innerHTML.replace(/\r?\t|\r|\t/g, '')
                };
            }
            boe.phone = boes[i].childNodes[4].childNodes[1].childNodes[1].rawText.replace(/\r?\t|\r|\t/g, '');
            boe.fax = boes[i].childNodes[4].childNodes[1].childNodes[5].rawText.replace(/\r?\t|\r|\t/g, '');
            boe.email = boes[i].childNodes[4].childNodes[1].childNodes[8].rawText.replace(/\r?\t|\r|\t/g, '');

            output.push(boe);
        }
        console.log("Parse Success: Was able to parse NC Board of Elections Data");
        return output;
    } catch(e) {
        console.log("Parse Error: Failed to parse NC Board of Elections Data");
    }
}

module.exports = {
    collect: async () => {
        return {
            boes: await parseNCBOEs()
        };
    }
}
