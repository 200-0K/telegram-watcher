# Watcher Template

This directory contains template files for creating new watchers in the Telegram-watcher application.

## Creating a New Watcher

### Method 1: Using the Helper Script (Recommended)

Run the following command to create a new watcher:

```bash
npm run create-watcher
```

Follow the prompts to provide a name for your watcher. The script will:
1. Create a new directory in `src/watchers/`
2. Copy the template file with the appropriate name substitutions
3. Create a basic configuration

### Method 2: Manual Creation

1. Create a new directory in `src/watchers/` with your watcher name
2. Copy `src/templates/watcher.ts` to your new directory as `index.ts`
3. Copy `src/templates/config.json` to your new directory (if needed)
4. Modify the files to customize your watcher

## Customizing Your Watcher

After creating the watcher, open the `index.ts` file and:

1. Update the `name` and `url` properties to match your API endpoint
2. Modify the `notify` function to process the API response
3. Implement any additional logic needed (authentication, data storage, etc.)

## Watcher Configuration

The template includes examples for:

- Reading a configuration file
- Using localStorage to track state between runs
- Adding authentication headers
- Processing API responses
- Formatting notification messages

## Examples

Check the existing watchers in `src/watchers/` for practical examples of different watcher implementations. 