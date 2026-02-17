class RateLimiter {
    constructor(delay = 500) {
        this.lastCall = 0;
        this.delay = delay;
    }
    
    async execute(fn) {
        const now = Date.now();
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