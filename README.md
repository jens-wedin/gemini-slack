# Gemini Slack Summarizer

A weekly Slack bot that summarizes channel conversations using Google Gemini AI and posts them to a designated channel.

## Features

- **Automated Summaries**: Automatically fetches and summarizes messages from the past 7 days.
- **Gemini AI Integrated**: Uses modern Gemini models (2.5 Flash / 3.0 Preview) for high-quality digests.
- **Flexible Controls**: Easily exclude specific channels (e.g., `#recruitment`) or target specific channels for output (e.g., `#hey-summarize`) using friendly names.
- **Scheduled or Manual**: Runs weekly on a cron schedule or manually via a command-line flag.
- **Cloud Ready**: Includes a GitHub Action workflow for automated weekly runs in the cloud.

## Quick Start

### 1. Installation

```bash
npm install
```

### 2. Configuration

Copy the example environment file and fill in your keys:

```bash
cp .env.example .env
```

| Variable | Description |
| --- | --- |
| `SLACK_BOT_TOKEN` | Your Slack Bot OAuth Token (`xoxb-...`) |
| `GEMINI_API_KEY` | Your Google AI Studio API Key |
| `SUMMARY_CHANNEL_ID` | The name or ID of the channel to post summaries to (e.g., `hey-summarize`) |
| `EXCLUDED_CHANNELS` | Comma-separated list of channel names/IDs to ignore (e.g., `recruitment,general`) |
| `CRON_SCHEDULE` | Cron expression for the weekly task (default: `0 9 * * 1`) |

### 3. Usage

**Run locally (scheduler):**
```bash
node index.js
```

**Run immediately:**
```bash
node index.js --run-now
```

## Slack App Setup

Use the provided `manifest.json` to quickly set up your Slack app:

1. Create a new app at [api.slack.com/apps](https://api.slack.com/apps) from the **App Manifest**.
2. Paste the contents of `manifest.json`.
3. Install the app to your workspace.
4. **Important**: Invite the bot to any channel you want it to read or post to by typing `/invite @Gemini Summarizer`.

## GitHub Actions Deployment

1. Push this project to a GitHub repository.
2. Add your `.env` values as **Secrets** in GitHub (Settings > Secrets and variables > Actions).
3. The bot will automatically run every Monday morning.

## License

ISC
