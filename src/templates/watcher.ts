import moment from 'moment';
// import moment = require("moment");
import { Watcher } from '@/types/watcher.js';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Template for creating a new watcher
 *
 * To use this template:
 * 1. Copy this file to watchers/<your-watcher-name>/src/index.ts
 * 2. Customize the watcher configuration
 * 3. Update the notify function to process the API response
 */

// If you need to read a configuration file
// const configPath = path.join(process.cwd(), 'watchers/<your-watcher-name>/src/config.json');
// const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

// Example localStorage usage for storing previous state
// import { localStorage } from "@/helpers/localstorage.js";
// const storageKey = '<your-watcher-name>-key';
// const storedData = JSON.parse(localStorage.getItem(storageKey) || '[]');
// localStorage.setItem(storageKey, JSON.stringify(newData));

const watcher: Watcher = {
  name: 'Your Watcher Name',
  url: 'https://api.example.com/endpoint',
  enabled: true,
  watchType: 'custom',
  responseType: 'json', // Use 'text' if the API returns plain text

  // Optional: Add custom headers if needed
  // headers: async () => ({
  //     'Authorization': 'Bearer your-token-here'
  // }),

  notify: (response, status) => {
    // Process the API response
    // Return a notification message string, or null if no notification should be sent

    // Example implementation:
    if (status !== 200) {
      return `Error: API returned status ${status}`;
    }

    // For JSON responses
    if (!response || !Array.isArray(response.items)) {
      return null; // No notification if response format is unexpected
    }

    // Example: Find new items since last check
    // const storageKey = '<your-watcher-name>-items';
    // const storedItems = JSON.parse(localStorage.getItem(storageKey) || '[]');
    // const newItems = response.items.filter(item => !storedItems.some(s => s.id === item.id));
    //
    // if (newItems.length === 0) return null; // No new items
    //
    // localStorage.setItem(storageKey, JSON.stringify(newData));

    // Format your notification message
    return [
      `✨ New items found (${response.items.length}):`,
      '```',
      // Format your items here
      JSON.stringify(response.items, null, 2),
      '```',
    ].join('\n');
  },
};

export default watcher;
