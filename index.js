require('dotenv').config();
const cron = require('node-cron');
const Summarizer = require('./src/summarizer');

const config = {
    slackToken: process.env.SLACK_BOT_TOKEN,
    geminiApiKey: process.env.GEMINI_API_KEY,
    summaryChannelId: process.env.SUMMARY_CHANNEL_ID,
    excludedChannels: (process.env.EXCLUDED_CHANNELS || '').split(',').map(id => id.trim()).filter(id => id),
    cronSchedule: process.env.CRON_SCHEDULE || '0 9 * * 1', // Default: Monday at 9 AM
};

// Validate config
if (!config.slackToken || !config.geminiApiKey || !config.summaryChannelId) {
    console.error('Error: Missing required environment variables (SLACK_BOT_TOKEN, GEMINI_API_KEY, SUMMARY_CHANNEL_ID).');
    process.exit(1);
}

const summarizer = new Summarizer(config);

// Schedule the task
console.log(`Scheduling weekly summary with cron: ${config.cronSchedule}`);
cron.schedule(config.cronSchedule, async () => {
    try {
        await summarizer.runWeeklySummary();
    } catch (error) {
        console.error('Cron job failed:', error);
    }
});

// Optional: Run immediately if a flag is provided
if (process.argv.includes('--run-now')) {
    console.log('Running summary immediately...');
    summarizer.runWeeklySummary();
}

console.log('Gemini-Slack Summarizer is running.');
