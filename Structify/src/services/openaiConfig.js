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
        // Check and use credits before making the API call
        await creditService.useCredit();
        
        try {
            return await this.client.chat.completions.create(params);
        } catch (error) {
            // Handle OpenAI specific errors
            if (error.response) {
                switch (error.response.status) {
                    case 429:
                        throw new Error('Rate limit exceeded. Please try again later.');
                    case 402:
                        throw new Error('API credit limit exceeded. Please check your OpenAI account.');
                    default:
                        throw new Error(`OpenAI API error: ${error.response.data.error.message}`);
                }
            }
            throw error;
        }
    }

    // Wrapper for chat completions
    async createCompletion(messages) {
        return this.chat({
            model: "gpt-3.5-turbo",
            messages: messages
        });
    }

    // Get current credit usage
    getCreditUsage() {
        return creditService.getUsageStats();
    }
}

export const openai = new OpenAIWithCredits();