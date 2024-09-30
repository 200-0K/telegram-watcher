import { Watcher } from "../types/watcher";

export const watchers: Watcher[] = (await import('./app')).default;