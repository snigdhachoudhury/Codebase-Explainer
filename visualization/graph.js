// ============================================================
//  graph.js  —  Member 6: Graph Visualization
//  Uses Cytoscape.js to render an interactive architecture map
//  Mock data mirrors the structure from the demo prototype
// ============================================================

// ── MOCK DATA ────────────────────────────────────────────────
// When real backend is ready, replace this with:
//   const data = await fetch('/api/graph').then(r => r.json());

const MOCK_DATA = {
  repo: "django-blog / main",
  language: "Python",
  nodes: [
    // Entry points (blue)
    { id: "main.py",        role: "entry",  importance: 0.95, label: "main.py" },
    { id: "manage.py",      role: "entry",  importance: 0.88, label: "manage.py" },
    { id: "urls.py",        role: "entry",  importance: 0.82, label: "urls.py" },

    // Core logic (teal/green)
    { id: "views.py",       role: "core",   importance: 0.91, label: "views.py" },
    { id: "serializers.py", role: "core",   importance: 0.78, label: "serializers.py" },
    { id: "auth.py",        role: "core",   importance: 0.85, label: "auth.py" },
    { id: "services.py",    role: "core",   importance: 0.74, label: "services.py" },
    { id: "middleware.py",  role: "core",   importance: 0.61, label: "middleware.py" },

    // Data layer (amber)
    { id: "models.py",      role: "data",   importance: 0.93, label: "models.py" },
    { id: "repository.py",  role: "data",   importance: 0.80, label: "repository.py" },
    { id: "db.py",          role: "data",   importance: 0.72, label: "db.py" },
    { id: "migrations.py",  role: "data",   importance: 0.55, label: "migrations.py" },

    // Config / utils (gray)
    { id: "settings.py",    role: "config", importance: 0.68, label: "settings.py" },
    { id: "utils.py",       role: "config", importance: 0.52, label: "utils.py" },
    { id: "constants.py",   role: "config", importance: 0.45, label: "constants.py" },
    { id: "logger.py",      role: "config", importance: 0.40, label: "logger.py" },
  ],
  edges: [
    // Entry → Core
    { source: "main.py",        target: "urls.py" },
    { source: "main.py",        target: "settings.py" },
    { source: "manage.py",      target: "settings.py" },
    { source: "urls.py",        target: "views.py" },
    { source: "urls.py",        target: "auth.py" },

    // Core → Core
    { source: "views.py",       target: "serializers.py" },
    { source: "views.py",       target: "services.py" },
    { source: "views.py",       target: "auth.py" },
    { source: "auth.py",        target: "middleware.py" },
    { source: "services.py",    target: "repository.py" },

    // Core → Data
    { source: "views.py",       target: "models.py" },
    { source: "serializers.py", target: "models.py" },
    { source: "repository.py",  target: "models.py" },
    { source: "repository.py",  target: "db.py" },
    { source: "models.py",      target: "migrations.py" },
    { source: "db.py",          target: "settings.py" },

    // Core → Config
    { source: "views.py",       target: "utils.py" },
    { source: "services.py",    target: "utils.py" },
    { source: "utils.py",       target: "constants.py" },
    { source: "middleware.py",  target: "logger.py" },
    { source: "auth.py",        target: "settings.py" },
  ]
};

// ── COLOUR MAP ───────────────────────────────────────────────
function getColors(theme) {
  const dark = theme === 'dark';
  return {
    entry:  dark ? '#85B7EB' : '#378ADD',
    core:   dark ? '#5DCAA5' : '#1D9E75',
    data:   dark ? '#EF9F27' : '#BA7517',
    config: dark ? '#888780' : '#888780',
    edge:   dark ? 'rgba(240,238,232,0.18)' : 'rgba(26,25,22,0.15)',
    edgeSelected: dark ? '#85B7EB' : '#378ADD',
    bg:     dark ? '#111110' : '#F0EEE8',
    label:  dark ? '#F0EEE8' : '#1A1916',
  };
}

// ── SIZE SCALE ───────────────────────────────────────────────
// importance 0→1 maps to node size 28→60px
function nodeSize(importance) {
  return 28 + importance * 32;
}

// ── ACTIVE FILTERS ───────────────────────────────────────────
const activeFilters = { entry: true, core: true, data: true, config: true };

// ── CYTOSCAPE INIT ───────────────────────────────────────────
let cy;

function initGraph() {
  const theme = document.documentElement.getAttribute('data-theme') || 'light';
  const C = getColors(theme);

  const elements = buildElements(C);

  cy = cytoscape({
    container: document.getElementById('cy'),
    elements,
    style: buildStyle(C),
    layout: { name: 'cose', animate: true, animationDuration: 600, randomize: false,
               nodeRepulsion: 8000, idealEdgeLength: 100, edgeElasticity: 100 },
    wheelSensitivity: 0.3,
    minZoom: 0.3,
    maxZoom: 3,
  });

  cy.on('tap', 'node', function(evt) {
    const node = evt.target;
    showNodeInfo(node);
    highlightConnected(node);
  });

  cy.on('tap', function(evt) {
    if (evt.target === cy) {
      clearHighlight();
      clearNodeInfo();
    }
  });

  updateStats();
}

// ── BUILD ELEMENTS FROM MOCK DATA ────────────────────────────
function buildElements(C) {
  const nodes = MOCK_DATA.nodes
    .filter(n => activeFilters[n.role])
    .map(n => ({
      group: 'nodes',
      data: {
        id: n.id,
        label: n.label,
        role: n.role,
        importance: n.importance,
        size: nodeSize(n.importance),
        color: C[n.role],
      }
    }));

  const nodeIds = new Set(nodes.map(n => n.data.id));

  const edges = MOCK_DATA.edges
    .filter(e => nodeIds.has(e.source) && nodeIds.has(e.target))
    .map(e => ({
      group: 'edges',
      data: { id: e.source + '-->' + e.target, source: e.source, target: e.target }
    }));

  return [...nodes, ...edges];
}

// ── CYTOSCAPE STYLE ──────────────────────────────────────────
function buildStyle(C) {
  return [
    {
      selector: 'node',
      style: {
        'width': 'data(size)',
        'height': 'data(size)',
        'background-color': 'data(color)',
        'label': 'data(label)',
        'font-size': '9px',
        'font-family': '"IBM Plex Mono", monospace',
        'color': C.label,
        'text-valign': 'bottom',
        'text-halign': 'center',
        'text-margin-y': '4px',
        'text-wrap': 'wrap',
        'text-max-width': '80px',
        'border-width': 2,
        'border-color': 'rgba(255,255,255,0.25)',
        'transition-property': 'opacity, border-color, border-width',
        'transition-duration': '0.15s',
      }
    },
    {
      selector: 'node:selected',
      style: {
        'border-width': 3,
        'border-color': C.edgeSelected,
      }
    },
    {
      selector: 'node.dimmed',
      style: { 'opacity': 0.2 }
    },
    {
      selector: 'node.highlighted',
      style: { 'opacity': 1, 'border-width': 3, 'border-color': C.edgeSelected }
    },
    {
      selector: 'edge',
      style: {
        'width': 1.5,
        'line-color': C.edge,
        'target-arrow-color': C.edge,
        'target-arrow-shape': 'triangle',
        'curve-style': 'bezier',
        'arrow-scale': 0.7,
        'opacity': 0.8,
        'transition-property': 'opacity, line-color',
        'transition-duration': '0.15s',
      }
    },
    {
      selector: 'edge.dimmed',
      style: { 'opacity': 0.05 }
    },
    {
      selector: 'edge.highlighted',
      style: { 'opacity': 1, 'line-color': C.edgeSelected, 'target-arrow-color': C.edgeSelected }
    },
  ];
}

// ── HIGHLIGHT CONNECTED NODES ─────────────────────────────────
function highlightConnected(node) {
  cy.elements().removeClass('highlighted dimmed');
  const connected = node.closedNeighborhood();
  cy.elements().not(connected).addClass('dimmed');
  connected.addClass('highlighted');
}

function clearHighlight() {
  cy.elements().removeClass('highlighted dimmed');
}

// ── NODE INFO PANEL ───────────────────────────────────────────
function showNodeInfo(node) {
  const d = node.data();
  const connectedEdges = node.connectedEdges();
  const incomers  = node.incomers('node').map(n => n.data('id')).join('<br>') || '—';
  const outgoers  = node.outgoers('node').map(n => n.data('id')).join('<br>') || '—';
  const scorePercent = Math.round(d.importance * 100);

  document.getElementById('node-info').innerHTML = `
    <div class="info-name">${d.id}</div>
    <span class="info-badge badge-${d.role}">${d.role}</span>

    <div class="info-row">
      <span class="info-key">Importance</span>
      <span class="info-val">${d.importance.toFixed(2)}</span>
    </div>
    <div class="info-row">
      <span class="info-key">Connections</span>
      <span class="info-val">${connectedEdges.length}</span>
    </div>
    <div class="info-row">
      <span class="info-key">Imports from</span>
      <span class="info-val">${node.incomers('node').length}</span>
    </div>
    <div class="info-row">
      <span class="info-key">Imported by</span>
      <span class="info-val">${node.outgoers('node').length}</span>
    </div>

    <div class="score-bar-wrap">
      <div class="score-bar-label">Importance score</div>
      <div class="score-bar-bg">
        <div class="score-bar-fill" style="width:${scorePercent}%"></div>
      </div>
    </div>

    <div class="connections-list">
      <div class="conn-title">Imports from</div>
      ${node.incomers('node').map(n => `<div class="conn-item">← ${n.data('id')}</div>`).join('') || '<div class="conn-item" style="color:var(--text3)">none</div>'}
    </div>
    <div class="connections-list" style="margin-top:8px">
      <div class="conn-title">Imported by</div>
      ${node.outgoers('node').map(n => `<div class="conn-item">→ ${n.data('id')}</div>`).join('') || '<div class="conn-item" style="color:var(--text3)">none</div>'}
    </div>
  `;
}

function clearNodeInfo() {
  document.getElementById('node-info').innerHTML =
    '<div class="no-select">Click any node to see file details</div>';
}

// ── FILTER TOGGLE ─────────────────────────────────────────────
function toggleFilter(role) {
  activeFilters[role] = !activeFilters[role];
  const btn = document.getElementById('btn-' + role);
  if (activeFilters[role]) {
    btn.className = `filter-btn active-${role}`;
  } else {
    btn.className = 'filter-btn';
    btn.style.color = '';
  }
  refreshGraph();
}

function refreshGraph() {
  if (!cy) return;
  const theme = document.documentElement.getAttribute('data-theme') || 'light';
  const C = getColors(theme);
  cy.elements().remove();
  cy.add(buildElements(C));
  runLayout(currentLayout);
  updateStats();
  clearNodeInfo();
}

// ── LAYOUT ───────────────────────────────────────────────────
let currentLayout = 'cose';

function runLayout(name) {
  if (!cy) return;
  currentLayout = name;
  const opts = {
    cose:        { name: 'cose', animate: true, animationDuration: 500, nodeRepulsion: 8000, idealEdgeLength: 100, fit: true, padding: 40 },
    breadthfirst:{ name: 'breadthfirst', animate: true, animationDuration: 500, fit: true, padding: 40, spacingFactor: 1.4 },
    circle:      { name: 'circle', animate: true, animationDuration: 500, fit: true, padding: 40 },
  };
  cy.layout(opts[name] || opts.cose).run();
}

// ── THEME ────────────────────────────────────────────────────
function toggleTheme() {
  const root = document.documentElement;
  const isDark = root.getAttribute('data-theme') === 'dark';
  root.setAttribute('data-theme', isDark ? 'light' : 'dark');
  document.querySelector('.theme-btn').textContent = isDark ? '🌙' : '☀️';

  if (cy) {
    const C = getColors(isDark ? 'light' : 'dark');
    cy.style(buildStyle(C));
    cy.nodes().forEach(n => {
      n.data('color', C[n.data('role')]);
    });
  }
}

// ── STATS BAR ────────────────────────────────────────────────
function updateStats() {
  if (!cy) return;
  document.getElementById('stat-nodes').textContent = cy.nodes().length;
  document.getElementById('stat-edges').textContent = cy.edges().length;
  ['entry','core','data','config'].forEach(role => {
    document.getElementById('stat-' + role).textContent =
      cy.nodes().filter(n => n.data('role') === role).length;
  });
}

// ── START ────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', initGraph);