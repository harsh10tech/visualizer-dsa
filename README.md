Visualizer DSA – Pathfinding on a Hex Grid
==========================================

```
README is partly generated with the help of AI
```

A visual, interactive pathfinding playground built with Angular. Explore classic shortest-path algorithms on a hexagonal grid, toggle traffic weights, capture screenshots, and compare how different heuristics and cost models change routes.

- #### Algorithms included: Dijkstra, A* (Manhattan heuristic), A* (Chebyshev heuristic)


Quick Start
-----------

### Prerequisites
- Node.js ≥ 18 (LTS recommended)
- npm ≥ 9

### Install
```bash
git clone https://github.com/harsh10tech/visualizer-dsa.git
cd visualizer-dsa
npm install
```

### Run locally
```bash
ng serve -o
# or
npx @angular/cli@latest serve -o
# App will be available at http://localhost:4200/
```

### Or go to the live [Page](https://harsh10tech.github.io/visualizer-dsa/)
---


Instructions to run the application
------------------------------------
- Click two hex cells to set Start and Destination.
- Choose an algorithm button to visualize the search.
- Reset retains traffic by default; toggle can reset selections.
- Capture gallery: Use the camera icon to capture the current canvas, then open the preview overlay. The bottom strip scrolls horizontally; click a thumbnail to set it as the main preview.
- The UI adapts to small screens (constrained main preview, scrollable strip, touch-friendly interactions).


How It Works
-------------

### Graph Model
- Each hex cell is a node.
- Neighbor relations (6 directions) create undirected edges.
- Edge weights are determined by “traffic” levels: higher traffic ⇒ larger traversal cost.

### Dijkstra’s Algorithm (Uniform-Cost Search)
- Purpose: Find the shortest path from a source to all reachable nodes on a weighted graph with non-negative edge weights.
- Data structures:
  - Distance map dist[v] initialized to Infinity except dist[source] = 0.
  - Min-priority queue (min-heap) keyed by tentative distance.
  - Parent/predecessor map to reconstruct the path.
- Process: Extract the closest unvisited node, relax all outgoing edges, push/Dequeue accordingly.
- Guarantees: Optimality on graphs with non-negative weights. In this app, Dijkstra acts as the baseline when traffic acts as cost.

### A* Search with Manhattan Heuristic
- Purpose: Speed up shortest-path search by guiding exploration with a heuristic.
- Cost function: f(n) = g(n) + h(n)
  - g(n): cost from start to n (accumulated edge weights/traffic)
  - h(n): heuristic estimate to goal
- Heuristic here: Manhattan-like distance adapted to grid coordinates; admissible when it never overestimates the real remaining cost.
- Benefit: Typically explores far fewer nodes than Dijkstra when h is informative and admissible.

### A* Search with Chebyshev Heuristic
- Same A* framework, but using Chebyshev distance (max of axis deltas) as h(n) which can be a closer fit for some movement geometries.
- On a hex grid, both Manhattan-like and Chebyshev-like metrics can be used as heuristics depending on coordinate system mapping. We use them to compare search breadth/speed and path optimality under traffic weights.

### No-Path Detection
- After the search terminates, if dist[destination] is Infinity or not set, the graph has no reachable path under current traffic constraints.
- The app shows a dismissible overlay stating “Path not possible”.


Similarities to Google Maps’ Shortest Path
-----------------------------------------
While Google Maps is far more sophisticated, the conceptual underpinnings share several ideas:
- Weighted Graph: Real road networks are modeled as weighted graphs (nodes = intersections, edges = road segments). This app uses traffic as edge weights in a hex grid.
- Heuristic Search: Like A*, real routing engines use admissible/consistent heuristics and multi-level graph optimizations (e.g., landmarks, contraction hierarchies) to direct search and scale to large networks.
- Dynamic Costs (Traffic): Live traffic, speed limits, turn penalties, and road closures adjust edge weights. This app mirrors the idea by altering traversal cost with traffic levels.
- Optimal/Practical Routes: Maps engines may balance optimality with realism, constraints, and ETA accuracy. In this app, A* heuristics illustrate how informed search reduces exploration for near-optimal routes.

Caveats: The app uses a hex grid abstraction (not real map data), simplified traffic, and small-scale visualization—useful for learning and intuition rather than real navigation.



Features at a Glance
-----------------------
- Followed DSA principles (Data Structure used are: queue, mean-heap, stack)
- Hexagonal grid rendered on canvas
- Multiple algorithms with traffic-aware edge costs
- Real-time visualization of exploration and final path
- Screenshot capture and a horizontally scrollable thumbnail strip in the preview overlay
- Responsive layout for desktop and mobile
- No-path detection: dismissible overlay shows “Path not possible” when an algorithm concludes with no valid route

Project Structure (key parts)
------------------------------
- src/app/path-finder/
  - path-finder.component.ts: core logic, canvas drawing, algorithms, capture helpers, and no-path popup flag
  - path-finder.component.html: UI wiring for controls, preview overlay, and no-path popup
  - path-finder.component.css: responsive styles, preview strip, and popup styles
- src/app/models/: data structures (hex, points, etc.)
- src/app/helpers/: helpers for distances, descriptions, and delays in visualization

Contributing
------------
- Issues and PRs are welcome. Please include steps to reproduce and clear descriptions of changes.