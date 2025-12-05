'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Core } from 'cytoscape';

export interface GraphMinimapProps {
  cy: Core | null;
  width?: number;
  height?: number;
  className?: string;
}

/**
 * Graph Minimap Component
 * Provides a small overview of the entire graph with viewport indicator
 */
const GraphMinimap: React.FC<GraphMinimapProps> = ({
  cy,
  width = 200,
  height = 150,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [viewport, setViewport] = useState({ x: 0, y: 0, w: 100, h: 100 });

  useEffect(() => {
    if (!cy || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas resolution
    canvas.width = width * 2; // 2x for retina
    canvas.height = height * 2;
    ctx.scale(2, 2);

    const updateMinimap = () => {
      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // Draw background
      ctx.fillStyle = '#f9fafb'; // gray-50
      ctx.fillRect(0, 0, width, height);

      // Get graph bounds
      const extent = cy.elements().boundingBox();
      if (!extent || extent.w === 0 || extent.h === 0) return;

      const scaleX = width / extent.w;
      const scaleY = height / extent.h;
      const scale = Math.min(scaleX, scaleY) * 0.9; // 90% to add padding

      const offsetX = (width - extent.w * scale) / 2 - extent.x1 * scale;
      const offsetY = (height - extent.h * scale) / 2 - extent.y1 * scale;

      // Draw edges
      ctx.strokeStyle = '#9ca3af'; // gray-400
      ctx.lineWidth = 1;
      cy.edges().forEach((edge) => {
        const sourcePos = edge.source().position();
        const targetPos = edge.target().position();

        ctx.beginPath();
        ctx.moveTo(
          sourcePos.x * scale + offsetX,
          sourcePos.y * scale + offsetY
        );
        ctx.lineTo(
          targetPos.x * scale + offsetX,
          targetPos.y * scale + offsetY
        );
        ctx.stroke();
      });

      // Draw nodes
      cy.nodes().forEach((node) => {
        const pos = node.position();
        const x = pos.x * scale + offsetX;
        const y = pos.y * scale + offsetY;
        const size = 3;

        ctx.fillStyle = node.selected() ? '#10b981' : '#3b82f6';
        ctx.beginPath();
        ctx.arc(x, y, size, 0, 2 * Math.PI);
        ctx.fill();
      });

      // Draw viewport rectangle
      const pan = cy.pan();
      const zoom = cy.zoom();
      const viewportExtent = {
        x1: (-pan.x) / zoom,
        y1: (-pan.y) / zoom,
        w: cy.width() / zoom,
        h: cy.height() / zoom,
      };

      const viewportX = viewportExtent.x1 * scale + offsetX;
      const viewportY = viewportExtent.y1 * scale + offsetY;
      const viewportW = viewportExtent.w * scale;
      const viewportH = viewportExtent.h * scale;

      ctx.strokeStyle = '#f59e0b'; // amber-500
      ctx.lineWidth = 2;
      ctx.strokeRect(viewportX, viewportY, viewportW, viewportH);

      // Store viewport for interaction
      setViewport({
        x: viewportX,
        y: viewportY,
        w: viewportW,
        h: viewportH,
      });
    };

    // Update minimap on various events
    updateMinimap();
    cy.on('pan zoom resize', updateMinimap);
    cy.on('add remove', updateMinimap);
    cy.on('position', updateMinimap);
    cy.on('style', updateMinimap);

    return () => {
      cy.off('pan zoom resize', updateMinimap);
      cy.off('add remove', updateMinimap);
      cy.off('position', updateMinimap);
      cy.off('style', updateMinimap);
    };
  }, [cy, width, height]);

  const handleMinimapClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!cy || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * width;
    const y = ((e.clientY - rect.top) / rect.height) * height;

    // Get graph bounds
    const extent = cy.elements().boundingBox();
    if (!extent || extent.w === 0 || extent.h === 0) return;

    const scaleX = width / extent.w;
    const scaleY = height / extent.h;
    const scale = Math.min(scaleX, scaleY) * 0.9;

    const offsetX = (width - extent.w * scale) / 2 - extent.x1 * scale;
    const offsetY = (height - extent.h * scale) / 2 - extent.y1 * scale;

    // Convert minimap coordinates to graph coordinates
    const graphX = (x - offsetX) / scale;
    const graphY = (y - offsetY) / scale;

    // Pan to clicked position
    const zoom = cy.zoom();
    cy.pan({
      x: -graphX * zoom + cy.width() / 2,
      y: -graphY * zoom + cy.height() / 2,
    });
  };

  return (
    <div
      className={`bg-white border border-gray-200 rounded-lg p-2 shadow-sm ${className}`}
    >
      <div className="mb-2">
        <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
          Minimap
        </h4>
      </div>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        onClick={handleMinimapClick}
        className="cursor-pointer rounded border border-gray-200 hover:border-gray-300 transition-colors"
        style={{ width, height }}
      />
      {!cy && (
        <div
          className="flex items-center justify-center bg-gray-50 rounded border border-gray-200"
          style={{ width, height }}
        >
          <span className="text-xs text-gray-500">No graph data</span>
        </div>
      )}
    </div>
  );
};

export default GraphMinimap;
