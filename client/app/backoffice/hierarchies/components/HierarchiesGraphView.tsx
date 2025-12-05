'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Core } from 'cytoscape';
import { useQuery } from '@apollo/client/react';
import { useTranslation } from 'react-i18next';
import GraphVisualization from '@/components/graph/GraphVisualization';
import GraphControls from '@/components/graph/GraphControls';
import GraphFilters from '@/components/graph/GraphFilters';
import GraphMinimap from '@/components/graph/GraphMinimap';
import RelationshipDetailsPanel from '@/components/relationships/RelationshipDetailsPanel';
import RelationshipFormModal from '@/components/relationships/RelationshipFormModal';
import RelationshipDeleteDialog from '@/components/relationships/RelationshipDeleteDialog';
import { exportGraphAsImage } from '@/components/graph/GraphExport';
import { useGraphData } from '@/hooks/useGraphData';
import { useGraphInteractions } from '@/hooks/useGraphInteractions';
import { LayoutType, GraphFilters as GraphFiltersType } from '@/components/graph/types';
import {
  GET_RELATIONSHIP,
  RelationshipResponse,
  ObjectRelationship,
  FIND_SHORTEST_PATH,
  GraphShortestPathResponse,
} from '@/lib/graphql/relationships';
import { toast } from 'sonner';

/**
 * Hierarchies Graph View Component
 * Main component for graph visualization of object type relationships
 */
const HierarchiesGraphView: React.FC = () => {
  const { t } = useTranslation();
  const [layout, setLayout] = useState<LayoutType>('dagre');
  const [filters, setFilters] = useState<GraphFiltersType>({
    searchQuery: '',
    relationshipTypes: [],
    cardinalityTypes: [],
    showInactiveNodes: true,
  });
  const [showFilters, setShowFilters] = useState(true);
  const [showMinimap, setShowMinimap] = useState(true);
  const [selectedRelationship, setSelectedRelationship] = useState<ObjectRelationship | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [dragSourceNode, setDragSourceNode] = useState<string | null>(null);
  const [dragTargetNode, setDragTargetNode] = useState<string | null>(null);
  const [pathHighlightNodes, setPathHighlightNodes] = useState<string[]>([]);

  const cyRef = useRef<Core | null>(null);

  // Fetch graph data
  const { elements, nodes, edges, statistics, loading, error, refetch } = useGraphData(1000);

  // Graph interactions
  const {
    selectedNodeId,
    selectedEdgeId,
    initializeEventListeners,
    highlightPath,
    clearHighlights,
    focusNode,
    resetView,
    setSelectedEdgeId,
  } = useGraphInteractions({
    onNodeClick: (nodeId) => {
      console.log('Node clicked:', nodeId);
      setSelectedRelationship(null);
    },
    onEdgeClick: (edgeId) => {
      console.log('Edge clicked:', edgeId);
      fetchRelationshipDetails(edgeId);
    },
    onBackgroundClick: () => {
      setSelectedRelationship(null);
      clearHighlights();
    },
    onDragStart: (sourceNodeId) => {
      setDragSourceNode(sourceNodeId);
    },
    onDragEnd: (sourceNodeId, targetNodeId) => {
      if (targetNodeId && sourceNodeId !== targetNodeId) {
        setDragTargetNode(targetNodeId);
        setIsFormModalOpen(true);
      }
      setDragSourceNode(null);
    },
  });

  // Fetch relationship details when edge is clicked
  const { data: relationshipData } = useQuery<RelationshipResponse>(GET_RELATIONSHIP, {
    variables: { id: selectedEdgeId || '' },
    skip: !selectedEdgeId,
  });

  // Update selected relationship when data changes
  useEffect(() => {
    if (relationshipData?.relationship) {
      setSelectedRelationship(relationshipData.relationship);
    }
  }, [relationshipData]);

  const fetchRelationshipDetails = (edgeId: string) => {
    // The query hook will automatically fetch when selectedEdgeId changes
    setSelectedEdgeId(edgeId);
  };

  // Initialize Cytoscape
  const handleCytoscapeInit = useCallback(
    (cy: Core) => {
      cyRef.current = cy;
      initializeEventListeners(cy);
    },
    [initializeEventListeners]
  );

  // Apply filters to graph
  useEffect(() => {
    if (!cyRef.current) return;

    const cy = cyRef.current;

    // Reset visibility
    cy.elements().style('display', 'element');

    // Apply search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      cy.nodes().forEach((node) => {
        const label = node.data('label')?.toLowerCase() || '';
        if (!label.includes(query)) {
          node.style('display', 'none');
        }
      });
    }

    // Apply relationship type filter
    if (filters.relationshipTypes.length > 0) {
      cy.edges().forEach((edge) => {
        const type = edge.data('relationshipType');
        if (!filters.relationshipTypes.includes(type)) {
          edge.style('display', 'none');
        }
      });
    }

    // Apply cardinality filter
    if (filters.cardinalityTypes.length > 0) {
      cy.edges().forEach((edge) => {
        const cardinality = edge.data('cardinality');
        if (!filters.cardinalityTypes.includes(cardinality)) {
          edge.style('display', 'none');
        }
      });
    }

    // Apply inactive nodes filter
    if (!filters.showInactiveNodes) {
      cy.nodes().forEach((node) => {
        if (!node.data('isActive')) {
          node.style('display', 'none');
        }
      });
    }
  }, [filters]);

  // Handle zoom controls
  const handleZoomIn = () => {
    if (cyRef.current) {
      const currentZoom = cyRef.current.zoom();
      cyRef.current.zoom({
        level: currentZoom * 1.2,
        renderedPosition: { x: cyRef.current.width() / 2, y: cyRef.current.height() / 2 },
      });
    }
  };

  const handleZoomOut = () => {
    if (cyRef.current) {
      const currentZoom = cyRef.current.zoom();
      cyRef.current.zoom({
        level: currentZoom * 0.8,
        renderedPosition: { x: cyRef.current.width() / 2, y: cyRef.current.height() / 2 },
      });
    }
  };

  const handleFit = () => {
    if (cyRef.current) {
      cyRef.current.fit(undefined, 50);
    }
  };

  const handleCenter = () => {
    if (cyRef.current) {
      cyRef.current.center();
    }
  };

  // Handle export
  const handleExport = (format: 'png' | 'jpg' | 'svg') => {
    exportGraphAsImage(cyRef.current, format);
    toast.success('Success', {
      description: `Graph exported as ${format.toUpperCase()}`,
    });
  };

  // Handle relationship form
  const handleFormSuccess = () => {
    refetch();
    setDragSourceNode(null);
    setDragTargetNode(null);
  };

  const handleEdit = () => {
    if (selectedRelationship) {
      setIsFormModalOpen(true);
    }
  };

  const handleDelete = () => {
    if (selectedRelationship) {
      setIsDeleteDialogOpen(true);
    }
  };

  const handleDeleteSuccess = () => {
    refetch();
    setSelectedRelationship(null);
  };

  // Find and highlight path between two selected nodes
  const handleFindPath = async (sourceId: string, targetId: string) => {
    try {
      const { data } = await useQuery<GraphShortestPathResponse>(FIND_SHORTEST_PATH, {
        variables: { sourceId, targetId, maxDepth: 10 },
      });

      if (data?.graphShortestPath) {
        const pathNodes = data.graphShortestPath.path;
        setPathHighlightNodes(pathNodes);
        highlightPath(pathNodes);
        toast.success('Path found', {
          description: `Found path with ${pathNodes.length} nodes`,
        });
      } else {
        toast.info('No path found', {
          description: 'No path exists between these nodes',
        });
      }
    } catch (error) {
      console.error('Error finding path:', error);
      toast.error('Error', {
        description: 'Failed to find path between nodes',
      });
    }
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-red-700 font-semibold mb-2">{t('backoffice.hierarchies.errorLoading')}</h3>
        <p className="text-red-600 text-sm mb-4">{error.message}</p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          {t('backoffice.hierarchies.retry')}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="text-sm text-gray-600 mb-1">{t('backoffice.hierarchies.totalNodes')}</div>
          <div className="text-2xl font-bold text-gray-900">{statistics.nodeCount}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="text-sm text-gray-600 mb-1">{t('backoffice.hierarchies.totalRelationships')}</div>
          <div className="text-2xl font-bold text-gray-900">{statistics.edgeCount}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="text-sm text-gray-600 mb-1">{t('backoffice.hierarchies.isolatedNodes')}</div>
          <div className="text-2xl font-bold text-gray-900">{statistics.isolatedNodes}</div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-4 py-2 rounded transition-colors flex items-center gap-2 ${
            showFilters
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
          {t('backoffice.hierarchies.filters')}
        </button>

        <button
          onClick={() => setShowMinimap(!showMinimap)}
          className={`px-4 py-2 rounded transition-colors flex items-center gap-2 ${
            showMinimap
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
            />
          </svg>
          {t('backoffice.hierarchies.minimap')}
        </button>

        <button
          onClick={() => setIsFormModalOpen(true)}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          {t('backoffice.hierarchies.newRelationship')}
        </button>

        <button
          onClick={resetView}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors flex items-center gap-2 border border-gray-300"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          {t('backoffice.hierarchies.resetView')}
        </button>
      </div>

      {/* Main Graph Area */}
      <div className="grid grid-cols-12 gap-4">
        {/* Left Sidebar - Filters */}
        {showFilters && (
          <div className="col-span-12 lg:col-span-3">
            <GraphFilters filters={filters} onFiltersChange={setFilters} />
          </div>
        )}

        {/* Center - Graph */}
        <div className={showFilters ? 'col-span-12 lg:col-span-6' : 'col-span-12 lg:col-span-9'}>
          <GraphVisualization
            elements={elements}
            layout={layout}
            height="700px"
            onCytoscapeInit={handleCytoscapeInit}
            interactive={true}
          />
        </div>

        {/* Right Sidebar - Controls and Details */}
        <div className="col-span-12 lg:col-span-3 space-y-4">
          <GraphControls
            cy={cyRef.current}
            currentLayout={layout}
            onLayoutChange={setLayout}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onFit={handleFit}
            onCenter={handleCenter}
            onExport={handleExport}
          />

          {showMinimap && <GraphMinimap cy={cyRef.current} width={200} height={150} />}

          {selectedRelationship && (
            <RelationshipDetailsPanel
              relationship={selectedRelationship}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onClose={() => setSelectedRelationship(null)}
            />
          )}
        </div>
      </div>

      {/* Modals */}
      <RelationshipFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setDragSourceNode(null);
          setDragTargetNode(null);
        }}
        onSuccess={handleFormSuccess}
        sourceNodeId={dragSourceNode || undefined}
        targetNodeId={dragTargetNode || undefined}
        editingRelationship={selectedRelationship || undefined}
      />

      <RelationshipDeleteDialog
        isOpen={isDeleteDialogOpen}
        relationship={selectedRelationship}
        onClose={() => setIsDeleteDialogOpen(false)}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
};

export default HierarchiesGraphView;
