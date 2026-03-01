export interface GraphNode {
    id: string;
    type: string;
    label: string;
    properties: any;
}

export interface GraphEdge {
    sourceId: string;
    targetId: string;
    relation: string;
    weight: number;
}

export class KnowledgeGraph {
    private nodes: Map<string, GraphNode> = new Map();
    private edges: GraphEdge[] = [];

    public addNode(node: GraphNode) {
        this.nodes.set(node.id, node);
    }

    public addEdge(edge: GraphEdge) {
        if (!this.nodes.has(edge.sourceId) || !this.nodes.has(edge.targetId)) {
            throw new Error('Both source and target nodes must exist');
        }
        this.edges.push(edge);
    }

    public traverse(startNodeId: string, maxDepth: number = 2): GraphNode[] {
        const visited = new Set<string>();
        const result: GraphNode[] = [];

        const queue: { id: string, depth: number }[] = [{ id: startNodeId, depth: 0 }];

        while (queue.length > 0) {
            const current = queue.shift()!;
            if (visited.has(current.id) || current.depth > maxDepth) continue;

            visited.add(current.id);
            result.push(this.nodes.get(current.id)!);

            // Find neighbors
            const neighbors = this.edges
                .filter(e => e.sourceId === current.id || e.targetId === current.id)
                .map(e => e.sourceId === current.id ? e.targetId : e.sourceId);

            for (const neighbor of neighbors) {
                if (!visited.has(neighbor)) {
                    queue.push({ id: neighbor, depth: current.depth + 1 });
                }
            }
        }

        return result;
    }
}
