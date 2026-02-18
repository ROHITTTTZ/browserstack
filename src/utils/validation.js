
/**
 * Input Validation Utilities - Data Validation
 * Features:
 * - Type checking
 * - String validation
 * - URL validation
 * - Edge case handling
 */

class Validation {

    /**
     * Validates required environment variables
     * @returns {Object} Validation result with isValid and errors array
     */
    static validateEnvironment() {
        const result = { isValid: false, errors: [] };
        const requiredVars = [
            'BROWSERSTACK_USERNAME',
            'BROWSERSTACK_ACCESS_KEY',
            'RAPIDAPI_KEY'
        ];

        requiredVars.forEach(envVar => {
            if (!process.env[envVar]) {
                result.errors.push(`Missing required environment variable: ${envVar}`);
            }
        });

        if (result.errors.length === 0) {
            result.isValid = true;
        }

        return result;
    }

    /**
     * Validates text input for translation
     * @param {*} text - Input to validate
     * @returns {Object} Validation result with isValid and sanitized value
     */
    static validateTranslationInput(text) {
        const result = { isValid: false, value: null, error: null };

        if (text === null || text === undefined) {
            result.error = 'Input cannot be null or undefined';
            return result;
        }

        if (typeof text !== 'string') {
            result.error = 'Input must be a string';
            return result;
        }

        const trimmedText = text.trim();
        if (trimmedText.length === 0) {
            result.error = 'Input cannot be empty';
            return result;
        }

        if (trimmedText.length > 1000) {
            result.error = 'Input too long - maximum 1000 characters';
            result.value = trimmedText.substring(0, 1000);
        } else {
            result.value = trimmedText;
        }

        result.isValid = true;
        return result;
    }

    /**
     * Validates article title
     * @param {*} title - Title to validate
     * @returns {Object} Validation result with isValid and sanitized value
     */
    static validateTitle(title) {
        const result = { isValid: false, value: null, error: null };

        if (title === null || title === undefined) {
            result.error = 'Title cannot be null or undefined';
            return result;
        }

        if (typeof title !== 'string') {
            result.error = 'Title must be a string';
            return result;
        }

        const trimmedTitle = title.trim();
        if (trimmedTitle.length === 0) {
            result.error = 'Title cannot be empty';
            return result;
        }

        if (trimmedTitle.length > 1000) {
            result.error = 'Title too long - maximum 1000 characters';
            result.value = trimmedTitle.substring(0, 1000);
        } else {
            result.value = trimmedTitle;
        }

        result.isValid = true;
        return result;
    }

    /**
     * Validates URL for article links
     * @param {*} url - URL to validate
     * @returns {Object} Validation result with isValid and error
     */
    static validateUrl(url) {
        const result = { isValid: false, error: null };
        
        if (!url || typeof url !== 'string') {
            result.error = 'URL must be a non-empty string';
            return result;
        }
        
        try {
            const urlObj = new URL(url);
            if (!['http:', 'https:'].includes(urlObj.protocol)) {
                result.error = 'URL must use HTTP or HTTPS protocol';
                return result;
            }
            result.isValid = true;
            return result;
        } catch (error) {
            result.error = 'Invalid URL format';
            return result;
        }
    }
}

module.exports = Validation;