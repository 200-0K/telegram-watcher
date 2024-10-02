import path from "path";
import { parseJson } from "./helpers/json";
import { report } from "./helpers/notifier";
import { watchers } from "./watchers";

for (const watcher of watchers) {
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