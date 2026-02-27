import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { MemoryEntry, MemoryEntrySchema, createEntry, getEntry, listEntries, searchEntries, deleteEntry, updateEntry } from './types.js';

const server = new Server(
  { name: 'zeroclaw-memory', version: '0.1.0' },
  { capabilities: { tools: {} } }
);

// Register tool list handler
server.setRequestHandler({ method: 'tools/list' } as any, async () => ({
  tools: [
    {
      name: 'store_memory',
      description: 'Store a memory entry with type and content. Automatically generates vector embeddings for semantic search.',
      inputSchema: {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            enum: ['fact', 'preference', 'task', 'context'],
            description: 'Type of memory to store'
          },
          content: {
            type: 'string',
            description: 'Content of the memory entry'
          }
        },
        required: ['type', 'content']
      }
    },
    {
      name: 'get_memory',
      description: 'Get a memory entry by ID',
      inputSchema: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'ID of the memory entry to retrieve'
          }
        },
        required: ['id']
      }
    },
    {
      name: 'list_memories',
      description: 'List all memory entries',
      inputSchema: {
        type: 'object',
        properties: {}
      }
    },
    {
      name: 'search_memories',
      description: 'Search memory entries by semantic similarity using vector embeddings',
      inputSchema: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Search query text'
          },
          limit: {
            type: 'number',
            description: 'Maximum number of results to return (default: 10)',
            default: 10
          }
        },
        required: ['query']
      }
    },
    {
      name: 'update_memory',
      description: 'Update an existing memory entry content and regenerate embeddings',
      inputSchema: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'ID of the memory entry to update'
          },
          content: {
            type: 'string',
            description: 'New content for the memory entry'
          }
        },
        required: ['id', 'content']
      }
    },
    {
      name: 'delete_memory',
      description: 'Delete a memory entry by ID',
      inputSchema: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'ID of the memory entry to delete'
          }
        },
        required: ['id']
      }
    }

// Register tool call handlers
server.setRequestHandler({ method: 'tools/call' } as any, async (request: any) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case 'store_memory': {
      const entry = await createEntry(args.type as MemoryEntry['type'], args.content as string);
      console.error(`[Memory] Stored entry: ${entry.id}`);
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(entry, null, 2)
        }]
      };
    }
    case 'get_memory': {
      const entry = await getEntry(args.id as string);
      if (!entry) {
        return {
          content: [{
            type: 'text',
            text: `Memory entry not found: ${args.id}`
          }],
          isError: true
        };
      }
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(entry, null, 2)
        }]
      };
    }
    case 'list_memories': {
      const entries = await listEntries();
      console.error(`[Memory] Listed ${entries.length} entries`);
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(entries, null, 2)
        }]
      };
    }
    case 'search_memories': {
      const query = args.query as string;
      const limit = args.limit as number || 10;
      const results = await searchEntries(query, limit);
      console.error(`[Memory] Found ${results.length} results for query: ${query}`);
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(results, null, 2)
        }]
      };
    }
    case 'update_memory': {
      const id = args.id as string;
      const content = args.content as string;
      const updated = await updateEntry(id, content);
      if (!updated) {
        return {
          content: [{
            type: 'text',
            text: `Memory entry not found: ${id}`
          }],
          isError: true
        };
      }
      console.error(`[Memory] Updated entry: ${id}`);
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(updated, null, 2)
        }]
      };
    }
    case 'delete_memory': {
      const id = args.id as string;
      const deleted = await deleteEntry(id);
      if (!deleted) {
        return {
          content: [{
            type: 'text',
            text: `Memory entry not found: ${id}`
          }],
          isError: true
        };
      }
      console.error(`[Memory] Deleted entry: ${id}`);
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({ success: true, id })
        }]
      };
    }
    default:
      return {
        content: [{
          type: 'text',
          text: `Unknown tool: ${name}`
        }],
        isError: true
      };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('ZeroClaw Memory MCP server running');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
