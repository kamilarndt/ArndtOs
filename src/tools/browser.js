"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrowserTools = void 0;
const playwright_1 = require("playwright");
const plugin_1 = require("../core/plugin");
class BrowserTools {
    browser = null;
    page = null;
    async ensurePage() {
        if (!this.browser) {
            this.browser = await playwright_1.chromium.launch({ headless: true });
        }
        if (!this.page) {
            const context = await this.browser.newContext();
            this.page = await context.newPage();
        }
        return this.page;
    }
    get navigateTool() {
        return {
            name: 'browser_navigate',
            description: 'Navigate to a URL',
            parameters: {
                type: 'object',
                properties: { url: { type: 'string' } },
                required: ['url']
            },
            execute: async (args) => {
                const page = await this.ensurePage();
                await page.goto(args.url, { waitUntil: 'load' });
                return { title: await page.title(), url: page.url() };
            }
        };
    }
    get extractTool() {
        return {
            name: 'browser_extract',
            description: 'Extract text content from the current page',
            parameters: { type: 'object', properties: {} },
            execute: async () => {
                const page = await this.ensurePage();
                const content = await page.evaluate(() => document.body.innerText);
                return { content: content.substring(0, 10000) }; // Limit extraction size
            }
        };
    }
    get clickTool() {
        return {
            name: 'browser_click',
            description: 'Click an element by selector',
            parameters: {
                type: 'object',
                properties: { selector: { type: 'string' } },
                required: ['selector']
            },
            execute: async (args) => {
                const page = await this.ensurePage();
                await page.click(args.selector);
                return { success: true };
            }
        };
    }
    get typeTool() {
        return {
            name: 'browser_type',
            description: 'Type text into an input field by selector',
            parameters: {
                type: 'object',
                properties: { selector: { type: 'string' }, text: { type: 'string' } },
                required: ['selector', 'text']
            },
            execute: async (args) => {
                const page = await this.ensurePage();
                await page.fill(args.selector, args.text);
                return { success: true };
            }
        };
    }
    get screenshotTool() {
        return {
            name: 'browser_screenshot',
            description: 'Take a screenshot of the current page and return as base64',
            parameters: { type: 'object', properties: {} },
            execute: async () => {
                const page = await this.ensurePage();
                const buffer = await page.screenshot({ type: 'png' });
                return { base64: buffer.toString('base64') };
            }
        };
    }
    async close() {
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
            this.page = null;
        }
    }
}
exports.BrowserTools = BrowserTools;
//# sourceMappingURL=browser.js.map