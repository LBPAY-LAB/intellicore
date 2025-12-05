'use client';

import { useState, useCallback, useRef } from 'react';
import { Core, NodeSingular, EdgeSingular } from 'cytoscape';
import { GraphInteractionHandlers } from '@/components/graph/types';

/**
 * Custom hook for managing graph interactions
 */
export const useGraphInteractions = (handlers?: GraphInteractionHandlers) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [hoveredEdgeId, setHoveredEdgeId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragSourceRef = useRef<string | null>(null);
  const cyRef = useRef<Core | null>(null);

  /**
   * Initialize Cytoscape event listeners
   */
  const initializeEventListeners = useCallback(
    (cy: Core) => {
      cyRef.current = cy;

      // Node click
      cy.on('tap', 'node', (evt) => {
        const node = evt.target as NodeSingular;
        const nodeId = node.id();
        setSelectedNodeId(nodeId);
        setSelectedEdgeId(null);
        handlers?.onNodeClick?.(nodeId, node);
      });

      // Edge click
      cy.on('tap', 'edge', (evt) => {
        const edge = evt.target as EdgeSingular;
        const edgeId = edge.id();
        setSelectedEdgeId(edgeId);
        setSelectedNodeId(null);
        handlers?.onEdgeClick?.(edgeId, edge);
      });

      // Background click
      cy.on('tap', (evt) => {
        if (evt.target === cy) {
          setSelectedNodeId(null);
          setSelectedEdgeId(null);
          handlers?.onBackgroundClick?.();
        }
      });

      // Node hover
      cy.on('mouseover', 'node', (evt) => {
        const node = evt.target as NodeSingular;
        const nodeId = node.id();
        setHoveredNodeId(nodeId);
        handlers?.onNodeHover?.(nodeId);
      });

      cy.on('mouseout', 'node', () => {
        setHoveredNodeId(null);
        handlers?.onNodeHover?.(null);
      });

      // Edge hover
      cy.on('mouseover', 'edge', (evt) => {
        const edge = evt.target as EdgeSingular;
        const edgeId = edge.id();
        setHoveredEdgeId(edgeId);
        handlers?.onEdgeHover?.(edgeId);
      });

      cy.on('mouseout', 'edge', () => {
        setHoveredEdgeId(null);
        handlers?.onEdgeHover?.(null);
      });

      // Drag events for relationship creation
      cy.on('grab', 'node', (evt) => {
        const node = evt.target as NodeSingular;
        dragSourceRef.current = node.id();
        setIsDragging(true);
        handlers?.onDragStart?.(node.id());
      });

      cy.on('free', 'node', (evt) => {
        if (isDragging && dragSourceRef.current) {
          const sourceId = dragSourceRef.current;

          // Check if dropped on another node
          const position = evt.target.position();
          const targetNode = cy
            .nodes()
            .filter((n: any) => n.id() !== sourceId)
            .toArray()
            .find((n: any) => {
              const nPos = n.position();
              const distance = Math.sqrt(
                Math.pow(nPos.x - position.x, 2) + Math.pow(nPos.y - position.y, 2)
              );
              return distance < 50; // Within 50px
            });

          handlers?.onDragEnd?.(sourceId, targetNode?.id() || null);
        }

        setIsDragging(false);
        dragSourceRef.current = null;
      });
    },
    [handlers, isDragging]
  );

  /**
   * Highlight a path between nodes
   */
  const highlightPath = useCallback((nodeIds: string[]) => {
    if (!cyRef.current) return;

    const cy = cyRef.current;

    // Remove previous highlighting
    cy.elements().removeClass('highlighted');

    if (nodeIds.length === 0) return;

    // Highlight nodes in path
    nodeIds.forEach((nodeId) => {
      cy.getElementById(nodeId).addClass('highlighted');
    });

    // Highlight edges between consecutive nodes in path
    for (let i = 0; i < nodeIds.length - 1; i++) {
      const sourceId = nodeIds[i];
      const targetId = nodeIds[i + 1];

      cy.edges().forEach((edge) => {
        const edgeSource = edge.source().id();
        const edgeTarget = edge.target().id();

        if (
          (edgeSource === sourceId && edgeTarget === targetId) ||
          (edgeSource === targetId && edgeTarget === sourceId)
        ) {
          edge.addClass('highlighted');
        }
      });
    }

    // Fit to highlighted elements
    const highlightedElements = cy.elements('.highlighted');
    if (highlightedElements.length > 0) {
      cy.animate({
        fit: {
          eles: highlightedElements,
          padding: 50,
        },
        duration: 500,
        easing: 'ease-in-out-cubic',
      });
    }
  }, []);

  /**
   * Clear all highlights
   */
  const clearHighlights = useCallback(() => {
    if (!cyRef.current) return;
    cyRef.current.elements().removeClass('highlighted');
  }, []);

  /**
   * Focus on a specific node
   */
  const focusNode = useCallback((nodeId: string, zoom: number = 2) => {
    if (!cyRef.current) return;

    const cy = cyRef.current;
    const node = cy.getElementById(nodeId);

    if (node.length > 0) {
      cy.animate({
        center: {
          eles: node,
        },
        zoom,
        duration: 500,
        easing: 'ease-in-out-cubic',
      });

      setSelectedNodeId(nodeId);
    }
  }, []);

  /**
   * Get neighbors of a node
   */
  const getNeighbors = useCallback((nodeId: string) => {
    if (!cyRef.current) return [];

    const cy = cyRef.current;
    const node = cy.getElementById(nodeId);

    if (node.length === 0) return [];

    return node.neighborhood('node').map((n) => n.id());
  }, []);

  /**
   * Expand node neighborhood
   */
  const expandNode = useCallback((nodeId: string) => {
    if (!cyRef.current) return;

    const cy = cyRef.current;
    const node = cy.getElementById(nodeId);

    if (node.length === 0) return;

    const neighbors = node.neighborhood();

    // Highlight neighbors
    neighbors.addClass('highlighted');

    // Fit to node and neighbors
    cy.animate({
      fit: {
        eles: node.union(neighbors),
        padding: 50,
      },
      duration: 500,
      easing: 'ease-in-out-cubic',
    });
  }, []);

  /**
   * Reset view to fit all elements
   */
  const resetView = useCallback(() => {
    if (!cyRef.current) return;

    const cy = cyRef.current;
    cy.animate({
      fit: {
        eles: cy.elements(),
        padding: 50,
      },
      zoom: 1,
      duration: 500,
      easing: 'ease-in-out-cubic',
    });

    clearHighlights();
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
  }, [clearHighlights]);

  return {
    selectedNodeId,
    selectedEdgeId,
    hoveredNodeId,
    hoveredEdgeId,
    isDragging,
    initializeEventListeners,
    highlightPath,
    clearHighlights,
    focusNode,
    getNeighbors,
    expandNode,
    resetView,
    setSelectedNodeId,
    setSelectedEdgeId,
  };
};
