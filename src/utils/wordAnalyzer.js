const logger = require('./logger');

function analyzeRepeatedWords(titles) {
  try {
    if (!titles || titles.length === 0) {
      logger.warn("No titles provided for analysis");
      return {};
    }

    logger.info("Analyzing repeated words across translated titles");

    const frequency = {};

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
