import { Core, ElementDefinition, NodeSingular, EdgeSingular } from 'cytoscape';
import { Cardinality, RelationshipType } from '@/lib/graphql/relationships';

/**
 * Cytoscape node data structure
 */
export interface CytoscapeNodeData {
  id: string;
  label: string;
  description?: string;
  isActive: boolean;
  type: 'objectType';
}

/**
 * Cytoscape edge data structure
 */
export interface CytoscapeEdgeData {
  id: string;
  source: string;
  target: string;
  label: string;
  relationshipType: RelationshipType;
  cardinality: Cardinality;
  isBidirectional: boolean;
  description?: string;
}

/**
 * Graph layout options
 */
export type LayoutType = 'dagre' | 'breadthfirst' | 'circle' | 'grid' | 'cose';

/**
 * Graph filter options
 */
export interface GraphFilters {
  searchQuery: string;
  relationshipTypes: RelationshipType[];
  cardinalityTypes: Cardinality[];
  showInactiveNodes: boolean;
}

/**
 * Graph view state
 */
export interface GraphViewState {
  zoom: number;
  pan: { x: number; y: number };
  selectedNodeId?: string;
  selectedEdgeId?: string;
  highlightedPath?: string[];
  layout: LayoutType;
  filters: GraphFilters;
}

/**
 * Graph interaction handlers
 */
export interface GraphInteractionHandlers {
  onNodeClick?: (nodeId: string, node: NodeSingular) => void;
  onEdgeClick?: (edgeId: string, edge: EdgeSingular) => void;
  onNodeHover?: (nodeId: string | null) => void;
  onEdgeHover?: (edgeId: string | null) => void;
  onBackgroundClick?: () => void;
  onDragStart?: (sourceNodeId: string) => void;
  onDragEnd?: (sourceNodeId: string, targetNodeId: string | null) => void;
}

/**
 * Export format options
 */
export type ExportFormat = 'png' | 'jpg' | 'svg';

/**
 * Graph statistics
 */
export interface GraphStatistics {
  nodeCount: number;
  edgeCount: number;
  isolatedNodes: number;
  connectedComponents: number;
  averageDegree: number;
  maxDepth: number;
}

/**
 * Node position for manual layout
 */
export interface NodePosition {
  x: number;
  y: number;
}

/**
 * Cytoscape stylesheet configuration
 */
export const DEFAULT_GRAPH_STYLE = [
  // Node styles
  {
    selector: 'node',
    style: {
      'background-color': '#3b82f6',
      'border-width': 2,
      'border-color': '#1e40af',
      'label': 'data(label)',
      'text-valign': 'center',
      'text-halign': 'center',
      'color': '#ffffff',
      'font-size': 12,
      'font-weight': 500,
      'text-outline-width': 2,
      'text-outline-color': '#1e293b',
      'width': 60,
      'height': 60,
      'shape': 'ellipse',
    },
  },
  // Inactive node
  {
    selector: 'node[isActive = false]',
    style: {
      'background-color': '#64748b',
      'border-color': '#475569',
      'opacity': 0.6,
    },
  },
  // Selected node
  {
    selector: 'node:selected',
    style: {
      'background-color': '#10b981',
      'border-color': '#059669',
      'border-width': 3,
      'overlay-color': '#10b981',
      'overlay-opacity': 0.2,
      'overlay-padding': 8,
    },
  },
  // Hovered node
  {
    selector: 'node:active',
    style: {
      'overlay-color': '#3b82f6',
      'overlay-opacity': 0.3,
      'overlay-padding': 6,
    },
  },
  // Highlighted node (in path)
  {
    selector: 'node.highlighted',
    style: {
      'background-color': '#f59e0b',
      'border-color': '#d97706',
      'border-width': 3,
    },
  },
  // Edge styles
  {
    selector: 'edge',
    style: {
      'width': 2,
      'line-color': '#64748b',
      'target-arrow-color': '#64748b',
      'target-arrow-shape': 'triangle',
      'curve-style': 'bezier',
      'label': 'data(label)',
      'font-size': 10,
      'text-rotation': 'autorotate',
      'text-margin-y': -10,
      'color': '#94a3b8',
      'text-outline-width': 1,
      'text-outline-color': '#1e293b',
    },
  },
  // Bidirectional edge
  {
    selector: 'edge[isBidirectional = true]',
    style: {
      'source-arrow-shape': 'triangle',
      'source-arrow-color': '#64748b',
    },
  },
  // Edge by cardinality
  {
    selector: 'edge[cardinality = "ONE_TO_ONE"]',
    style: {
      'line-style': 'solid',
      'line-color': '#3b82f6',
      'target-arrow-color': '#3b82f6',
      'source-arrow-color': '#3b82f6',
    },
  },
  {
    selector: 'edge[cardinality = "ONE_TO_MANY"]',
    style: {
      'line-style': 'dashed',
      'line-color': '#8b5cf6',
      'target-arrow-color': '#8b5cf6',
      'source-arrow-color': '#8b5cf6',
    },
  },
  {
    selector: 'edge[cardinality = "MANY_TO_MANY"]',
    style: {
      'line-style': 'dotted',
      'line-color': '#ec4899',
      'target-arrow-color': '#ec4899',
      'source-arrow-color': '#ec4899',
    },
  },
  // Selected edge
  {
    selector: 'edge:selected',
    style: {
      'line-color': '#10b981',
      'target-arrow-color': '#10b981',
      'source-arrow-color': '#10b981',
      'width': 3,
    },
  },
  // Highlighted edge (in path)
  {
    selector: 'edge.highlighted',
    style: {
      'line-color': '#f59e0b',
      'target-arrow-color': '#f59e0b',
      'source-arrow-color': '#f59e0b',
      'width': 3,
    },
  },
];

/**
 * Layout configurations
 */
export const LAYOUT_CONFIGS = {
  dagre: {
    name: 'dagre',
    rankDir: 'TB',
    nodeSep: 80,
    rankSep: 100,
    animate: true,
    animationDuration: 500,
    fit: true,
    padding: 50,
  },
  breadthfirst: {
    name: 'breadthfirst',
    directed: true,
    spacingFactor: 1.5,
    animate: true,
    animationDuration: 500,
    fit: true,
    padding: 50,
  },
  circle: {
    name: 'circle',
    animate: true,
    animationDuration: 500,
    fit: true,
    padding: 50,
    spacingFactor: 1.5,
  },
  grid: {
    name: 'grid',
    animate: true,
    animationDuration: 500,
    fit: true,
    padding: 50,
    spacingFactor: 1.5,
  },
  cose: {
    name: 'cose',
    animate: true,
    animationDuration: 500,
    fit: true,
    padding: 50,
    nodeRepulsion: 8000,
    idealEdgeLength: 100,
  },
};
