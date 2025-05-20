import OpenAI from 'openai';
import { creditService } from './creditService';

class OpenAIWithCredits {
    constructor() {
        this.client = new OpenAI({
            apiKey: import.meta.env.VITE_OPENAI_API_KEY,
            dangerouslyAllowBrowser: true
        });
    }

    async chat(params) {
        await creditService.useCredit();
        
        try {
            return await this.client.chat.completions.create(params);
        } catch (error) {
            creditService.handleApiError(error); 
}
    }

    async createCompletion(messages) {
        return this.chat({
            model: "gpt-3.5-turbo",
            messages: messages
        });
    }

    getCreditUsage() {
        return creditService.getUsageStats();
    }
}

export const openai = new OpenAIWithCredits();