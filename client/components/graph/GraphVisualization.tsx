'use client';

import React, { useEffect, useRef, useState, useCallback, memo } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import cytoscape, { Core, ElementDefinition } from 'cytoscape';
// @ts-ignore - dagre extension types may not be available
import dagre from 'cytoscape-dagre';
import {
  DEFAULT_GRAPH_STYLE,
  LAYOUT_CONFIGS,
  LayoutType,
  GraphInteractionHandlers,
} from './types';

// Register dagre layout if available
if (typeof window !== 'undefined' && cytoscape) {
  try {
    cytoscape.use(dagre);
  } catch (e) {
    console.warn('Cytoscape dagre layout not available');
  }
}

export interface GraphVisualizationProps {
  elements: ElementDefinition[];
  layout?: LayoutType;
  width?: string;
  height?: string;
  className?: string;
  interactive?: boolean;
  handlers?: GraphInteractionHandlers;
  onCytoscapeInit?: (cy: Core) => void;
  minZoom?: number;
  maxZoom?: number;
}

/**
 * Main Graph Visualization Component using Cytoscape.js
 * Renders an interactive graph with nodes and edges
 */
const GraphVisualization: React.FC<GraphVisualizationProps> = memo(
  ({
    elements,
    layout = 'dagre',
    width = '100%',
    height = '600px',
    className = '',
    interactive = true,
    handlers,
    onCytoscapeInit,
    minZoom = 0.1,
    maxZoom = 3,
  }) => {
    const cyRef = useRef<Core | null>(null);
    const [isReady, setIsReady] = useState(false);
    const [currentLayout, setCurrentLayout] = useState<LayoutType>(layout);

    /**
     * Initialize Cytoscape instance
     */
    const handleCytoscapeInit = useCallback(
      (cy: Core) => {
        cyRef.current = cy;

        // Configure viewport settings
        cy.minZoom(minZoom);
        cy.maxZoom(maxZoom);

        // Enable/disable interactivity
        if (!interactive) {
          cy.autoungrabify(true);
          cy.autounselectify(true);
          cy.panningEnabled(false);
          cy.zoomingEnabled(false);
        }

        // Apply initial layout
        const layoutConfig = LAYOUT_CONFIGS[currentLayout];
        cy.layout(layoutConfig).run();

        setIsReady(true);

        // Call parent callback
        onCytoscapeInit?.(cy);
      },
      [currentLayout, interactive, minZoom, maxZoom, onCytoscapeInit]
    );

    /**
     * Re-apply layout when it changes
     */
    const applyLayout = useCallback(
      (newLayout: LayoutType) => {
        if (!cyRef.current) return;

        const cy = cyRef.current;
        const layoutConfig = LAYOUT_CONFIGS[newLayout];

        cy.layout(layoutConfig).run();
        setCurrentLayout(newLayout);
      },
      []
    );

    /**
     * Update layout when prop changes
     */
    useEffect(() => {
      if (isReady && layout !== currentLayout) {
        applyLayout(layout);
      }
    }, [layout, currentLayout, isReady, applyLayout]);

    /**
     * Handle window resize
     */
    useEffect(() => {
      if (!cyRef.current || !isReady) return;

      const handleResize = () => {
        cyRef.current?.resize();
        cyRef.current?.fit(undefined, 50);
      };

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }, [isReady]);

    /**
     * Re-fit graph when elements change significantly
     */
    useEffect(() => {
      if (!cyRef.current || !isReady || elements.length === 0) return;

      const timer = setTimeout(() => {
        cyRef.current?.fit(undefined, 50);
      }, 100);

      return () => clearTimeout(timer);
    }, [elements.length, isReady]);

    return (
      <div className={`relative ${className}`} style={{ width, height }}>
        {elements.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200">
            <div className="text-center">
              <svg
                className="w-16 h-16 text-gray-400 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                No Graph Data
              </h3>
              <p className="text-sm text-gray-500">
                Create object types and relationships to see the graph visualization
              </p>
            </div>
          </div>
        ) : (
          <CytoscapeComponent
            elements={elements}
            style={{ width, height }}
            stylesheet={DEFAULT_GRAPH_STYLE as any}
            cy={handleCytoscapeInit}
            className="bg-gray-50 rounded-lg border border-gray-200"
          />
        )}

        {/* Loading indicator */}
        {!isReady && elements.length > 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50/80 rounded-lg">
            <div className="flex items-center gap-3 text-gray-600">
              <svg
                className="animate-spin h-6 w-6"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>Loading graph...</span>
            </div>
          </div>
        )}
      </div>
    );
  }
);

GraphVisualization.displayName = 'GraphVisualization';

export default GraphVisualization;
