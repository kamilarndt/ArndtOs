import Database from 'better-sqlite3';
import { Memory, Message } from '../core/plugin';
import { randomUUID } from 'crypto';

export class SqliteMemory implements Memory {
    public name = 'sqlite_memory';
    private db: Database.Database;

    constructor(dbPath: string) {
        // Open in standard read/write, rely on WAL mode for concurrent access
        this.db = new Database(dbPath);
        // Ensure we run in WAL mode to play nicely with ZeroClaw's connection
        this.db.pragma('journal_mode = WAL');
    }

    public async initialize(): Promise<void> {
        // We assume the schema is managed by ZeroClaw (memories table, FTS5 indexes).
        // Just verify the table exists.
        const stmt = this.db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='memories'");
        const row = stmt.get();
        if (!row) {
            console.warn('Warning: memories table not found in the connected database. Is this the correct ZeroClaw brain.db?');
        } else {
            console.log('Successfully connected to ZeroClaw memory database.');
        }
    }

    public async addMessage(sessionId: string, message: Message): Promise<void> {
        // Map our Node message format to ZeroClaw's memories schema
        const id = randomUUID();
        const key = `node_agent_${sessionId}_${Date.now()}`;
        const category = 'conversation';
        const content = typeof message.content === 'string' ? message.content : JSON.stringify(message.content);
        const now = new Date().toISOString();

        const stmt = this.db.prepare(`
      INSERT INTO memories (id, key, content, category, created_at, updated_at, session_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

        stmt.run(id, key, `[${message.role.toUpperCase()}] ${content}`, category, now, now, sessionId);
    }

    public async getMessages(sessionId: string, limit: number = 50): Promise<Message[]> {
        // ZeroClaw saves Telegram messages with keys like telegram_Kamarndt_telegram_6776474378_326
        // We will retrieve all 'conversation' category messages for this session, or globally if sessionId is generic

        let stmt;
        let rows;

        if (sessionId === 'global') {
            stmt = this.db.prepare(`
        SELECT content, created_at 
        FROM memories 
        WHERE category = 'conversation' 
        ORDER BY created_at DESC 
        LIMIT ?
      `);
            rows = stmt.all(limit) as { content: string, created_at: string }[];
        } else {
            stmt = this.db.prepare(`
        SELECT content, created_at 
        FROM memories 
        WHERE category = 'conversation' AND (session_id = ? OR key LIKE ?)
        ORDER BY created_at DESC 
        LIMIT ?
      `);
            rows = stmt.all(sessionId, `%${sessionId}%`, limit) as { content: string, created_at: string }[];
        }

        // Reconstruct the flow (ZeroClaw typically embeds the role in the content or context)
        // We reverse so chronological order is maintained for LLM (oldest first)
        return rows.reverse().map(r => {
            // Very naive role parsing. If the content starts with [USER] or [ASSISTANT], strip it.
            let role: any = 'user';
            let cleanContent = r.content;

            if (cleanContent.startsWith('[SYSTEM]')) { role = 'system'; cleanContent = cleanContent.replace('[SYSTEM]', '').trim(); }
            else if (cleanContent.startsWith('[ASSISTANT]')) { role = 'assistant'; cleanContent = cleanContent.replace('[ASSISTANT]', '').trim(); }
            else if (cleanContent.startsWith('[USER]')) { role = 'user'; cleanContent = cleanContent.replace('[USER]', '').trim(); }
            // ZeroClaw saves pure strings, assume user if unsigned
            else { role = 'user'; }

            return { role, content: cleanContent } as Message;
        });
    }

    public async clearSession(sessionId: string): Promise<void> {
        // DANGEROUS: deletes actual ZeroClaw memory for this session
        const stmt = this.db.prepare('DELETE FROM memories WHERE session_id = ? OR key LIKE ?');
        stmt.run(sessionId, `%${sessionId}%`);
    }
}
