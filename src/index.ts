import { parseJson } from "@/helpers/json.js";
import { report } from "@/helpers/notifier.js";
import { loadWatchers } from "@/watchers.js";
import { readFile } from 'fs/promises';
import { Watcher } from "./types/watcher.js";
import {
  logInfo,
  logError,
  logSuccess,
  logWatcherName,
  logCount,
  createSpinner,
  logHeader,
  logSection
} from "@/helpers/logger.js";

const runWatcher = async (watcher: Watcher) => {
  // Skip disabled watchers
  if (watcher.enabled === false) {
    logInfo(`⏭️  ${logWatcherName(watcher.name)} (disabled)`);
    return;
  }

  const spinner = createSpinner(`Running ${logWatcherName(watcher.name)}`);

  try {
    let message: string | null = null;

    switch (watcher.type) {
      case 'url': {
        const response = await fetch(watcher.url, {
          method: watcher.requestType ?? 'GET',
          headers: await watcher.headers?.(),
        });
        const text = await response.text();

        let data: any = text;
        if (watcher.responseType === 'json') {
          data = parseJson(text);
        }

        message = watcher.notify(data, response.status);
        break;
      }

      case 'managed': {
        message = await watcher.watch();
        break;
      }

      case 'file': {
        const content = await readFile(watcher.filePath, 'utf-8');
        message = watcher.notify(content);
        break;
      }
    }

    if (message) {
      spinner.succeed(`${logWatcherName(watcher.name)}: Changes detected`);
      await report(watcher.name, message);
    } else {
      spinner.info(`${logWatcherName(watcher.name)}: No changes`);
    }
  } catch (e) {
    spinner.fail(`${logWatcherName(watcher.name)}: Failed`);
    await report(watcher.name, `Error:\n\`\`\`\n${e}\n\`\`\``);
  }
};

const runWatchers = async () => {
  logHeader('Telegram Watcher');

  // Dynamically load all watchers
  const watchers = await loadWatchers();

  // Run all watchers in parallel
  await Promise.all(watchers.map(watcher => runWatcher(watcher)));

  logSection('All watchers completed');
};

// Execute the watcher script
runWatchers().catch(err => {
  logError('Failed to run watchers:');
  logError(err);
  process.exit(1);
});