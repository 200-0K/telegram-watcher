#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

// Get current directory since __dirname is not available in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Prompt for watcher name
rl.question('Enter the name of your watcher (lowercase, no spaces): ', (watcherName) => {
    // Validate watcher name (only alphanumeric and hyphens)
    if (!/^[a-z0-9-]+$/.test(watcherName)) {
        console.error('Error: Watcher name must contain only lowercase letters, numbers, and hyphens');
        rl.close();
        return;
    }

    const templatePath = path.join(process.cwd(), 'src', 'templates', 'watcher.ts');
    const watcherDir = path.join(process.cwd(), 'src', 'watchers', watcherName);
    const watcherPath = path.join(watcherDir, 'index.ts');

    // Check if watcher already exists
    if (fs.existsSync(watcherDir)) {
        console.error(`Error: Watcher '${watcherName}' already exists`);
        rl.close();
        return;
    }

    try {
        // Create watcher directory
        fs.mkdirSync(watcherDir, { recursive: true });

        // Read template file
        let templateContent = fs.readFileSync(templatePath, 'utf8');

        // Fix import paths for the new watcher location
        templateContent = templateContent.replace("../types/watcher.js", "../../types/watcher.js");
        templateContent = templateContent.replace("../../helpers/localstorage.js", "../../../helpers/localstorage.js");

        // Replace placeholder with actual watcher name
        templateContent = templateContent.replace(/Your Watcher Name/g, watcherName.charAt(0).toUpperCase() + watcherName.slice(1));
        templateContent = templateContent.replace(/<your-watcher-name>/g, watcherName);

        // Write the file
        fs.writeFileSync(watcherPath, templateContent);

        console.log(`Successfully created watcher '${watcherName}' at ${watcherPath}`);
        console.log(`You can now edit the file to customize your watcher.`);
    } catch (error) {
        console.error(`Error creating watcher: ${error.message}`);
    }

    rl.close();
}); 