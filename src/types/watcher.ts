import { Channel } from "./channel";

interface GeneralWatcher {
  name: string;
  url: string;
  // channels: Channel[];
  requestType?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  responseType: 'text' | 'json';
  headers?: () => HeadersInit | undefined;
}

interface ChangeWatcher {
  watchType: 'change';
  notify: () => string
}

// interface MatchWatcher {
//   watchType: 'match';
// }

interface CustomWatcher {
  watchType: 'custom';
  notify: (response: any, status: number) => string | null
}

export type Watcher = GeneralWatcher & (
  CustomWatcher /* | ChangeWatcher */
);