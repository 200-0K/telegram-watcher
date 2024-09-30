import { Watcher } from "../types/watcher";

const watchers: Watcher[] = [
  {
    name: 'Dummy Json',
    url: 'https://dummyjson.com/auth/me',
    headers: () => ({
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJlbWlseXMiLCJlbWFpbCI6ImVtaWx5LmpvaG5zb25AeC5kdW1teWpzb24uY29tIiwiZmlyc3ROYW1lIjoiRW1pbHkiLCJsYXN0TmFtZSI6IkpvaG5zb24iLCJnZW5kZXIiOiJmZW1hbGUiLCJpbWFnZSI6Imh0dHBzOi8vZHVtbXlqc29uLmNvbS9pY29uL2VtaWx5cy8xMjgiLCJpYXQiOjE3Mjc3MTExNjksImV4cCI6MTcyNzcxMjk2OX0.D-2mWpRqkGhpa6MCyQ79g59rMJfu_f5LI_Xdbc8a0Zw'
    }),
    watchType: 'custom',
    responseType: 'json',
    notify: (response, status) => {
      return `Dummy json response (${status}):\n\`\`\`${JSON.stringify(response, null, 2)}\n\`\`\``;
    },
  }
];