const DAILY_CREDIT_LIMIT = 50; // Adjust this value based on your needs
const STORAGE_KEY = 'openai_credits';

class CreditService {
  constructor() {
    this.initializeCredits();
  }

  initializeCredits() {
    const credits = localStorage.getItem(STORAGE_KEY);
    if (!credits) {
      this.resetCredits();
    }
  }

  resetCredits() {
    const creditInfo = {
      remaining: DAILY_CREDIT_LIMIT,
      resetAt: this.getNextResetTime(),
      totalUsed: 0
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(creditInfo));
    return creditInfo;
  }

  getCreditInfo() {
    const credits = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (this.shouldReset(credits.resetAt)) {
      return this.resetCredits();
    }
    return credits;
  }

  shouldReset(resetTime) {
    return new Date() >= new Date(resetTime);
  }

  getNextResetTime() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setHours(24, 0, 0, 0); // Reset at midnight
    return tomorrow.toISOString();
  }

  async useCredit() {
    const credits = this.getCreditInfo();
    
    if (credits.remaining <= 0) {
      const resetTime = new Date(credits.resetAt).toLocaleString();
      throw new Error(`API credit limit reached. Credits will reset at ${resetTime}`);
    }

    credits.remaining -= 1;
    credits.totalUsed += 1;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(credits));
    
    return credits;
  }

  getRemainingCredits() {
    return this.getCreditInfo().remaining;
  }

  getUsageStats() {
    const credits = this.getCreditInfo();
    return {
      remaining: credits.remaining,
      total: DAILY_CREDIT_LIMIT,
      used: credits.totalUsed,
      resetAt: credits.resetAt
    };
  }
}

export const creditService = new CreditService();
