require('dotenv').config();
const cron = require('node-cron');
const Summarizer = require('./src/summarizer');

const config = {
    // Trim whitespace to prevent ERR_INVALID_CHAR in headers (common with GH Secrets)
    slackToken: (process.env.SLACK_BOT_TOKEN || '').trim().replace(/^["'](.+)["']$/, '$1'),
    geminiApiKey: (process.env.GEMINI_API_KEY || '').trim().replace(/^["'](.+)["']$/, '$1'),
    summaryChannelId: (process.env.SUMMARY_CHANNEL_ID || '').trim().replace(/^["'](.+)["']$/, '$1'),
    excludedChannels: (process.env.EXCLUDED_CHANNELS || '')
        .split(',')
        .map(id => id.trim().replace(/^["'](.+)["']$/, '$1'))
        .filter(id => id),
    cronSchedule: (process.env.CRON_SCHEDULE || '0 9 * * 1').trim(),
};

// Validate config
const missingVars = [];
if (!config.slackToken) missingVars.push('SLACK_BOT_TOKEN');
if (!config.geminiApiKey) missingVars.push('GEMINI_API_KEY');
if (!config.summaryChannelId) missingVars.push('SUMMARY_CHANNEL_ID');

if (missingVars.length > 0) {
    console.error(`Error: Missing required environment variables: ${missingVars.join(', ')}`);
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
    summarizer.runWeeklySummary()
        .then(() => {
            console.log('Immediate run completed successfully.');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Immediate run failed:', error);
            process.exit(1);
        });
} else {
    console.log('Gemini-Slack Summarizer is running.');
}
