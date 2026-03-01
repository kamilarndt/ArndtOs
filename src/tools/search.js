"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSearchTool = void 0;
const plugin_1 = require("../core/plugin");
class WebSearchTool {
    get searchTool() {
        return {
            name: 'web_search',
            description: 'Search the web using DuckDuckGo',
            parameters: {
                type: 'object',
                properties: { query: { type: 'string' }, limit: { type: 'number' } },
                required: ['query']
            },
            execute: async (args) => {
                const query = encodeURIComponent(args.query);
                const limit = args.limit || 5;
                try {
                    // Utilizing DuckDuckGo HTML search for a simple scraping-based fallback, 
                    // or ideally a paid API like Bing/Google Custom Search
                    const response = await fetch(`https://html.duckduckgo.com/html/?q=${query}`);
                    const text = await response.text();
                    // Simple regex extraction for fallback (in production, use an actual parser or API)
                    const results = [];
                    const regex = /<a class="result__url" href="([^"]+)">(.*?)<\/a>/g;
                    let match;
                    while ((match = regex.exec(text)) !== null && results.length < limit) {
                        results.push({ url: match[1], title: match[2].replace(/<[^>]+>/g, '') });
                    }
                    return { results: results.length > 0 ? results : 'No results found or parser failed' };
                }
                catch (error) {
                    return { error: `Search failed: ${error.message}` };
                }
            }
        };
    }
}
exports.WebSearchTool = WebSearchTool;
//# sourceMappingURL=search.js.map