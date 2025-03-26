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
  createSpinner,
  logSection,
} from '@/helpers/logger.js';

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

  // Load each watcher module
  for (const dir of watcherDirs) {
    const spinner = createSpinner(`Loading ${logWatcherName(dir)}`);
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
        spinner.warn(`No implementation found for ${logWatcherName(dir)}`);
        continue;
      }

      // Use an absolute file URL for imports
      const fileUrl = `file://${watcherFile.replace(/\\/g, '/')}`;
      const module = await import(fileUrl);
      watchers.push(module.default);
      spinner.succeed(`Loaded ${logWatcherName(dir)}`);
    } catch (error) {
      spinner.fail(`Failed to load ${logWatcherName(dir)}`);
      logError(`Error: ${error}\n`);
    }
  }
};

export default watchers;
export { loadWatchers };
