import { Watcher } from '@/types/watcher.js';
import fs from 'fs';
import path from 'path';
import {
  logInfo,
  logWarn,
  logError,
  logSuccess,
  logWatcherName,
  logCount,
  logSection,
} from '@/helpers/logger.js';
import { Listr } from 'listr2';

// Create an empty array for watchers
const watchers: Watcher[] = [];

// Function to dynamically load all watchers
const loadWatchers = async (): Promise<Watcher[]> => {
  // Return cached watchers if already loaded
  if (watchers.length > 0) {
    return watchers;
  }

  // Load all watchers from the watchers directory
  const watchersPath = path.join(process.cwd(), 'watchers');
  if (fs.existsSync(watchersPath)) {
    await loadWatchersFromDirectory(watchersPath);
  } else {
    logWarn('No watchers directory found. Create it to add watchers.');
  }

  logSection(
    `Found ${logCount(watchers.length)} watchers: ${watchers.map(w => logWatcherName(w.name)).join(', ')}`
  );
  return watchers;
};

// Helper function to load watchers from a directory
const loadWatchersFromDirectory = async (dirPath: string): Promise<void> => {
  const watcherDirs = fs
    .readdirSync(dirPath, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory() && !dirent.name.startsWith('.')) // Filter out hidden directories like .git
    .map(dirent => dirent.name);

  // Create tasks to load each watcher
  const tasks = new Listr(
    watcherDirs.map(dir => ({
      title: `Loading ${logWatcherName(dir)}`,
      task: async (ctx, task) => {
        try {
          // Check for different file locations, prioritizing TypeScript source
          let watcherFile = path.join(dirPath, dir, 'src', 'index.ts');
          let exists = fs.existsSync(watcherFile);

          // Try other possible locations if the main one doesn't exist
          if (!exists) {
            watcherFile = path.join(dirPath, dir, 'src', 'index.js');
            exists = fs.existsSync(watcherFile);
          }

          if (!exists) {
            watcherFile = path.join(dirPath, dir, 'index.ts');
            exists = fs.existsSync(watcherFile);
          }

          if (!exists) {
            watcherFile = path.join(dirPath, dir, 'index.js');
            exists = fs.existsSync(watcherFile);
          }

          if (!exists) {
            task.title = `${logWatcherName(dir)}: No implementation found`;
            task.skip(`No implementation found for ${dir}`);
            return;
          }

          // Use an absolute file URL for imports
          const fileUrl = `file://${watcherFile.replace(/\\/g, '/')}`;
          const module = await import(fileUrl);
          watchers.push(module.default);
          task.title = `Loaded ${logWatcherName(dir)}`;
        } catch (error) {
          task.title = `Failed to load ${logWatcherName(dir)}`;
          throw new Error(`Error: ${error}`);
        }
      },
    })),
    { concurrent: false, exitOnError: false }
  );

  await tasks.run();
};

export default watchers;
export { loadWatchers };
