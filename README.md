# Telegram Watcher

A Node.js script to periodically check websites and APIs for changes and report them via Telegram.

## Features

- Simple plugin system for watchers
- Dynamic loading of watchers
- Easy API for creating new watchers
- Notifications via Telegram

## Project Structure

```
telegram-watcher/
├── src/                # Main application code
│   ├── helpers/        # Utility functions
│   ├── types/          # TypeScript type definitions
│   └── ...
├── watchers/           # All watchers
│   └── my-watcher/     # Example watcher
│       ├── src/        # Source code
│       │   └── index.ts
│       ├── package.json
│       └── tsconfig.json
└── ...
```

## Getting Started

1. Clone the repository
2. Copy `.env.example` to `.env` and configure your Telegram bot token
3. Install dependencies: `npm install`
4. Run the application: `npm start`

## Creating a New Watcher

To create a new watcher:

```bash
npm run create-watcher
```

This will prompt you for a watcher name (lowercase, no spaces) and create a new watcher in the `watchers/` directory.

## Watcher Structure

All watchers are created in the `watchers/` directory with a simple folder structure:

```
watchers/my-watcher/
├── src/              # Source code folder
│   └── index.ts      # Main watcher implementation
├── package.json      # Dependencies
└── tsconfig.json     # TypeScript configuration
```

Each watcher can have its own dependencies and can be developed independently from the main application.

## Using Watchers

After creating a watcher:

1. Navigate to the watcher directory:
   ```bash
   cd watchers/your-watcher-name
   ```
   
2. Install any dependencies your watcher needs:
   ```bash
   npm install your-dependency
   ```
   
3. Start the main application which will automatically detect and load your watcher:
   ```bash
   cd ../..
   npm start
   ```

The watcher system will automatically discover and load your watcher directly from the TypeScript source.

## Watcher Implementation

Each watcher is a module that exports a configuration object:

```typescript
import { Watcher } from "../../src/types/watcher.js";
import { localStorage } from "../../src/helpers/localstorage.js";

const watcher: Watcher = {
    name: 'My Watcher',
    url: 'https://api.example.com/endpoint',
    enabled: true,
    watchType: 'custom',
    responseType: 'json',
    
    notify: (response, status) => {
        // Process response and return notification message
        // or null if no notification should be sent
        
        // Example: storing state between checks
        const storageKey = 'my-watcher-items';
        const storedItems = JSON.parse(localStorage.getItem(storageKey) || '[]');
        const newItems = response.items.filter(item => !storedItems.some(s => s.id === item.id));
        
        if (newItems.length === 0) return null;
        
        localStorage.setItem(storageKey, JSON.stringify(response.items));
        
        return `New content found: ${newItems.length} items`;
    }
};

export default watcher;
```

## Installing Third-Party Watchers

To install a third-party watcher:

1. Create a directory in the `watchers/` folder with the watcher name
2. Copy the watcher code or clone the repository into that directory
3. Install dependencies if needed: `cd watchers/watcher-name && npm install`
4. Restart the application 