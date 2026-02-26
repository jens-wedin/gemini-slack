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
    async summarizeMessages(aggregatedText) {
        if (!aggregatedText) {
            return "No messages were found for this period.";
        }

        const prompt = `
      You are a helpful Slack bot that summarizes weekly conversations.
      
      TASK:
      Summarize the following Slack conversations. 
      Identify key topics, decisions made, and action items.
      
      USER LINKING RULES (CRITICAL):
      1. You will see users formatted as \`<@ID> (Real Name)\`.
      2. In your summary, when referring to a user, ALWAYS use the \`<@ID>\` format (e.g., <@U12345>). 
      3. This ensures they are clickable links in Slack. 
      4. DO NOT include the "(Real Name)" part in the summary output.
      
      FORMATTING RULES for Slack (CRITICAL):
      1. Use Slack's "mrkdwn" syntax.
      2. Use *bold* (single asterisk) for bolding, NOT **bold**.
      3. Use > for blockquotes.
      4. Use - or • for bullet points.
      5. Do NOT use # for headers. Use *Bold Headers* instead.
      6. Use \`code\` for technical terms or small snippets.
      7. Keep the tone professional but friendly.
      8. Mention specific users by name where relevant.
      
      Conversations:
      ${aggregatedText}
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
