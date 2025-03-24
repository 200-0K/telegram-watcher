import { Watcher } from "./types/watcher.js";
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

    // Get all directories in the watchers folder
    const watchersPath = path.join(process.cwd(), 'src', 'watchers');
    const watcherDirs = fs.readdirSync(watchersPath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

    console.log(`Found watcher directories: ${watcherDirs.join(', ')}`);

    // Load each watcher module
    for (const dir of watcherDirs) {
        try {
            // Use an absolute file URL for imports with .ts extension
            const absolutePath = path.join(process.cwd(), 'src', 'watchers', dir, 'index.ts');
            const fileUrl = `file://${absolutePath.replace(/\\/g, '/')}`;

            console.log(`Importing watcher from ${fileUrl}`);
            const module = await import(fileUrl);
            watchers.push(module.default);
        } catch (error) {
            console.error(`Failed to load watcher from directory ${dir}:`, error);
        }
    }

    console.log(`Loaded ${watchers.length} watchers: ${watchers.map(w => w.name).join(', ')}`);
    return watchers;
};

export default watchers;
export { loadWatchers }; 