/**
 * Translation Service - API Integration
 * Features:
 * - Rate limiting to prevent API abuse
 * - Response validation and error handling
 * - Comprehensive logging
 */
const axios = require('axios');
const logger = require('../utils/logger');
const RateLimiter = require('../utils/rateLimiter');
const Validation = require('../utils/validation');
require('dotenv').config();

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const rateLimiter = new RateLimiter(500); // 500ms between API calls

/**
 * Translates Spanish text to English using RapidAPI Google Translate
 * @param {string} text - Spanish text to translate
 * @returns {string|null} English translation or null if failed
 */
async function translateToEnglish(text) {
    try {
        // Validate input
        const validation = Validation.validateTranslationInput(text);
        if (!validation.isValid) {
            logger.warn(`Invalid input: ${validation.error}`);
            return null;
        }

        logger.info(`Translating → "${validation.value}"`);

        // Execute API call with rate limiting protection
        const response = await rateLimiter.execute(async () => {
            return await axios({
                method: 'POST',
                url: 'https://google-translate113.p.rapidapi.com/api/v1/translator/text',
                headers: {
                    'Content-Type': 'application/json',
                    'x-rapidapi-host': 'google-translate113.p.rapidapi.com',
                    'x-rapidapi-key': RAPIDAPI_KEY
                },
                data: {
                    from: 'es',
                    to: 'en',
                    text: text
                }
            });
        });

        // Validate API response structure
        if (!response.data || !response.data.trans) {
            logger.warn('Invalid API response');
            return null;
        }
        const translatedText = response.data.trans;
        logger.info(`Translated → "${translatedText}"`);

        return translatedText;
    } catch (error) {
        logger.error(`Translation failed: ${error.message}`);
        return null;
    }
}

module.exports = { translateToEnglish };
