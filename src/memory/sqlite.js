"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SqliteMemory = void 0;
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const plugin_1 = require("../core/plugin");
class SqliteMemory {
    name = 'sqlite_memory';
    db;
    constructor(dbPath) {
        this.db = new better_sqlite3_1.default(dbPath);
    }
    async initialize() {
        this.db.exec(`
      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT,
        role TEXT,
        content TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    }
    async addMessage(sessionId, message) {
        const stmt = this.db.prepare('INSERT INTO messages (session_id, role, content) VALUES (?, ?, ?)');
        stmt.run(sessionId, message.role, typeof message.content === 'string' ? message.content : JSON.stringify(message.content));
    }
    async getMessages(sessionId, limit = 50) {
        const stmt = this.db.prepare('SELECT role, content FROM messages WHERE session_id = ? ORDER BY timestamp ASC LIMIT ?');
        const rows = stmt.all(sessionId, limit);
        return rows.map(r => ({ role: r.role, content: r.content }));
    }
    async clearSession(sessionId) {
        const stmt = this.db.prepare('DELETE FROM messages WHERE session_id = ?');
        stmt.run(sessionId);
    }
}
exports.SqliteMemory = SqliteMemory;
//# sourceMappingURL=sqlite.js.map