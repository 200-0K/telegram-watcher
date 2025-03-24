import { parseJson } from "./helpers/json.js";
import { report } from "./helpers/notifier.js";
import { loadWatchers } from "./watchers.js";

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
      const response = await fetch(watcher.url, {
        method: watcher.requestType ?? 'GET',
        headers: await watcher.headers?.(),
      });
      const text = await response.text();

      let data: any = text;
      if (watcher.responseType == 'json') {
        data = parseJson(text);
      }

      const message = watcher.notify(data, response.status);
      if (message) {
        report(watcher.name, message);
      }
    } catch (e) {
      report(watcher.name, `Error:\n\`\`\`\n${e}\n\`\`\``);
    }
  }
};

// Execute the watcher script
runWatchers().catch(err => {
  console.error('Failed to run watchers:', err);
});