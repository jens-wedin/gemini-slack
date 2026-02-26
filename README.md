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

## GitHub Actions Deployment (Cloud Scheduling)

The project includes a GitHub Action workflow in `.github/workflows/weekly-summary.yml` that handles the weekly scheduling automatically.

### 1. Set Up GitHub Secrets
1. Go to your repository on GitHub.
2. Navigate to **Settings > Secrets and variables > Actions**.
3. Create the following **Repository secrets**:
   - `SLACK_BOT_TOKEN`: Your `xoxb-` token.
   - `GEMINI_API_KEY`: Your Google Gemini key.
   - `SUMMARY_CHANNEL_ID`: `hey-summarize` (or your channel's ID).
   - `EXCLUDED_CHANNELS`: `recruitment` (or any channels to skip).

### 2. How the Cron Job Works
The bot is configured to run every Monday at **09:00 UTC**. You can customize this by editing the `cron` line in `.github/workflows/weekly-summary.yml`:
```yaml
on:
  schedule:
    - cron: '0 9 * * 1' # 'Minute Hour Day Month DayOfWeek'
```

### 3. Verify or Trigger Manually
- **Automatic**: After pushing your code and secrets, look at the **Actions** tab in your repository to see pending and past runs.
- **Manual**: You can also trigger a run anytime by going to the **Actions** tab, selecting "Weekly Slack Summary", and clicking **Run workflow**.

> [!TIP]
> Make sure the bot is **invited** to all participating channels using `/invite @Gemini Summarizer`, or it will fail to read the messages!
