import { Tool } from '../core/plugin';
export declare class BrowserTools {
    private browser;
    private page;
    private ensurePage;
    get navigateTool(): Tool;
    get extractTool(): Tool;
    get clickTool(): Tool;
    get typeTool(): Tool;
    get screenshotTool(): Tool;
    close(): Promise<void>;
}
//# sourceMappingURL=browser.d.ts.map