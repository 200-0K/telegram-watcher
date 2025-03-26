// import { Channel } from './channel.js';

// Base interface for all watchers - only truly shared properties
interface BaseWatcher {
  name: string;
  enabled?: boolean; // indicates if the watcher is active, defaults to true
}

// For watchers that make direct HTTP requests to a single URL
interface URLWatcher extends BaseWatcher {
  type: 'url';
  url: string;
  requestType?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  responseType: 'text' | 'json';
  headers?: () => Promise<HeadersInit | undefined>;
  notify: (response: any, status: number) => string | null;
}

// For watchers that manage their own state and complex logic
interface ManagedWatcher extends BaseWatcher {
  type: 'managed';
  // Instead of a single URL, we provide a function to handle the entire watching process
  watch: () => Promise<string | null>;
}

// For watchers that monitor file changes
interface FileWatcher extends BaseWatcher {
  type: 'file';
  filePath: string;
  notify: (content: string) => string | null;
}

export type Watcher = URLWatcher | ManagedWatcher | FileWatcher;
