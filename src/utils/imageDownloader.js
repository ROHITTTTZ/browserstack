/**
 * Image Downloader - Media Management
 * Features:
 * - URL validation
 * - Directory creation
 * - Error handling and logging
 * - File system operations
 */

const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const logger = require('./logger');
const Validation = require('./validation');

/**
 * Downloads and saves image from URL to local file system
 * @param {string} imageUrl - URL of image to download
 * @param {string} filename - Local filename for saved image
 * @returns {boolean} Success status of download operation
 */
async function downloadImage(imageUrl, fileName) {
  try {
    // Validate URL
    const urlValidation = Validation.validateUrl(imageUrl);
    if (!urlValidation.isValid) {
      logger.warn(`Invalid image URL: ${urlValidation.error}`);
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
