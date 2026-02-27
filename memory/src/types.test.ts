import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { MemoryEntrySchema, createEntry, getEntry, listEntries, searchEntries, deleteEntry, updateEntry } from './types'

describe('Memory Types', () => {
  it('should validate MemoryEntry schema', () => {
    const entry = {
      id: 'test-123',
      type: 'fact',
      content: 'Test content',
      embedding: [0.1, 0.2, 0.3],
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z'
    }
    expect(MemoryEntrySchema.safeParse(entry).success).toBe(true)
  })

  it('should reject invalid type', () => {
    const entry = {
      id: 'test-123',
      type: 'invalid',
      content: 'Test content',
      embedding: [0.1, 0.2, 0.3],
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z'
    }
    expect(MemoryEntrySchema.safeParse(entry).success).toBe(false)
  })

  it('should generate embeddings for entries', async () => {
    const entry = await createEntry('fact', 'Test memory with content')
    expect(entry.embedding).toBeDefined()
    expect(entry.embedding!.length).toBe(128)
    expect(entry.embedding!.every(v => typeof v === 'number')).toBe(true)
  })
})

describe('Memory Operations', () => {
  beforeEach(async () => {
    // Clean up all entries before each test
    const entries = await listEntries()
    for (const entry of entries) {
      await deleteEntry(entry.id)
    }
  })

  it('should create a memory entry', async () => {
    const entry = await createEntry('fact', 'Test memory')
    expect(entry.id).toBeDefined()
    expect(entry.type).toBe('fact')
    expect(entry.content).toBe('Test memory')
    expect(entry.createdAt).toBeDefined()
    expect(entry.updatedAt).toBeDefined()
    expect(entry.embedding).toBeDefined()
  })

  it('should retrieve a memory entry', async () => {
    const created = await createEntry('preference', 'User preference')
    const retrieved = await getEntry(created.id)
    expect(retrieved).toBeDefined()
    expect(retrieved?.content).toBe('User preference')
    expect(retrieved?.embedding).toBeDefined()
  })

  it('should list all memory entries', async () => {
    await createEntry('fact', 'Fact 1')
    await createEntry('context', 'Context 1')
    const entries = await listEntries()
    expect(entries.length).toBeGreaterThanOrEqual(2)
  })

  it('should update a memory entry', async () => {
    const created = await createEntry('task', 'Original task')
    const updated = await updateEntry(created.id, 'Updated task content')
    expect(updated).toBeDefined()
    expect(updated?.content).toBe('Updated task content')
    expect(updated?.updatedAt).not.toBe(created.updatedAt)
    expect(updated?.embedding).toBeDefined()
  })

  it('should return null when updating non-existent entry', async () => {
    const result = await updateEntry('non-existent-id', 'content')
    expect(result).toBeNull()
  })

  it('should delete a memory entry', async () => {
    const created = await createEntry('fact', 'To be deleted')
    const deleted = await deleteEntry(created.id)
    expect(deleted).toBe(true)

    const retrieved = await getEntry(created.id)
    expect(retrieved).toBeUndefined()
  })

  it('should return false when deleting non-existent entry', async () => {
    const deleted = await deleteEntry('non-existent-id')
    expect(deleted).toBe(false)
  })

  it('should search memories by semantic similarity', async () => {
    await createEntry('fact', 'The user likes Python programming')
    await createEntry('fact', 'JavaScript is the user\'s preferred language')
    await createEntry('fact', 'The user drinks coffee every morning')

    const results = await searchEntries('programming languages')
    expect(results.length).toBeGreaterThan(0)
    expect(results[0].content).toBeDefined()
  })

  it('should limit search results', async () => {
    await createEntry('fact', 'Entry 1')
    await createEntry('fact', 'Entry 2')
    await createEntry('fact', 'Entry 3')
    await createEntry('fact', 'Entry 4')
    await createEntry('fact', 'Entry 5')

    const results = await searchEntries('entry', 3)
    expect(results.length).toBeLessThanOrEqual(3)
  })

  it('should maintain persistence across operations', async () => {
    const entry1 = await createEntry('fact', 'Persistent entry 1')
    const entry2 = await createEntry('context', 'Persistent entry 2')

    const allEntries = await listEntries()
    const found1 = allEntries.find(e => e.id === entry1.id)
    const found2 = allEntries.find(e => e.id === entry2.id)

    expect(found1).toBeDefined()
    expect(found2).toBeDefined()
    expect(allEntries.length).toBeGreaterThanOrEqual(2)
  })

  it('should handle different memory types', async () => {
    const fact = await createEntry('fact', 'A factual statement')
    const preference = await createEntry('preference', 'User preference')
    const task = await createEntry('task', 'Task to complete')
    const context = await createEntry('context', 'Context information')

    const entries = await listEntries()
    expect(entries.find(e => e.id === fact.id)?.type).toBe('fact')
    expect(entries.find(e => e.id === preference.id)?.type).toBe('preference')
    expect(entries.find(e => e.id === task.id)?.type).toBe('task')
    expect(entries.find(e => e.id === context.id)?.type).toBe('context')
  })
})
