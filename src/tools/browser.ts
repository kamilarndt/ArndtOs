import { chromium, Browser, Page } from 'playwright';
import { Tool } from '../core/plugin';

export class BrowserTools {
    private browser: Browser | null = null;
    private page: Page | null = null;

    private async ensurePage(): Promise<Page> {
        if (!this.browser) {
            this.browser = await chromium.launch({ headless: true });
        }
        if (!this.page) {
            const context = await this.browser.newContext();
            this.page = await context.newPage();
        }
        return this.page;
    }

    public get navigateTool(): Tool {
        return {
            name: 'browser_navigate',
            description: 'Navigate to a URL',
            parameters: {
                type: 'object',
                properties: { url: { type: 'string' } },
                required: ['url']
            },
            execute: async (args: any) => {
                const page = await this.ensurePage();
                await page.goto(args.url, { waitUntil: 'load' });
                return { title: await page.title(), url: page.url() };
            }
        };
    }

    public get extractTool(): Tool {
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

    public get clickTool(): Tool {
        return {
            name: 'browser_click',
            description: 'Click an element by selector',
            parameters: {
                type: 'object',
                properties: { selector: { type: 'string' } },
                required: ['selector']
            },
            execute: async (args: any) => {
                const page = await this.ensurePage();
                await page.click(args.selector);
                return { success: true };
            }
        };
    }

    public get typeTool(): Tool {
        return {
            name: 'browser_type',
            description: 'Type text into an input field by selector',
            parameters: {
                type: 'object',
                properties: { selector: { type: 'string' }, text: { type: 'string' } },
                required: ['selector', 'text']
            },
            execute: async (args: any) => {
                const page = await this.ensurePage();
                await page.fill(args.selector, args.text);
                return { success: true };
            }
        };
    }

    public get screenshotTool(): Tool {
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

    public async close() {
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
            this.page = null;
        }
    }
}
