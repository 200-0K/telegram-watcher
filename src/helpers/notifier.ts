import { telegram } from "@/notifiers/telegram.js";

function splitMessage(message: string) {
  let maxSize = 4000;
  const parts: string[] = [];
  let part = "";
  let codeBlock: string | null = null;

  const lines = message.split("\n");
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (part.length + line.length + (codeBlock ?? '').length > maxSize) {
      if (codeBlock) {
        part += '```\n';
      }
      parts.push(part);
      part = "";
      continue;
    }

    if (part.length === 0) {
      if (line.search(/^```$/) === 0 && codeBlock) {
        codeBlock = null;
        i++;
        continue;
      }

      if (codeBlock) {
        part += `${codeBlock}\n`;
      }
    }

    if (line.search(/^```\S+$/) === 0) {
      codeBlock = line;
    }

    if (line.search(/^```$/) === 0) {
      codeBlock = null;
    }

    if (line.search(/^```$/) === 0 && !codeBlock) {
      codeBlock = line;
    }

    part += line + "\n";
    i++;
  }

  if (part.length > 0) {
    parts.push(part);
  }

  return parts;
}

export const report = async (watcherName: string, message: string) => {
  const parts = splitMessage(message);

  // First part with watcher name and page indicator
  await telegram.send(
    `☀️ *Watcher*: _${watcherName}_\n\n` +
    `📋 *Report*${parts.length > 1 ? ` (Part 1/${parts.length})` : ''}:\n` +
    `${parts[0]}`
  );

  // Remaining parts with page indicators
  for (let i = 1; i < parts.length; i++) {
    await telegram.send(
      `📋 *Report* (Part ${i + 1}/${parts.length}):\n` +
      `${parts[i]}`
    );
  }
}