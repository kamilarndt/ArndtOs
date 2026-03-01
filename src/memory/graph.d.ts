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
export declare class KnowledgeGraph {
    private nodes;
    private edges;
    addNode(node: GraphNode): void;
    addEdge(edge: GraphEdge): void;
    traverse(startNodeId: string, maxDepth?: number): GraphNode[];
}
//# sourceMappingURL=graph.d.ts.map