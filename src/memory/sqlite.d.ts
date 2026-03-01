import { Memory, Message } from '../core/plugin';
export declare class SqliteMemory implements Memory {
    name: string;
    private db;
    constructor(dbPath: string);
    initialize(): Promise<void>;
    addMessage(sessionId: string, message: Message): Promise<void>;
    getMessages(sessionId: string, limit?: number): Promise<Message[]>;
    clearSession(sessionId: string): Promise<void>;
}
//# sourceMappingURL=sqlite.d.ts.map