class CreditService {
  constructor() {
    this.lastErrorTime = null;
    this.retryAttempts = 0;
    this.maxRetries = 3;
  }

  async useCredit() {
    if (this.lastErrorTime) {
      // Exponential backoff: 2^attempts * 1000ms (1s, 2s, 4s, etc)
      const waitTime = Math.min(Math.pow(2, this.retryAttempts) * 1000, 8000);
      const timeElapsed = Date.now() - this.lastErrorTime;
      
      if (timeElapsed < waitTime) {
        const waitSeconds = Math.ceil((waitTime - timeElapsed) / 1000);
        throw new Error(`API is cooling down. Please wait ${waitSeconds} seconds.`);
      }
      
      // Reset error state after wait time
      this.lastErrorTime = null;
      this.retryAttempts = 0;
    }
    
    return true;
  }

  handleApiError(error) {
    // Check for specific OpenAI API credit/rate limit errors
    if (error.response?.status === 429 || 
        error.message?.includes('quota') || 
        error.message?.includes('rate limit') ||
        error.message?.includes('capacity')) {
      
      this.lastErrorTime = Date.now();
      this.retryAttempts = Math.min(this.retryAttempts + 1, this.maxRetries);

      const waitTime = Math.pow(2, this.retryAttempts);
      throw new Error(`API capacity reached. System will automatically retry in ${waitTime} seconds.`);
    }
    
    // Reset retry attempts for non-capacity errors
    this.retryAttempts = 0;
    throw error;
  }

  getUsageStats() {
    const now = Date.now();
    const cooldownRemaining = this.lastErrorTime ? 
      Math.pow(2, this.retryAttempts) * 1000 - (now - this.lastErrorTime) : 
      0;

    return {
      hasRecentError: !!this.lastErrorTime,
      canMakeRequests: !this.lastErrorTime || cooldownRemaining <= 0,
      cooldownSeconds: Math.max(0, Math.ceil(cooldownRemaining / 1000)),
      retryAttempt: this.retryAttempts
    };
  }
}

export const creditService = new CreditService();