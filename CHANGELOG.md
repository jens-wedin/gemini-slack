# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-03-30

### Added

- User name fetching from Slack API, enabling Slack-native `@mention` links in summaries instead of raw user IDs.
- Environment variable sanitization: values are trimmed of whitespace and surrounding quotes for more forgiving configuration.
- GitHub Actions workflow (`.github/workflows/weekly-summary.yml`) for automated weekly runs in the cloud.
- Support for manual workflow dispatch trigger, allowing on-demand summaries from the GitHub Actions UI.

### Changed

- Gemini prompt refined: removed the "funny" personality trait for a more consistent professional tone.
- Summary word limit tuned to 350 words (previously ~650), keeping digests concise and scannable.
- Prompt now explicitly scopes summaries to last week's conversations with a Monday-morning context hint.
- Added noise-filtering instruction so the bot deprioritizes low-signal messages and focuses on decisions, topics, and action items.
