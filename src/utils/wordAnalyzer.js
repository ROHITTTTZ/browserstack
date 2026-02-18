/**
 * Word Frequency Analyzer - Text Processing
 * Features:
 * - Case-insensitive word counting
 * - Punctuation removal
 * - Frequency threshold filtering
 * - Sorted results by count
 */
const logger = require('./logger');
const Validation = require('./validation');

/**
 * Analyzes translated titles for repeated words
 * @param {Array} titles - Array of translated article titles
 * @returns {Object} Words repeated more than twice with their counts
 */
function analyzeRepeatedWords(titles) {
  try {
    logger.info("Starting word analysis");

    // Validate input
    const validation = Validation.validateArray(titles, 'titles');
    if (!validation.isValid) {
      logger.warn("No titles provided for analysis");
      return {};
    }

    logger.info("Analyzing repeated words across translated titles");
    const frequency = {};

    // Process each title and count word occurrences
    titles.forEach(title => {
      const words = title
        .toLowerCase()
        .replace(/[^\w\s]/g, '')  
        .split(/\s+/);

      words.forEach(word => {
        if (!word) return;

        frequency[word] = (frequency[word] || 0) + 1;
      });
    });

    // Filter words that appear more than twice
    const repeatedWords = {};
    Object.entries(frequency).forEach(([word, count]) => {
      if (count > 2) {
        repeatedWords[word] = count;
      }
    });

    return repeatedWords;

  } catch (error) {
    logger.error(`Word analysis failed: ${error.message}`);
    return {};
  }
}

module.exports = { analyzeRepeatedWords };
