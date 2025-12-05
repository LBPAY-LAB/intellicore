'use client';

import { useQuery } from '@apollo/client/react';
import { useMemo } from 'react';
import {
  GET_GRAPH_STRUCTURE,
  GraphStructureResponse,
  GraphNode,
  GraphEdge,
} from '@/lib/graphql/relationships';
import { ElementDefinition } from 'cytoscape';
import { CytoscapeNodeData, CytoscapeEdgeData } from '@/components/graph/types';

/**
 * Transform backend graph data to Cytoscape format
 */
const transformToCytoscapeElements = (
  nodes: GraphNode[],
  edges: GraphEdge[]
): ElementDefinition[] => {
  const cytoscapeNodes: ElementDefinition[] = nodes.map((node) => ({
    data: {
      id: node.id,
      label: node.name,
      description: node.description,
      isActive: node.is_active,
      type: 'objectType',
    } as CytoscapeNodeData,
  }));

  const cytoscapeEdges: ElementDefinition[] = edges.map((edge) => ({
    data: {
      id: edge.id,
      source: edge.source_id,
      target: edge.target_id,
      label: `${edge.relationship_type}\n(${edge.cardinality})`,
      relationshipType: edge.relationship_type,
      cardinality: edge.cardinality,
      isBidirectional: edge.is_bidirectional,
      description: edge.description,
    } as CytoscapeEdgeData,
  }));

  return [...cytoscapeNodes, ...cytoscapeEdges];
};

/**
 * Custom hook for fetching and transforming graph data
 */
export const useGraphData = (maxNodes: number = 1000) => {
  const { data, loading, error, refetch } = useQuery<GraphStructureResponse>(
    GET_GRAPH_STRUCTURE,
    {
      variables: { maxNodes },
      fetchPolicy: 'cache-and-network',
    }
  );

  const elements = useMemo(() => {
    if (!data?.graphStructure) {
      return [];
    }

    return transformToCytoscapeElements(
      data.graphStructure.nodes,
      data.graphStructure.edges
    );
  }, [data]);

  const statistics = useMemo(() => {
    if (!data?.graphStructure) {
      return {
        nodeCount: 0,
        edgeCount: 0,
        isolatedNodes: 0,
      };
    }

    const { nodes, edges } = data.graphStructure;
    const nodeConnections = new Map<string, number>();

    // Calculate node connections
    edges.forEach((edge: GraphEdge) => {
      nodeConnections.set(
        edge.source_id,
        (nodeConnections.get(edge.source_id) || 0) + 1
      );
      nodeConnections.set(
        edge.target_id,
        (nodeConnections.get(edge.target_id) || 0) + 1
      );
    });

    const isolatedNodes = nodes.filter(
      (node: GraphNode) => !nodeConnections.has(node.id)
    ).length;

    return {
      nodeCount: nodes.length,
      edgeCount: edges.length,
      isolatedNodes,
    };
  }, [data]);

  return {
    elements,
    nodes: data?.graphStructure.nodes || [],
    edges: data?.graphStructure.edges || [],
    statistics,
    loading,
    error,
    refetch,
  };
};
