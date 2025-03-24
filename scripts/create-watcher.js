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

/**
 * Validates a watcher name
 * @param {string} watcherName - The name to validate
 * @returns {boolean} - Whether the name is valid
 */
const validateWatcherName = (watcherName) => {
    return /^[a-z0-9-]+$/.test(watcherName);
};

/**
 * Read a stub file and replace placeholders with values
 * @param {string} stubPath - Path to the stub file
 * @param {Object} replacements - Key-value pairs for replacements
 * @returns {string} - The content with replacements
 */
const processStub = (stubPath, replacements) => {
    let content = fs.readFileSync(stubPath, 'utf8');

    // Replace all placeholders
    Object.keys(replacements).forEach(key => {
        const placeholder = `{{${key}}}`;
        content = content.replace(new RegExp(placeholder, 'g'), replacements[key]);
    });

    return content;
};

/**
 * Creates a watcher file from template
 * @param {string} targetPath - Path to write the file to
 * @param {string} watcherName - The name of the watcher
 */
const createWatcherFile = (targetPath, watcherName) => {
    const displayName = watcherName.charAt(0).toUpperCase() + watcherName.slice(1);

    // Use @ imports
    const importPath = '@/types/watcher.js';
    const localStoragePath = '@/helpers/localstorage.js';

    const stubPath = path.join(__dirname, 'stubs', 'watcher.stub.ts');

    const content = processStub(stubPath, {
        'IMPORT_PATH': importPath,
        'LOCALSTORAGE_PATH': localStoragePath,
        'DISPLAY_NAME': displayName,
        'WATCHER_NAME': watcherName
    });

    fs.writeFileSync(targetPath, content);
};

/**
 * Creates a package.json file for watchers
 * @param {string} targetPath - Path to write the file to
 * @param {string} watcherName - The name of the watcher
 */
const createPackageJsonFile = (targetPath, watcherName) => {
    const displayName = watcherName.charAt(0).toUpperCase() + watcherName.slice(1);
    const stubPath = path.join(__dirname, 'stubs', 'package.stub.json');

    const content = processStub(stubPath, {
        'WATCHER_NAME': watcherName,
        'DISPLAY_NAME': displayName
    });

    fs.writeFileSync(targetPath, content);
};

/**
 * Creates a tsconfig.json file for watchers
 * @param {string} targetPath - Path to write the file to
 */
const createTsConfigFile = (targetPath) => {
    const stubPath = path.join(__dirname, 'stubs', 'tsconfig.stub.json');
    fs.copyFileSync(stubPath, targetPath);
};

// Prompt for watcher name
rl.question('Enter the name of your watcher (lowercase, no spaces): ', (watcherName) => {
    // Validate watcher name
    if (!validateWatcherName(watcherName)) {
        console.error('Error: Watcher name must contain only lowercase letters, numbers, and hyphens');
        rl.close();
        return;
    }

    // Create watcher in watchers directory with src subfolder
    const watcherDir = path.join(process.cwd(), 'watchers', watcherName);
    const srcDir = path.join(watcherDir, 'src');
    const watcherPath = path.join(srcDir, 'index.ts');

    // Check if watcher already exists
    if (fs.existsSync(watcherDir)) {
        console.error(`Error: Watcher '${watcherName}' already exists`);
        rl.close();
        return;
    }

    try {
        // Create directories
        fs.mkdirSync(srcDir, { recursive: true });

        // Create package.json
        createPackageJsonFile(
            path.join(watcherDir, 'package.json'),
            watcherName
        );

        // Create tsconfig.json
        createTsConfigFile(
            path.join(watcherDir, 'tsconfig.json')
        );

        // Create watcher file from template
        createWatcherFile(watcherPath, watcherName);

        console.log(`Successfully created watcher '${watcherName}' with folder structure:`);
        console.log(`- ${watcherDir}/`);
        console.log(`  ├── src/`);
        console.log(`  │   └── index.ts     # Main watcher implementation`);
        console.log(`  ├── package.json`);
        console.log(`  └── tsconfig.json`);

        console.log('\nYou can now edit the watcher implementation at:');
        console.log(watcherPath);

        console.log('\nTo install additional dependencies for your watcher:');
        console.log(`cd watchers/${watcherName}`);
        console.log('npm install your-dependency');
    } catch (error) {
        console.error(`Error creating watcher: ${error.message}`);
    }

    rl.close();
}); 