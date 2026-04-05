# Visualization — Member 6

Interactive architecture graph built with [Cytoscape.js](https://cytoscape.js.org/).

## Files

| File | Purpose |
|------|---------|
| `index.html` | Main page — layout, styles, toolbar, side panel |
| `graph.js` | All graph logic — mock data, Cytoscape init, filters, layouts |

## How to run locally

Just open `index.html` in your browser. No server needed.

## Features

- **Nodes** = files in the repo, sized by importance score
- **Edges** = import/dependency relationships between files
- **Color** = role (blue = entry, teal = core, amber = data, gray = config)
- **Click a node** = see file details in the side panel + highlight its connections
- **Filter buttons** = show/hide roles
- **Layout buttons** = Force / Tree / Circle
- **Dark/light mode** toggle

## Connecting to real backend

In `graph.js`, replace the `MOCK_DATA` block with:

const response = await fetch('http://localhost:8000/api/graph');
const MOCK_DATA = await response.json();

Expected API response shape:
{
  "repo": "owner/repo",
  "language": "Python",
  "nodes": [
    { "id": "main.py", "role": "entry", "importance": 0.95, "label": "main.py" }
  ],
  "edges": [
    { "source": "main.py", "target": "urls.py" }
  ]
}