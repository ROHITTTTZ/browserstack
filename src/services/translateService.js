const axios = require('axios');
const logger = require('../utils/logger');
const RateLimiter = require('../utils/rateLimiter');
require('dotenv').config();

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const rateLimiter = new RateLimiter(500);

async function translateToEnglish(text) {
  try {
    if (!text) {
      logger.warn("No text provided for translation");
      return null;
    }

    logger.info(`Translating → "${text}"`);

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

    const translatedText = response.data.trans;

    logger.info(`Translated → "${translatedText}"`);

    return translatedText;

  } catch (error) {
    logger.error(`Translation failed: ${error.message}`);
    return null;
  }
}

module.exports = { translateToEnglish };
