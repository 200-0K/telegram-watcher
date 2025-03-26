import { parseJson } from "@/helpers/json.js";
import { report } from "@/helpers/notifier.js";
import { loadWatchers } from "@/watchers.js";
import { readFile } from 'fs/promises';

const runWatchers = async () => {
  // Dynamically load all watchers
  const watchers = await loadWatchers();

  for (const watcher of watchers) {
    // Skip disabled watchers
    if (watcher.enabled === false) {
      console.log(`Skipping disabled watcher: ${watcher.name}`);
      continue;
    }

    console.log(`Running watcher: ${watcher.name}`);

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
      }
    } catch (e) {
      await report(watcher.name, `Error:\n\`\`\`\n${e}\n\`\`\``);
    }
  }
};

// Execute the watcher script
runWatchers().catch(err => {
  console.error('Failed to run watchers:', err);
});