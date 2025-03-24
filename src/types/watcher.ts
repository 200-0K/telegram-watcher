import { Channel } from "./channel.js";

interface GeneralWatcher {
  name: string;
  url: string;
  enabled?: boolean; // indicates if the watcher is active, defaults to true
  // channels: Channel[];
  requestType?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  responseType: 'text' | 'json';
  headers?: () => Promise<HeadersInit | undefined>;
  // auth?: {
  //   authType: 'bearer';
  //   token: string;
  // } & (
  //   {
  //     refreshUrl: string;
  //     refreshToken: string;
  //     needRefresh?: (token: string) => boolean;
  //     refresh?: (response: any, status: number) => Promise<string>;
  //   } | undefined
  // )
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