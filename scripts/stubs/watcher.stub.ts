import { Watcher } from "{{IMPORT_PATH}}";
import { localStorage } from "{{LOCALSTORAGE_PATH}}";

/**
 * {{DISPLAY_NAME}} watcher configuration
 */
const watcher: Watcher = {
    name: '{{DISPLAY_NAME}}',
    enabled: true,
    type: 'url',
    url: 'https://api.example.com/endpoint',
    responseType: 'json', // Use 'text' if the API returns plain text

    // Optional: Add custom headers if needed
    // headers: async () => ({
    //     'Authorization': 'Bearer your-token-here'
    // }),

    notify: (response: any, status: number) => {
        // Process the API response
        // Return a notification message string, or null if no notification should be sent

        // Example implementation:
        if (status !== 200) {
            return `Error: API returned status ${status}`;
        }

        // For JSON responses
        if (!response || !Array.isArray(response.items)) {
            return null; // No notification if response format is unexpected
        }

        // Example: Find new items since last check
        const storageKey = '{{WATCHER_NAME}}-items';
        const storedItems = JSON.parse(localStorage.getItem(storageKey) || '[]') as Array<Record<string, any>>;
        const newItems = response.items.filter((item: any) =>
            !storedItems.some((s: Record<string, any>) => s.id === item.id)
        );

        if (newItems.length === 0) return null; // No new items

        localStorage.setItem(storageKey, JSON.stringify(response.items));

        // Format your notification message
        return [
            `✨ New items found (${newItems.length}):`,
            '```',
            // Format your items here
            JSON.stringify(newItems, null, 2),
            '```'
        ].join('\n');
    }
};

export default watcher; 