/**
 * EL PAÍS Opinion Scraper - Professional Web Scraping Solution
 * Features:
 * - Parallel BrowserStack execution across 5 browsers
 * - Spanish article scraping with English translation  
 * - Image downloading and word frequency analysis
 * - Rate limiting and error handling
 */
 
const { Builder } = require('selenium-webdriver');
const logger = require('./utils/logger');
const scraper = require('./scraper/elpaisScraper');
const translator = require('./services/translateService');
const wordAnalyzer = require('./utils/wordAnalyzer');
const { capabilitiesList } = require('../config/browserCapabilities'); 
const Validation = require('./utils/validation');

require('dotenv').config();

// Validate required environment variables before execution
const validation = Validation.validateEnvironment();
if (!validation.isValid) {
    throw new Error(`Environment validation failed: ${validation.errors.join(', ')}`);
}
console.log('Environment variables validated');

/**
 * Executes complete scraping workflow for a single browser session
 * @param {Object} capabilities - BrowserStack browser configuration
 * @returns {Object} Session results with articles and translations
 */
async function runTest(capabilities) {
    let driver;
    try {
        logger.info(`Starting test → ${capabilities['bstack:options'].sessionName}`);
        
        // Configure BrowserStack with credentials
        const caps = {
            ...capabilities,
            'bstack:options': {
                ...capabilities['bstack:options'],
                userName: process.env.BROWSERSTACK_USERNAME,
                accessKey: process.env.BROWSERSTACK_ACCESS_KEY
            }
        };

        // Initialize WebDriver instance
        driver = await new Builder()
            .usingServer('https://hub.browserstack.com/wd/hub')
            .withCapabilities(caps)
            .build();

        // Execute scraping pipeline
        await scraper.openHomePage(driver);
        await scraper.handleCookiePopup(driver);
        await scraper.navigateToOpinion(driver);

        const articleUrls = await scraper.getFirstFiveArticles(driver);
        const report = [];
        const translatedTitles = [];

        // Loop through each article URL and process it
        for (let i = 0; i < articleUrls.length; i++) {
            const details = await scraper.extractArticleDetails(driver, articleUrls[i], i);
            if (!details) continue;
            const translated = await translator.translateToEnglish(details.title);
            console.log("\n========================================");
            console.log(`ARTICLE ${i + 1} (${caps['bstack:options'].sessionName})`);
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
        console.log(`TITLE TRANSLATION TABLE (${caps['bstack:options'].sessionName})`);
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
        console.log("REPEATED WORD ANALYSIS (>2)");
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

/**
 * Orchestrates parallel execution across all configured browsers
 * Uses Promise.all for true concurrent processing
 */
(async function parallelRunner() {
    try {
        logger.info("Running 5 parallel BrowserStack sessions...");

        // Execute all browser sessions concurrently for maximum efficiency
        await Promise.all(
            capabilitiesList.map(caps => runTest(caps))
        );
        logger.info("All parallel tests completed");
    } catch (error) {
        logger.error(`Parallel execution failed: ${error.message}`);
    }
})();
