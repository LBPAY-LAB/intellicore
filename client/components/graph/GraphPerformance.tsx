/**
 * Graph Performance Utilities
 * Provides performance optimization helpers for large graphs
 */

import { Core, ElementDefinition } from 'cytoscape';
import { useMemo, useCallback, useState } from 'react';

/**
 * Debounce function for performance optimization
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle function for performance optimization
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Virtual rendering helper for large graphs
 * Only renders elements within viewport + buffer zone
 */
export class GraphVirtualizer {
  private cy: Core;
  private viewportBuffer: number;

  constructor(cy: Core, viewportBuffer: number = 200) {
    this.cy = cy;
    this.viewportBuffer = viewportBuffer;
  }

  /**
   * Get elements that are currently visible in viewport
   */
  getVisibleElements(): ElementDefinition[] {
    const extent = this.cy.extent();
    const buffer = this.viewportBuffer;

    const visibleBounds = {
      x1: extent.x1 - buffer,
      y1: extent.y1 - buffer,
      x2: extent.x2 + buffer,
      y2: extent.y2 + buffer,
    };

    const visibleElements: ElementDefinition[] = [];

    // Check nodes
    this.cy.nodes().forEach((node) => {
      const pos = node.position();
      if (
        pos.x >= visibleBounds.x1 &&
        pos.x <= visibleBounds.x2 &&
        pos.y >= visibleBounds.y1 &&
        pos.y <= visibleBounds.y2
      ) {
        visibleElements.push({ data: node.data(), position: pos });
      }
    });

    // Check edges connected to visible nodes
    const visibleNodeIds = new Set(
      visibleElements.map((el) => el.data?.id).filter(Boolean)
    );

    this.cy.edges().forEach((edge) => {
      const sourceId = edge.source().id();
      const targetId = edge.target().id();

      if (visibleNodeIds.has(sourceId) || visibleNodeIds.has(targetId)) {
        visibleElements.push({ data: edge.data() });
      }
    });

    return visibleElements;
  }

  /**
   * Update visibility based on viewport
   */
  updateVisibility(): void {
    const extent = this.cy.extent();
    const buffer = this.viewportBuffer;

    const visibleBounds = {
      x1: extent.x1 - buffer,
      y1: extent.y1 - buffer,
      x2: extent.x2 + buffer,
      y2: extent.y2 + buffer,
    };

    // Hide nodes outside viewport
    this.cy.nodes().forEach((node) => {
      const pos = node.position();
      const isVisible =
        pos.x >= visibleBounds.x1 &&
        pos.x <= visibleBounds.x2 &&
        pos.y >= visibleBounds.y1 &&
        pos.y <= visibleBounds.y2;

      if (isVisible) {
        node.style('display', 'element');
      } else {
        node.style('display', 'none');
      }
    });

    // Update edge visibility
    this.cy.edges().forEach((edge) => {
      const sourceVisible = edge.source().style('display') === 'element';
      const targetVisible = edge.target().style('display') === 'element';

      if (sourceVisible && targetVisible) {
        edge.style('display', 'element');
      } else {
        edge.style('display', 'none');
      }
    });
  }
}

/**
 * Performance monitoring hook
 */
export const usePerformanceMonitor = (enabled: boolean = true) => {
  const startTime = useMemo(() => performance.now(), []);

  const measure = useCallback(
    (label: string) => {
      if (!enabled) return;

      const endTime = performance.now();
      const duration = endTime - startTime;

      console.log(`[Performance] ${label}: ${duration.toFixed(2)}ms`);

      // Log warning if operation is slow
      if (duration > 1000) {
        console.warn(`[Performance Warning] ${label} took ${duration.toFixed(2)}ms`);
      }
    },
    [startTime, enabled]
  );

  return { measure };
};

/**
 * Batch operations for better performance
 */
export class BatchOperations {
  private operations: (() => void)[] = [];
  private isScheduled: boolean = false;

  /**
   * Add operation to batch
   */
  add(operation: () => void): void {
    this.operations.push(operation);
    this.schedule();
  }

  /**
   * Schedule batch execution
   */
  private schedule(): void {
    if (this.isScheduled) return;

    this.isScheduled = true;
    requestAnimationFrame(() => {
      this.execute();
    });
  }

  /**
   * Execute all batched operations
   */
  private execute(): void {
    const ops = this.operations.slice();
    this.operations = [];
    this.isScheduled = false;

    ops.forEach((op) => op());
  }

  /**
   * Clear pending operations
   */
  clear(): void {
    this.operations = [];
    this.isScheduled = false;
  }
}

/**
 * Optimize graph layout calculation
 */
export const optimizeLayout = (cy: Core, nodeCount: number): any => {
  // Choose layout based on graph size
  if (nodeCount < 50) {
    return {
      name: 'dagre',
      rankDir: 'TB',
      nodeSep: 80,
      rankSep: 100,
      animate: true,
      animationDuration: 500,
      fit: true,
      padding: 50,
    };
  } else if (nodeCount < 200) {
    return {
      name: 'cose',
      animate: false, // Disable animation for better performance
      fit: true,
      padding: 50,
      nodeRepulsion: 8000,
      idealEdgeLength: 100,
      numIter: 500, // Reduce iterations
    };
  } else {
    return {
      name: 'grid',
      animate: false,
      fit: true,
      padding: 50,
      spacingFactor: 1.5,
    };
  }
};

/**
 * Lazy load graph elements
 */
export const useLazyGraphElements = (
  elements: ElementDefinition[],
  batchSize: number = 100
) => {
  const [loadedCount, setLoadedCount] = useState(0);

  const loadedElements = useMemo(() => {
    return elements.slice(0, loadedCount);
  }, [elements, loadedCount]);

  const loadMore = useCallback(() => {
    setLoadedCount((prev) => Math.min(prev + batchSize, elements.length));
  }, [batchSize, elements.length]);

  const hasMore = loadedCount < elements.length;

  return { loadedElements, loadMore, hasMore, progress: loadedCount / elements.length };
};

/**
 * Memoize expensive calculations
 */
export const useMemoizedGraphStats = (elements: ElementDefinition[]) => {
  return useMemo(() => {
    const nodes = elements.filter((el) => !el.data?.source);
    const edges = elements.filter((el) => el.data?.source);

    const nodeDegrees = new Map<string, number>();

    edges.forEach((edge) => {
      const source = edge.data?.source;
      const target = edge.data?.target;

      if (source) nodeDegrees.set(source, (nodeDegrees.get(source) || 0) + 1);
      if (target) nodeDegrees.set(target, (nodeDegrees.get(target) || 0) + 1);
    });

    const isolatedNodes = nodes.filter((node) => !nodeDegrees.has(node.data?.id || ''));

    const totalDegree = Array.from(nodeDegrees.values()).reduce((sum, deg) => sum + deg, 0);
    const averageDegree = nodes.length > 0 ? totalDegree / nodes.length : 0;

    return {
      nodeCount: nodes.length,
      edgeCount: edges.length,
      isolatedNodeCount: isolatedNodes.length,
      averageDegree: Math.round(averageDegree * 100) / 100,
      maxDegree: Math.max(...Array.from(nodeDegrees.values()), 0),
    };
  }, [elements]);
};
