# Telegram Watcher

A Node.js script that monitors various sources for changes and reports them via Telegram. The script supports three types of watchers:

- **URL Watchers**: Monitor HTTP endpoints and APIs, supporting GET, POST, PUT, DELETE, and PATCH requests with JSON or text responses
- **Managed Watchers**: Handle complex monitoring scenarios with custom logic and state management
- **File Watchers**: Monitor local file changes and report modifications

The script is designed to be run as a scheduled task by your system's task scheduler (cron on Linux/Mac or Task Scheduler on Windows).

## How It Works

The script:
1. Dynamically loads all configured watchers from the `watchers/` directory
2. Runs all enabled watchers in parallel for better performance
3. Processes the results and sends notifications via Telegram
4. Exits after completion

### Scheduling

The script is designed to run as a scheduled task. You can set up scheduling using your system's task scheduler:

#### Windows (Task Scheduler)
1. Open Task Scheduler
2. Create a new task
3. Set the trigger to "On startup" or a specific schedule
4. Set the action to run: `npm start` in the project directory

#### Linux/Mac (cron)
Add to your crontab:
```bash
# Run every 5 minutes
*/5 * * * * cd /path/to/telegram-watcher && npm start
```

Each time the script runs, it will:
- Check all enabled watchers
- Send notifications for any changes detected
- Report any errors via Telegram
- Exit after completion

## Features

- Three types of watchers (URL, Managed, File) for different monitoring needs
- Dynamic loading of watchers from the `watchers/` directory
- Support for HTTP requests with custom headers and methods
- JSON and text response handling
- Local file monitoring
- Custom monitoring logic through managed watchers
- Error reporting via Telegram
- Simple plugin system for creating new watchers

## Project Structure

```
telegram-watcher/
├── src/                # Main application code
│   ├── helpers/        # Utility functions
│   ├── types/          # TypeScript type definitions
│   └── ...            # Other source files
├── scripts/           # Utility scripts
│   └── create-watcher.js  # Watcher creation tool
├── watchers/           # All watchers
│   └── my-watcher/     # Example watcher
│       ├── src/        # Source code
│       │   └── index.ts
│       ├── package.json
│       └── tsconfig.json
└── ...                # Other project files
```

## Getting Started

1. Clone the repository
2. Copy `.env.example` to `.env` and configure your Telegram bot token
3. Install dependencies: `npm install`
4. Run the application: `npm start`

## Creating a New Watcher

The project includes a flexible CLI tool to create new watchers. You can use it in several ways:

### Interactive Mode (Default)
```bash
npm run create-watcher
```
This will prompt you for:
- Watcher name (lowercase, no spaces)
- Whether to install dependencies
- Additional dependencies to install (optional, space-separated)

### Direct Mode
```bash
npm run create-watcher my-watcher
```

### Command Line Options
```bash
npm run create-watcher -- --help        # Show help
npm run create-watcher -- --version     # Show version
npm run create-watcher -- -i            # Force interactive mode
npm run create-watcher -- -y            # Skip prompts and use defaults
npm run create-watcher -- -d "axios cheerio"  # Specify dependencies
```

### Examples

1. Basic interactive creation:
```bash
$ npm run create-watcher
? Enter the name of your watcher: my-watcher
? Would you like to install dependencies now? Yes
? Enter additional dependencies to install (space-separated, optional): axios cheerio
```

2. Quick creation with defaults:
```bash
$ npm run create-watcher my-watcher -- -y
```

3. Create with specific dependencies:
```bash
$ npm run create-watcher my-watcher -- -d "axios cheerio puppeteer"
```

The tool will:
- Create a new watcher directory with the proper structure
- Set up TypeScript configuration
- Create a basic watcher implementation
- Install dependencies (if requested)
- Install any additional dependencies you specify

## Watcher Structure

All watchers are created in the `watchers/` directory with a simple folder structure:

```
watchers/my-watcher/
├── src/              # Source code folder
│   └── index.ts      # Main watcher implementation
├── package.json      # Dependencies
└── tsconfig.json     # TypeScript configuration
```

Each watcher can have its own dependencies and can be developed independently from the main application.

## Using Watchers

After creating a watcher:

1. Navigate to the watcher directory:
   ```bash
   cd watchers/your-watcher-name
   ```
   
2. Install any additional dependencies your watcher needs:
   ```bash
   npm install your-dependency
   ```
   
3. Start the main application which will automatically detect and load your watcher:
   ```bash
   cd ../..
   npm start
   ```

The watcher system will automatically discover and load your watcher directly from the TypeScript source.

## Watcher Implementation

Each watcher is a module that exports a configuration object. There are three types of watchers available:

### 1. URL Watcher
For monitoring HTTP endpoints and APIs:
```typescript
const watcher: Watcher = {
    name: 'API Monitor',
    type: 'url',
    url: 'https://api.example.com/endpoint',
    enabled: true,
    responseType: 'json', // or 'text'
    requestType: 'GET',   // optional, defaults to 'GET'
    
    // Optional: Add custom headers
    headers: async () => ({
        'Authorization': 'Bearer your-token-here'
    }),
    
    notify: (response, status) => {
        // Process response and return notification message
        return 'Change detected!';
    }
};
```

### 2. Managed Watcher
For complex monitoring scenarios that require custom logic:
```typescript
const watcher: Watcher = {
    name: 'Custom Monitor',
    type: 'managed',
    enabled: true,
    
    watch: async () => {
        // Implement your custom monitoring logic here
        // Return notification message or null
        return 'Custom change detected!';
    }
};
```

### 3. File Watcher
For monitoring local file changes:
```typescript
const watcher: Watcher = {
    name: 'File Monitor',
    type: 'file',
    enabled: true,
    filePath: '/path/to/your/file.txt',
    
    notify: (content) => {
        // Process file content and return notification message
        return 'File changed!';
    }
};
```

### Watcher Configuration Options

Common options for all watchers:
- `name`: Display name of the watcher
- `enabled`: Whether the watcher is active (defaults to true)

URL Watcher specific options:
- `type`: Set to 'url'
- `url`: URL to monitor
- `requestType`: HTTP method ('GET', 'POST', 'PUT', 'DELETE', 'PATCH')
- `responseType`: Expected response type ('json' or 'text')
- `headers`: Optional function to provide custom headers
- `notify`: Function to process the response and generate notifications

Managed Watcher specific options:
- `type`: Set to 'managed'
- `watch`: Async function implementing custom monitoring logic

File Watcher specific options:
- `type`: Set to 'file'
- `filePath`: Path to the file to monitor
- `notify`: Function to process file content and generate notifications

### Example Implementation

Here's a complete example of a URL watcher that checks for new items in an API:

```typescript
import { Watcher } from "@/types/watcher.js";
import { localStorage } from "@/helpers/localstorage.js";

const watcher: Watcher = {
    name: 'Product Monitor',
    type: 'url',
    url: 'https://api.example.com/products',
    enabled: true,
    responseType: 'json',
    
    notify: (response, status) => {
        // Store previous items in localStorage
        const storageKey = 'product-monitor-items';
        const storedItems = JSON.parse(localStorage.getItem(storageKey) || '[]');
        
        // Find new items
        const newItems = response.items.filter(item => 
            !storedItems.some(s => s.id === item.id)
        );
        
        if (newItems.length === 0) return null;
        
        // Update stored items
        localStorage.setItem(storageKey, JSON.stringify(response.items));
        
        // Generate notification
        return `Found ${newItems.length} new products:\n` +
               newItems.map(item => `- ${item.name}`).join('\n');
    }
};

export default watcher;
```

## Installing Third-Party Watchers

To install a third-party watcher:

1. Create a directory in the `watchers/` folder with the watcher name
2. Copy the watcher code or clone the repository into that directory
3. Install dependencies if needed: `cd watchers/watcher-name && npm install`
4. Restart the application

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the ISC License - see the LICENSE file for details.