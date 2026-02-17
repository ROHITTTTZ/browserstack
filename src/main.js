const { Builder } = require('selenium-webdriver');
const logger = require('./utils/logger');
const scraper = require('./scraper/elpaisScraper');
const translator = require('./services/translateService');
const wordAnalyzer = require('./utils/wordAnalyzer');

require('dotenv').config();

const capabilitiesList = [
    {
        browserName: 'Chrome',
        browserVersion: 'latest',
        'bstack:options': {
            os: 'Windows',
            osVersion: '11',
            sessionName: 'Chrome - Windows',
            buildName: 'ElPais Parallel Build'
        }
    },
    {
        browserName: 'Firefox',
        browserVersion: 'latest',
        'bstack:options': {
            os: 'Windows',
            osVersion: '11',
            sessionName: 'Firefox - Windows',
            buildName: 'ElPais Parallel Build'
        }
    },
    {
        browserName: 'Safari',
        browserVersion: 'latest',
        'bstack:options': {
            os: 'OS X',
            osVersion: 'Monterey',
            sessionName: 'Safari - macOS',
            buildName: 'ElPais Parallel Build'
        }
    },
    {
        browserName: 'Chrome',
        'bstack:options': {
            deviceName: 'Samsung Galaxy S22',
            realMobile: true,
            osVersion: '12.0',
            sessionName: 'Samsung Galaxy S22',
            buildName: 'ElPais Parallel Build'
        }
    },
    {
        browserName: 'Safari',
        'bstack:options': {
            deviceName: 'iPhone 14',
            realMobile: true,
            osVersion: '16',
            sessionName: 'iPhone 14',
            buildName: 'ElPais Parallel Build'
        }
    }
];

async function runTest(capabilities) {
    let driver;

    try {
        logger.info(`Starting test → ${capabilities['bstack:options'].sessionName}`);

        const caps = {
            ...capabilities,
            'bstack:options': {
                ...capabilities['bstack:options'],
                userName: process.env.BROWSERSTACK_USERNAME,
                accessKey: process.env.BROWSERSTACK_ACCESS_KEY
            }
        };

        driver = await new Builder()
            .usingServer('https://hub.browserstack.com/wd/hub')
            .withCapabilities(caps)
            .build();

        await scraper.openHomePage(driver);
        await scraper.handleCookiePopup(driver);
        await scraper.navigateToOpinion(driver);

        const articleUrls = await scraper.getFirstFiveArticles(driver);

        const report = [];
        const translatedTitles = [];

        for (let i = 0; i < articleUrls.length; i++) {

            const details = await scraper.extractArticleDetails(driver, articleUrls[i], i);
            if (!details) continue;

            const translated = await translator.translateToEnglish(details.title);

            console.log("\n========================================");
            console.log(`📰 ARTICLE ${i + 1} (${caps['bstack:options'].sessionName})`);
            console.log("========================================");

            console.log(`TITLE (ES): ${details.title}\n`);

            console.log("CONTENT (ES):");
            console.log(details.content || "No content extracted");

            console.log(`\nTITLE (EN): ${translated || "Translation Failed"}`);

            report.push({
                index: i + 1,
                title_es: details.title,
                title_en: translated || "Translation Failed"
            });

            if (translated) translatedTitles.push(translated);
        }
        console.log("\n========================================");
        console.log(`📊 TITLE TRANSLATION TABLE (${caps['bstack:options'].sessionName})`);
        console.log("========================================\n");

        console.log("┌────┬──────────────────────────────────────────────┬──────────────────────────────────────────────┐");
        console.log("│ #  │ Title (ES)                                   │ Title (EN)                                   │");
        console.log("├────┼──────────────────────────────────────────────┼──────────────────────────────────────────────┤");

        report.forEach(article => {
            const es = article.title_es.padEnd(44).substring(0, 44);
            const en = article.title_en.padEnd(44).substring(0, 44);

            const idx = article.index.toString().padStart(2);
            console.log(`│ ${idx} │ ${es} │ ${en} │`);
        });

        console.log("└────┴──────────────────────────────────────────────┴──────────────────────────────────────────────┘");

        const repeatedWords = wordAnalyzer.analyzeRepeatedWords(translatedTitles);

        console.log("\n========================================");
        console.log("🔁 REPEATED WORD ANALYSIS (>2)");
        console.log("========================================\n");

        if (Object.keys(repeatedWords).length === 0) {
            console.log("No words repeated more than twice across translated titles.");
        } else {
            Object.entries(repeatedWords).forEach(([word, count]) => {
                console.log(`${word} → ${count}`);
            });
        }

        logger.info(`Completed test → ${caps['bstack:options'].sessionName}`);

    } catch (error) {
        logger.error(`Execution failed (${capabilities['bstack:options'].sessionName}): ${error.message}`);
    } finally {
        if (driver) {
            await driver.quit();
            logger.info(`Browser closed → ${capabilities['bstack:options'].sessionName}`);
        }
    }
}

(async function parallelRunner() {
    try {
        logger.info("🚀 Running 5 parallel BrowserStack sessions...");

        await Promise.all(
            capabilitiesList.map(caps => runTest(caps))
        );

        logger.info("🎯 All parallel tests completed");

    } catch (error) {
        logger.error(`Parallel execution failed: ${error.message}`);
    }
})();
