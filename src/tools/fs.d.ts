import { Tool } from '../core/plugin';
export declare class FileSystemTools {
    private allowedRoot;
    private maxFileSize;
    constructor(allowedRoot: string, maxFileSizeMb?: number);
    private isAllowed;
    get readFileTool(): Tool;
    get writeFileTool(): Tool;
    get deleteFileTool(): Tool;
    get listFilesTool(): Tool;
}
//# sourceMappingURL=fs.d.ts.map