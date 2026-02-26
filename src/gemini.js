const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiClient {
    constructor(apiKey) {
        this.genAI = new GoogleGenerativeAI(apiKey);
        // Default to a modern model
        this.modelName = 'gemini-2.0-flash';
        this.model = this.genAI.getGenerativeModel({ model: this.modelName });
    }

    /**
     * Summarizes a list of messages.
     */
    async summarizeMessages(messages) {
        if (!messages || messages.length === 0) {
            return "No messages were found for this period.";
        }

        const formattedMessages = messages
            .filter(msg => !msg.bot_id) // Exclude bot messages by default
            .map(msg => `${msg.user || 'Unknown User'}: ${msg.text}`)
            .join('\n');

        const prompt = `
      Summarize the following Slack conversation from the past week. 
      Identify key topics, decisions made, and any action items. 
      Keep the summary concise and professional.
      
      Conversations:
      ${formattedMessages}
    `;

        const modelsToTry = [
            'gemini-2.5-flash',          // Stable 2.5 version from June 2025
            'gemini-flash-latest',       // Alias for best current version
            'gemini-2.5-flash-lite',     // Lite 2.5 version
            'gemini-3-flash-preview',    // Preview 3.0 version
            'gemini-2.0-flash-001'       // Older stable fallback
        ];
        let lastError;

        for (const modelName of modelsToTry) {
            try {
                console.log(`Attempting summarization with model: ${modelName}...`);
                const model = this.genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent(prompt);
                const response = await result.response;
                return response.text();
            } catch (error) {
                console.warn(`Model ${modelName} failed:`, error.message);
                lastError = error;

                // Continue to next model if it's a model-specific or transient error
                const isRetryableError =
                    error.message.includes('404') ||
                    error.message.includes('429') ||
                    error.message.includes('503') ||
                    error.message.includes('500');

                if (!isRetryableError) {
                    throw error; // Rethrow if it's something fundamental like auth
                }
                console.log(`Error with ${modelName} seems retryable. Trying next model...`);
            }
        }

        console.error('All Gemini model attempts failed.');
        throw lastError;
    }
}

module.exports = GeminiClient;
