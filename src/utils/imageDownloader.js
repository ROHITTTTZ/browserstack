const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const logger = require('./logger');

async function downloadImage(imageUrl, fileName) {
  try {
    if (!imageUrl) {
      logger.warn("No image URL provided");
      return;
    }

    const filePath = path.join('images', fileName);

    logger.info(`Downloading image → ${fileName}`);

    const response = await axios({
      url: imageUrl,
      method: 'GET',
      responseType: 'stream'
    });

    await fs.ensureDir('images');

    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', () => {
        logger.info(`Image saved → ${filePath}`);
        resolve();
      });
      writer.on('error', reject);
    });

  } catch (error) {
    logger.error(`Image download failed: ${error.message}`);
  }
}

module.exports = { downloadImage };
