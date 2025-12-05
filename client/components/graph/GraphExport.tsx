'use client';

import { Core } from 'cytoscape';
import { ExportFormat } from './types';

/**
 * Export graph as image
 */
export const exportGraphAsImage = (
  cy: Core | null,
  format: ExportFormat,
  filename?: string
): void => {
  if (!cy) {
    console.warn('Cytoscape instance not available');
    return;
  }

  try {
    let dataUrl: string;
    const defaultFilename = filename || `graph-export-${Date.now()}`;

    switch (format) {
      case 'png':
        dataUrl = cy.png({
          output: 'blob-promise',
          bg: '#f9fafb', // gray-50
          full: true,
          scale: 2, // 2x resolution for better quality
        }) as any;
        break;

      case 'jpg':
        dataUrl = cy.jpg({
          output: 'blob-promise',
          bg: '#f9fafb',
          full: true,
          quality: 0.95,
          scale: 2,
        }) as any;
        break;

      case 'svg':
        // SVG export - fallback to PNG if svg() is not available
        try {
          const svgContent = (cy as any).svg?.({
            full: true,
            bg: '#f9fafb',
          });
          if (svgContent) {
            const svgBlob = new Blob([svgContent], { type: 'image/svg+xml' });
            downloadBlob(svgBlob, `${defaultFilename}.svg`);
            return;
          }
        } catch (e) {
          console.warn('SVG export not available, falling back to PNG');
          format = 'png';
        }
        dataUrl = cy.png({
          output: 'blob-promise',
          bg: '#f9fafb',
          full: true,
          scale: 2,
        }) as any;
        break;

      default:
        console.warn(`Unsupported export format: ${format}`);
        return;
    }

    // Handle promise-based blob export for PNG/JPG
    if (dataUrl && typeof (dataUrl as any).then === 'function') {
      (dataUrl as unknown as Promise<Blob>).then((blob: Blob) => {
        downloadBlob(blob, `${defaultFilename}.${format}`);
      });
    } else if (typeof dataUrl === 'string') {
      // Handle base64 data URL
      fetch(dataUrl)
        .then((res) => res.blob())
        .then((blob) => {
          downloadBlob(blob, `${defaultFilename}.${format}`);
        });
    }
  } catch (error) {
    console.error(`Error exporting graph as ${format}:`, error);
  }
};

/**
 * Download blob as file
 */
const downloadBlob = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();

  // Clean up
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 100);
};

/**
 * Export graph data as JSON
 */
export const exportGraphAsJSON = (cy: Core | null, filename?: string): void => {
  if (!cy) {
    console.warn('Cytoscape instance not available');
    return;
  }

  try {
    const graphData = {
      nodes: cy.nodes().map((node) => ({
        data: node.data(),
        position: node.position(),
      })),
      edges: cy.edges().map((edge) => ({
        data: edge.data(),
      })),
      metadata: {
        exportDate: new Date().toISOString(),
        nodeCount: cy.nodes().length,
        edgeCount: cy.edges().length,
      },
    };

    const jsonString = JSON.stringify(graphData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const defaultFilename = filename || `graph-data-${Date.now()}.json`;

    downloadBlob(blob, defaultFilename);
  } catch (error) {
    console.error('Error exporting graph as JSON:', error);
  }
};

/**
 * Copy graph as image to clipboard (PNG only)
 */
export const copyGraphToClipboard = async (cy: Core | null): Promise<void> => {
  if (!cy) {
    console.warn('Cytoscape instance not available');
    return;
  }

  try {
    const blob = await cy.png({
      output: 'blob-promise',
      bg: '#f9fafb',
      full: true,
      scale: 2,
    });

    if (!blob) {
      throw new Error('Failed to generate image blob');
    }

    await navigator.clipboard.write([
      new ClipboardItem({
        'image/png': blob,
      }),
    ]);

    console.log('Graph copied to clipboard');
  } catch (error) {
    console.error('Error copying graph to clipboard:', error);
    throw error;
  }
};

/**
 * Print graph
 */
export const printGraph = (cy: Core | null): void => {
  if (!cy) {
    console.warn('Cytoscape instance not available');
    return;
  }

  try {
    const dataUrl = cy.png({
      output: 'base64uri',
      bg: '#ffffff',
      full: true,
      scale: 2,
    });

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      throw new Error('Failed to open print window');
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Graph Print</title>
          <style>
            body {
              margin: 0;
              padding: 20px;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
            }
            img {
              max-width: 100%;
              height: auto;
            }
            @media print {
              body {
                padding: 0;
              }
            }
          </style>
        </head>
        <body>
          <img src="${dataUrl}" alt="Graph Visualization" />
          <script>
            window.onload = () => {
              window.print();
              window.onafterprint = () => window.close();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  } catch (error) {
    console.error('Error printing graph:', error);
  }
};
