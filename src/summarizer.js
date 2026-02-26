const SlackClient = require('./slack');
const GeminiClient = require('./gemini');

class Summarizer {
    constructor(config) {
        this.config = config;
        this.slack = new SlackClient(config.slackToken);
        this.gemini = new GeminiClient(config.geminiApiKey);
        this.excludedChannels = new Set(config.excludedChannels || []);
        this.targetChannelId = config.summaryChannelId;
    }

    /**
     * Orchestrates the weekly summary process.
     */
    async runWeeklySummary() {
        console.log('Starting weekly summary process...');

        try {
            // 0. Resolve target channel ID if it's a name
            if (!this.targetChannelId.startsWith('C')) {
                console.log(`Resolving target channel name "${this.targetChannelId}"...`);
                const resolvedId = await this.slack.findChannelIdByName(this.targetChannelId);
                if (resolvedId) {
                    this.targetChannelId = resolvedId;
                } else {
                    console.warn(`Could not resolve channel name "${this.targetChannelId}". Using it as-is.`);
                }
            }

            // 1. Fetch channels
            const allChannels = await this.slack.fetchChannels();

            // Resolve excluded channel names to IDs
            const resolvedExclusions = new Set(this.excludedChannels);
            for (const exclusion of this.excludedChannels) {
                if (!exclusion.startsWith('C')) {
                    const id = await this.slack.findChannelIdByName(exclusion);
                    if (id) resolvedExclusions.add(id);
                }
            }

            const channelsToProcess = allChannels.filter(ch =>
                ch.is_member && !resolvedExclusions.has(ch.id) && !resolvedExclusions.has(ch.name) && ch.id !== this.targetChannelId
            );

            console.log(`Found ${channelsToProcess.length} channels to process.`);

            let allMessages = [];

            // 2. Fetch history for each channel
            for (const channel of channelsToProcess) {
                console.log(`Fetching messages for #${channel.name} (${channel.id})...`);
                const messages = await this.slack.fetchHistory(channel.id);

                if (messages && messages.length > 0) {
                    allMessages.push({
                        channelName: channel.name,
                        messages: messages
                    });
                }
            }

            if (allMessages.length === 0) {
                console.log('No new messages found to summarize.');
                return;
            }

            // 3. Summarize with Gemini
            // Note: For now we'll do one combined summary, but for very large teams
            // we might want to do it per channel or group.
            const aggregatedText = allMessages
                .map(ch => `--- Channel: #${ch.channelName} ---\n` + ch.messages
                    .filter(m => !m.bot_id && m.text)
                    .map(m => `${m.user}: ${m.text}`)
                    .join('\n')
                )
                .join('\n\n');

            console.log('Generating summary with Gemini...');
            const summary = await this.gemini.summarizeMessages([{ text: aggregatedText }]); // Wrap in simple structure for client

            // 4. Post back to Slack
            const finalMessage = `*Weekly Slack Summary (Previous 7 Days)*\n\n${summary}`;
            console.log(`Posting summary to channel ${this.targetChannelId}...`);
            await this.slack.postMessage(this.targetChannelId, finalMessage);

            console.log('Weekly summary completed successfully!');
        } catch (error) {
            console.error('Failed to run weekly summary:', error);
            throw error;
        }
    }
}

module.exports = Summarizer;
