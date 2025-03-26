import { parseJson } from '@/helpers/json.js';
import { report } from '@/helpers/notifier.js';
import { loadWatchers } from '@/watchers.js';
import { readFile } from 'fs/promises';
import { Watcher } from './types/watcher.js';
import {
  logInfo,
  logError,
  logSuccess,
  logWatcherName,
  logCount,
  logHeader,
  logSection,
} from '@/helpers/logger.js';
import { Listr } from 'listr2';
import chalk from 'chalk';

const runWatcher = async (watcher: Watcher, ctx: any) => {
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
      await report(watcher.name, message);
      return { name: watcher.name, message, status: 'changed' };
    } else {
      return { name: watcher.name, message: null, status: 'unchanged' };
    }
  } catch (e) {
    await report(watcher.name, `Error:\n\`\`\`\n${e}\n\`\`\``);
    return { name: watcher.name, message: String(e), status: 'error' };
  }
};

const runWatchers = async () => {
  logHeader('Telegram Watcher');

  // Dynamically load all watchers
  const watchers = await loadWatchers();

  // Create tasks for Listr
  const tasks = new Listr(
    watchers.map(watcher => ({
      title: `Running ${logWatcherName(watcher.name)}`,
      skip: () =>
        watcher.enabled === false ? `${watcher.name} ${chalk.dim('(disabled)')}` : false,
      task: async (ctx, task) => {
        const result = await runWatcher(watcher, ctx);

        if (result.status === 'changed') {
          task.title = `${logWatcherName(watcher.name)}: Changes detected`;
        } else if (result.status === 'unchanged') {
          task.title = `${logWatcherName(watcher.name)}: No changes`;
        } else if (result.status === 'error') {
          task.title = `${logWatcherName(watcher.name)}: Failed`;
          throw new Error(result.message || 'Unknown error');
        }
      },
    })),
    { concurrent: true, exitOnError: false }
  );

  await tasks.run();

  logSection('All watchers completed');
};

// Execute the watcher script
runWatchers().catch(err => {
  logError('Failed to run watchers:');
  logError(err);
  process.exit(1);
});
