const { By, until } = require('selenium-webdriver');
const settings = require('../../config/settings');
const logger = require('../utils/logger');
const imageDownloader = require('../utils/imageDownloader');

async function openHomePage(driver) {
    try {
        logger.info(`Opening homepage → ${settings.BASE_URL}`);

        await driver.get(settings.BASE_URL);

        await driver.wait(
            until.elementLocated(By.css('body')),
            settings.WAIT_TIMEOUT
        );

        logger.info("Homepage loaded successfully");

    } catch (error) {
        logger.error(`Failed to load homepage: ${error.message}`);
        throw error;
    }
}

async function handleCookiePopup(driver) {
    try {
        logger.info("Checking for cookie consent popup");

        const acceptButton = await driver.wait(
            until.elementLocated(By.xpath("//button[contains(., 'Accept')]")),
            10000
        );

        await driver.wait(until.elementIsVisible(acceptButton), 3000);
        await driver.wait(until.elementIsEnabled(acceptButton), 3000);

        logger.info("Accepting cookies");
        await acceptButton.click();

        logger.info("Cookie popup handled successfully");

    } catch (error) {
        logger.warn("Cookie popup not found or already handled");
    }
}

async function navigateToOpinion(driver) {
    try {
        logger.info("Navigating to Opinion section");

        const opinionLink = await driver.wait(
            until.elementLocated(By.xpath("//a[contains(., 'Opinión')]")),
            settings.WAIT_TIMEOUT
        );

        await driver.wait(until.elementIsVisible(opinionLink), 3000);
        await driver.wait(until.elementIsEnabled(opinionLink), 3000);

        logger.info("Clicking Opinión link");
        await opinionLink.click();

        await driver.wait(
            until.urlContains('/opinion'),
            settings.WAIT_TIMEOUT
        );

        logger.info("Opinion page loaded successfully");

    } catch (error) {
        logger.error(`Failed to navigate to Opinion: ${error.message}`);
        throw error;
    }
}

async function getFirstFiveArticles(driver) {
    try {
        logger.info("Locating Opinion articles");

        await driver.wait(
            until.elementsLocated(By.css('article')),
            settings.WAIT_TIMEOUT
        );

        const articles = await driver.findElements(By.css('article'));
        logger.info(`Total articles found → ${articles.length}`);

        const articleUrls = [];

        for (let article of articles) {
            try {
                let headlineLink;

                try {
                    headlineLink = await article.findElement(By.css('h2 a'));
                } catch {
                    headlineLink = await article.findElement(By.css('h3 a'));
                }
                const url = await headlineLink.getAttribute('href');

                if (
                    url &&
                    url.includes('/opinion/') &&
                    /\d{4}-\d{2}-\d{2}/.test(url)
                ) {
                    if (!articleUrls.includes(url)) {
                        logger.info(`Valid article → ${url}`);
                        articleUrls.push(url);
                    }
                }

                if (articleUrls.length >= settings.MAX_ARTICLES) break;

            } catch (err) {
                logger.warn(`Skipping non-article block: ${err.message}`);
            }
        }

        logger.info(`Collected ${articleUrls.length} valid articles`);
        return articleUrls;

    } catch (error) {
        logger.error(`Failed to extract articles: ${error.message}`);
        throw error;
    }
}

async function extractArticleDetails(driver, articleUrl, index) {
    try {
        logger.info(`Opening article ${index + 1}`);
        await driver.get(articleUrl);

        await driver.wait(
            until.elementLocated(By.css('h1')),
            settings.WAIT_TIMEOUT
        );

        const title = await driver.findElement(By.css('h1')).getText();

        const galleryIndicator = await driver.findElements(
            By.css('.gallery, [class*="galeria"], body.tpl-a-fotogaleria')
        );

        const articleType =
            galleryIndicator.length > 0
                ? "Gallery / Photo Article"
                : "Standard Article";

        logger.info(`Article ${index + 1} type → ${articleType}`);
        const content = await extractContent(driver);
        const images = await driver.findElements(By.css('figure img'));

        let imageUrl = null;

        if (images.length > 0) {
            imageUrl = await images[0].getAttribute('src');

            if (imageUrl) {
                logger.info(`Cover image found → ${imageUrl}`);

                await imageDownloader.downloadImage(
                    imageUrl,
                    `article_${index + 1}.jpg`
                );
            }
        } else {
            logger.warn(`No cover image for article ${index + 1}`);
        }

        logger.info(`Extracted article ${index + 1}`);

        return {
            title,
            content,
            imageUrl,
            articleType
        };

    } catch (error) {
        logger.error(`Failed article ${index + 1}: ${error.message}`);
        return null;
    }
}

async function extractContent(driver) {
    try {

        const paragraphs = await driver.findElements(By.css('article p'));

        const content = [];

        for (const p of paragraphs) {
            const text = (await p.getText()).trim();

            if (
                text.length > 80 &&                 
                !/^[A-Z\s]{5,}$/.test(text)        
            ) {
                content.push(text);
            }
        }

        if (content.length > 0) {
            logger.info(`Extracted ${content.length} paragraphs`);
            return content.join("\n\n");
        }

        const standfirst = await driver.findElements(By.css('.a_st'));

        if (standfirst.length > 0) {
            const summary = (await standfirst[0].getText()).trim();

            if (summary.length > 20) {   
                logger.info("Using standfirst summary (.a_st)");
                return summary;
            }
        }

        return "⚠️ No meaningful textual content detected";

    } catch (error) {
        logger.warn(`Content extraction issue: ${error.message}`);
        return "⚠️ Content extraction failed";
    }
}





// ======================================================
// EXPORTS
// ======================================================
module.exports = {
    openHomePage,
    handleCookiePopup,
    navigateToOpinion,
    getFirstFiveArticles,
    extractArticleDetails
};
