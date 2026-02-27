import { z } from 'zod';
import fs from 'fs-extra';
import path from 'path';

// Data directory for persistence
const DATA_DIR = path.join(process.cwd(), '.data');
const MEMORY_FILE = path.join(DATA_DIR, 'memory.json');

// Ensure data directory exists
await fs.ensureDir(DATA_DIR);

export const MemoryEntrySchema = z.object({
  id: z.string(),
  type: z.enum(['fact', 'preference', 'task', 'context']),
  content: z.string(),
  embedding: z.array(z.number()).optional(),
  createdAt: z.string(),
  updatedAt: z.string()
});

export type MemoryEntry = z.infer<typeof MemoryEntrySchema>;

// Simple embedding generation (can be replaced with actual embeddings)
function generateEmbedding(text: string): number[] {
  // Simple hash-based embedding for MVP
  // In production, use OpenAI embeddings or similar
  const vector: number[] = [];
  const normalized = text.toLowerCase().replace(/[^a-z0-9]/g, '');
  const dim = 128;

  for (let i = 0; i < dim; i++) {
    const charCode = normalized.charCodeAt(i % normalized.length) || 0;
    vector.push((charCode / 255) * 2 - 1);
  }

  return vector;
}

// Cosine similarity for vector search
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// In-memory store with persistence
let store = new Map<string, MemoryEntry>();

// Load from disk
async function loadStore(): Promise<void> {
  try {
    if (await fs.pathExists(MEMORY_FILE)) {
      const data = await fs.readJson(MEMORY_FILE);
      store = new Map(data.map((entry: MemoryEntry) => [entry.id, entry]));
      console.error(`[Memory] Loaded ${store.size} entries from disk`);
    }
  } catch (error) {
    console.error('[Memory] Failed to load from disk:', error);
  }
}

// Save to disk
async function saveStore(): Promise<void> {
  try {
    const data = Array.from(store.values());
    await fs.writeJson(MEMORY_FILE, data, { spaces: 2 });
    console.error(`[Memory] Saved ${data.length} entries to disk`);
  } catch (error) {
    console.error('[Memory] Failed to save to disk:', error);
  }
}

// Initialize store
await loadStore();

export async function createEntry(type: MemoryEntry['type'], content: string): Promise<MemoryEntry> {
  const now = new Date().toISOString();
  const embedding = generateEmbedding(content);

  const entry = MemoryEntrySchema.parse({
    id: crypto.randomUUID(),
    type,
    content,
    embedding,
    createdAt: now,
    updatedAt: now
  });

  store.set(entry.id, entry);
  await saveStore();

  return entry;
}

export async function getEntry(id: string): Promise<MemoryEntry | undefined> {
  return store.get(id);
}

export async function listEntries(): Promise<MemoryEntry[]> {
  return Array.from(store.values());
}

export async function searchEntries(query: string, limit: number = 10): Promise<MemoryEntry[]> {
  const queryEmbedding = generateEmbedding(query);

  const results = Array.from(store.values())
    .filter(entry => entry.embedding)
    .map(entry => ({
      entry,
      similarity: entry.embedding ? cosineSimilarity(queryEmbedding, entry.embedding) : 0
    }))
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit)
    .map(result => result.entry);

  return results;
}

export async function deleteEntry(id: string): Promise<boolean> {
  const existed = store.delete(id);
  if (existed) {
    await saveStore();
  }
  return existed;
}

export async function updateEntry(id: string, content: string): Promise<MemoryEntry | null> {
  const existing = store.get(id);
  if (!existing) return null;

  const updated = MemoryEntrySchema.parse({
    ...existing,
    content,
    embedding: generateEmbedding(content),
    updatedAt: new Date().toISOString()
  });

  store.set(id, updated);
  await saveStore();

  return updated;
}
