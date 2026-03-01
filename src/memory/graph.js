"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KnowledgeGraph = void 0;
class KnowledgeGraph {
    nodes = new Map();
    edges = [];
    addNode(node) {
        this.nodes.set(node.id, node);
    }
    addEdge(edge) {
        if (!this.nodes.has(edge.sourceId) || !this.nodes.has(edge.targetId)) {
            throw new Error('Both source and target nodes must exist');
        }
        this.edges.push(edge);
    }
    traverse(startNodeId, maxDepth = 2) {
        const visited = new Set();
        const result = [];
        const queue = [{ id: startNodeId, depth: 0 }];
        while (queue.length > 0) {
            const current = queue.shift();
            if (visited.has(current.id) || current.depth > maxDepth)
                continue;
            visited.add(current.id);
            result.push(this.nodes.get(current.id));
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
exports.KnowledgeGraph = KnowledgeGraph;
//# sourceMappingURL=graph.js.map