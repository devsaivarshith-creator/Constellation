import { useEffect, useRef } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import './GraphViewer.css';

const NODE_COLORS = {
  Case:                 { bg: '#00d4ff', border: '#0096b3' },
  Person:               { bg: '#8b5cf6', border: '#6d3fcf' },
  Identity:             { bg: '#a78bfa', border: '#7c5cc7' },
  Organization:         { bg: '#ffaa00', border: '#cc8800' },
  Location:             { bg: '#f97316', border: '#c75e12' },
  Communication:        { bg: '#06b6d4', border: '#0891a2' },
  FinancialTransaction: { bg: '#10b981', border: '#059669' },
  Vehicle:              { bg: '#6366f1', border: '#4f46e5' },
  Event:                { bg: '#ec4899', border: '#be185d' },
  Evidence:             { bg: '#00ff88', border: '#00cc6a' },
  Legal:                { bg: '#f43f5e', border: '#be123c' },
  Relationship:         { bg: '#94a3b8', border: '#64748b' },
};

const STYLESHEET = [
  {
    selector: 'node',
    style: {
      'label': 'data(label)',
      'text-valign': 'bottom',
      'text-halign': 'center',
      'font-size': '11px',
      'font-family': 'Inter, sans-serif',
      'font-weight': 500,
      'color': '#e8eaf0',
      'text-margin-y': 8,
      'background-color': 'data(color)',
      'border-width': 2,
      'border-color': 'data(borderColor)',
      'width': 40,
      'height': 40,
      'overlay-padding': 6,
      'shadow-blur': 20,
      'shadow-color': 'data(color)',
      'shadow-opacity': 0.4,
      'text-background-opacity': 0.8,
      'text-background-color': '#0a0b10',
      'text-background-shape': 'roundrectangle',
      'text-background-padding': '3px',
    }
  },
  {
    selector: 'node:selected',
    style: {
      'border-width': 3,
      'border-color': '#00d4ff',
      'shadow-blur': 30,
      'shadow-color': '#00d4ff',
      'shadow-opacity': 0.6,
      'width': 50,
      'height': 50,
    }
  },
  {
    selector: 'edge',
    style: {
      'label': 'data(label)',
      'font-size': '9px',
      'font-family': 'Inter, sans-serif',
      'color': '#5c6378',
      'text-rotation': 'autorotate',
      'text-margin-y': -10,
      'width': 'mapData(confidence, 0, 1, 1, 4)',
      'line-color': '#2a2f42',
      'target-arrow-color': '#2a2f42',
      'target-arrow-shape': 'triangle',
      'curve-style': 'bezier',
      'opacity': 0.7,
      'text-background-opacity': 0.8,
      'text-background-color': '#0a0b10',
      'text-background-shape': 'roundrectangle',
      'text-background-padding': '2px',
    }
  },
  {
    selector: 'edge:selected',
    style: {
      'line-color': '#00d4ff',
      'target-arrow-color': '#00d4ff',
      'opacity': 1,
      'width': 3,
    }
  }
];

function transformData(subgraph) {
  const elements = [];

  if (subgraph.nodes) {
    subgraph.nodes.forEach(node => {
      const nodeType = node.label || 'Person';
      const colors = NODE_COLORS[nodeType] || NODE_COLORS.Person;
      const props = node.properties || {};
      const displayName = props.full_name || props.title || props.name || node.id;

      elements.push({
        data: {
          id: node.id,
          label: displayName.length > 20 ? displayName.slice(0, 18) + '…' : displayName,
          fullLabel: displayName,
          nodeType,
          color: colors.bg,
          borderColor: colors.border,
          properties: props,
        }
      });
    });
  }

  if (subgraph.edges) {
    subgraph.edges.forEach(edge => {
      elements.push({
        data: {
          id: edge.id,
          source: edge.from_id,
          target: edge.to_id,
          label: (edge.rel_type || '').replace(/_/g, ' '),
          confidence: edge.confidence || 1,
          method: edge.method || 'manual',
        }
      });
    });
  }

  return elements;
}

export default function GraphViewer({ data, onNodeClick, onEdgeClick, style }) {
  const cyRef = useRef(null);

  const elements = data ? transformData(data) : [];

  useEffect(() => {
    if (cyRef.current) {
      const cy = cyRef.current;
      cy.on('tap', 'node', evt => {
        if (onNodeClick) onNodeClick(evt.target.data());
      });
      cy.on('tap', 'edge', evt => {
        if (onEdgeClick) onEdgeClick(evt.target.data());
      });

      // Run layout after mount
      setTimeout(() => {
        cy.layout({
          name: 'cose',
          animate: true,
          animationDuration: 800,
          animationEasing: 'ease-out',
          nodeRepulsion: 8000,
          idealEdgeLength: 120,
          gravity: 0.3,
          padding: 40,
        }).run();
      }, 100);
    }
  }, [elements.length]);

  if (!elements.length) {
    return (
      <div className="graph-empty">
        <div className="graph-empty-icon">◇</div>
        <p>No graph data to display</p>
        <span>Add entities and relationships to see the investigation graph</span>
      </div>
    );
  }

  return (
    <div className="graph-viewer-wrapper" style={style}>
      <CytoscapeComponent
        elements={elements}
        stylesheet={STYLESHEET}
        style={{ width: '100%', height: '100%' }}
        cy={cy => { cyRef.current = cy; }}
        userPanningEnabled={true}
        userZoomingEnabled={true}
        boxSelectionEnabled={false}
        maxZoom={3}
        minZoom={0.3}
      />
      <div className="graph-legend">
        {Object.entries(NODE_COLORS).slice(0, 6).map(([label, colors]) => (
          <div key={label} className="graph-legend-item">
            <span className="graph-legend-dot" style={{ backgroundColor: colors.bg }} />
            <span>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
