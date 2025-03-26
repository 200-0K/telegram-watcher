import { Watcher } from "@/types/watcher.js";
import fs from 'fs';
import path from 'path';

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
        console.log('No watchers directory found. Create it to add watchers.');
    }

    console.log(`Loaded ${watchers.length} watchers: ${watchers.map(w => w.name).join(', ')}`);
    return watchers;
};

// Helper function to load watchers from a directory
const loadWatchersFromDirectory = async (dirPath: string): Promise<void> => {
    const watcherDirs = fs.readdirSync(dirPath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

    console.log(`Found watcher directories: ${watcherDirs.join(', ')}`);

    // Load each watcher module
    for (const dir of watcherDirs) {
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
                console.warn(`No watcher implementation found for ${dir}, skipping`);
                continue;
            }

            // Use an absolute file URL for imports
            const fileUrl = `file://${watcherFile.replace(/\\/g, '/')}`;

            console.log(`Importing watcher from ${fileUrl}`);
            const module = await import(fileUrl);
            watchers.push(module.default);
        } catch (error) {
            console.error(`Failed to load watcher from directory ${dir}:`, error);
        }
    }
};

export default watchers;
export { loadWatchers }; 