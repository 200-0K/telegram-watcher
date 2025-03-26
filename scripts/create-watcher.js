#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { execSync } from 'child_process';
import { Listr } from 'listr2';

// Get current directory since __dirname is not available in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const program = new Command();

/**
 * Validates a watcher name
 * @param {string} watcherName - The name to validate
 * @returns {boolean} - Whether the name is valid
 */
const validateWatcherName = watcherName => {
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
    IMPORT_PATH: importPath,
    LOCALSTORAGE_PATH: localStoragePath,
    DISPLAY_NAME: displayName,
    WATCHER_NAME: watcherName,
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
    WATCHER_NAME: watcherName,
    DISPLAY_NAME: displayName,
  });

  fs.writeFileSync(targetPath, content);
};

/**
 * Creates a tsconfig.json file for watchers
 * @param {string} targetPath - Path to write the file to
 */
const createTsConfigFile = targetPath => {
  const stubPath = path.join(__dirname, 'stubs', 'tsconfig.stub.json');
  fs.copyFileSync(stubPath, targetPath);
};

/**
 * Creates a new watcher with the given name
 * @param {string} watcherName - The name of the watcher to create
 * @param {Object} options - Command line options
 */
const createWatcher = async (watcherName, options = {}) => {
  // Validate watcher name
  if (!validateWatcherName(watcherName)) {
    throw new Error('Watcher name must contain only lowercase letters, numbers, and hyphens');
  }

  // Create watcher in watchers directory with src subfolder
  const watcherDir = path.join(process.cwd(), 'watchers', watcherName);
  const srcDir = path.join(watcherDir, 'src');
  const watcherPath = path.join(srcDir, 'index.ts');

  // Check if watcher already exists
  if (fs.existsSync(watcherDir)) {
    throw new Error(`Watcher '${watcherName}' already exists`);
  }

  try {
    // Create directories
    fs.mkdirSync(srcDir, { recursive: true });

    // Create package.json
    createPackageJsonFile(path.join(watcherDir, 'package.json'), watcherName);

    // Create tsconfig.json
    createTsConfigFile(path.join(watcherDir, 'tsconfig.json'));

    // Create watcher file from template
    createWatcherFile(watcherPath, watcherName);

    console.log(
      chalk.green(`\nSuccessfully created watcher '${watcherName}' with folder structure:`)
    );
    console.log(chalk.cyan(`- ${watcherDir}/`));
    console.log(chalk.cyan(`  ├── src/`));
    console.log(chalk.cyan(`  │   └── index.ts     # Main watcher implementation`));
    console.log(chalk.cyan(`  ├── package.json`));
    console.log(chalk.cyan(`  └── tsconfig.json`));

    console.log(chalk.yellow('\nYou can now edit the watcher implementation at:'));
    console.log(chalk.cyan(watcherPath));

    // Handle dependency installation
    let shouldInstall = options.yes;
    let additionalDeps = options.deps;

    if (!options.yes) {
      const { installDeps } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'installDeps',
          message: 'Would you like to install dependencies now?',
          default: true,
        },
      ]);
      shouldInstall = installDeps;
    }

    if (shouldInstall) {
      if (!additionalDeps && !options.yes) {
        const { deps } = await inquirer.prompt([
          {
            type: 'input',
            name: 'deps',
            message: 'Enter additional dependencies to install (space-separated, optional):',
            default: '',
            filter: input => input.trim(),
          },
        ]);
        additionalDeps = deps;
      }

      // Store original directory
      const originalDir = process.cwd();
      // Change to watcher directory
      process.chdir(watcherDir);

      const installTasks = [];

      // Add base dependencies installation task
      installTasks.push({
        title: 'Installing dependencies',
        task: () => {
          execSync('npm install', { stdio: 'pipe' });
        },
      });

      // Add additional dependencies if specified
      if (additionalDeps) {
        const deps = additionalDeps.split(/\s+/).filter(Boolean);
        if (deps.length > 0) {
          installTasks.push({
            title: 'Installing additional dependencies',
            task: () => {
              execSync(`npm install ${deps.join(' ')}`, { stdio: 'pipe' });
            },
          });
        }
      }

      // Create and run the installation tasks
      const tasks = new Listr(installTasks, { exitOnError: false });

      try {
        await tasks.run();
        console.log(chalk.green('Dependencies installed successfully'));
      } catch (error) {
        console.error(chalk.red('\nError installing dependencies:'));
        console.error(chalk.red(error.message));
        console.log(chalk.yellow('\nYou can try installing dependencies manually by running:'));
        console.log(chalk.cyan(`cd watchers/${watcherName}`));
        console.log(chalk.cyan('npm install'));
      } finally {
        // Change back to original directory
        process.chdir(originalDir);
      }
    }
  } catch (error) {
    throw error;
  }
};

program
  .name('create-watcher')
  .description('Create a new watcher for the Telegram Watcher system')
  .version('1.0.0')
  .argument('[name]', 'Name of the watcher to create')
  .option('-i, --interactive', 'Force interactive mode')
  .option('-y, --yes', 'Skip prompts and use defaults')
  .option('-d, --deps <dependencies>', 'Additional dependencies to install (space-separated)')
  .action(async (name, options) => {
    try {
      if (options.interactive || !name) {
        // Interactive mode
        const { watcherName } = await inquirer.prompt([
          {
            type: 'input',
            name: 'watcherName',
            message: 'Enter the name of your watcher:',
            default: name,
            validate: input => {
              if (!validateWatcherName(input)) {
                return 'Watcher name must contain only lowercase letters, numbers, and hyphens';
              }
              return true;
            },
          },
        ]);
        await createWatcher(watcherName, options);
      } else {
        // Direct mode
        await createWatcher(name, options);
      }
    } catch (error) {
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

// Parse command line arguments
program.parse();
