export function parseJson(s: string): any {
  if (s.startsWith('[') && !s.endsWith(']')) s = s.slice(0, s.lastIndexOf('}') + 1) + ']';
  return JSON.parse(s);
}
