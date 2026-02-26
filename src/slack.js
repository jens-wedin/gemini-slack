const { WebClient } = require('@slack/web-api');

class SlackClient {
  constructor(token) {
    this.client = new WebClient(token);
  }

  /**
   * Fetches all public channels the bot is a member of.
   */
  async fetchChannels() {
    try {
      const result = await this.client.conversations.list({
        types: 'public_channel,private_channel',
        types: 'public_channel', // Default to public for now, can be expanded
      });
      return result.channels;
    } catch (error) {
      console.error('Error fetching channels:', error);
      throw error;
    }
  }

  /**
   * Fetches messages from a channel for the past 7 days.
   */
  async fetchHistory(channelId) {
    const sevenDaysAgo = Math.floor(Date.now() / 1000) - 7 * 24 * 60 * 60;
    try {
      const result = await this.client.conversations.history({
        channel: channelId,
        oldest: sevenDaysAgo.toString(),
      });
      return result.messages;
    } catch (error) {
      console.error(`Error fetching history for channel ${channelId}:`, error);
      throw error;
    }
  }

  /**
   * Posts a message to a specific channel.
   */
  async postMessage(channelId, text) {
    try {
      await this.client.chat.postMessage({
        channel: channelId,
        text: text,
      });
    } catch (error) {
      console.error(`Error posting message to channel ${channelId}:`, error);
      throw error;
    }
  }

  /**
   * Fetches all users and returns a map of ID to Name.
   */
  async fetchUserMap() {
    try {
      const userMap = {};
      let cursor;

      do {
        const result = await this.client.users.list({
          cursor: cursor,
          limit: 1000,
        });

        result.members.forEach(user => {
          userMap[user.id] = user.profile.display_name || user.real_name || user.name;
        });

        cursor = result.response_metadata ? result.response_metadata.next_cursor : null;
      } while (cursor);

      return userMap;
    } catch (error) {
      console.error('Error fetching user map:', error);
      return {}; // Fallback to empty map if it fails
    }
  }

  /**
   * Finds a channel ID by its name.
   */
  async findChannelIdByName(name) {
    try {
      let cursor;
      const cleanName = name.replace(/^#/, ''); // Remove leading # if present

      do {
        const result = await this.client.conversations.list({
          types: 'public_channel,private_channel',
          cursor: cursor,
          limit: 1000,
        });

        const channel = result.channels.find(ch => ch.name === cleanName);
        if (channel) return channel.id;

        cursor = result.response_metadata ? result.response_metadata.next_cursor : null;
      } while (cursor);

      return null;
    } catch (error) {
      console.error(`Error finding channel ID for name ${name}:`, error);
      throw error;
    }
  }
}

module.exports = SlackClient;
