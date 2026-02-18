/**
 * Rate Limiter - API Protection Utility
 * Prevents API abuse by enforcing minimum delay between requests
 * Essential for:
 * - Avoiding rate limits
 * - Preventing API key suspension
 * - Ensuring reliable service
 */
class RateLimiter {
    constructor(delay = 500) {
        this.lastCall = 0;
        this.delay = delay;
    }
    
    /**
     * Executes function with rate limiting protection
     * @param {Function} fn - Function to execute
     * @returns {Promise} Result of executed function
     */
    async execute(fn) {
        const now = Date.now();
        
        // Check if we need to wait before making API call
        if (now - this.lastCall < this.delay) {
            await new Promise(resolve => 
                setTimeout(resolve, this.delay - (now - this.lastCall))
            );
        }
        this.lastCall = Date.now();
        return await fn();
    }
}

module.exports = RateLimiter;