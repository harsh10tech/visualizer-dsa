export class PathFinderConstants {
  static HEX_SIZE: number = 18.25;
  static HEX_HEIGHT: number = this.HEX_SIZE * 2;
  static HEX_WIDTH: number = Math.sqrt(3) * this.HEX_SIZE;
  static HEX_RADIUS: number = 8;
  static ROWS: number = 0;
  static COLS: number = 0;
  static DELAY: number = 25;
  static DIJKSTRA: string = 'Dijkstra';
  static MANHATTAN: string = 'Manhattan';
  static MANHATTAN_PLUS: string = 'ManhattanPlus';
  static CHEBYSHEV: string = 'Chebyshev';
  static DIJKSTRA_DESCRIPTION: string = '<b>Dijkstra’s Algorithm</b> explores all possible paths from the start to the destination, always choosing the path with the lowest total effort so far. It guarantees the shortest path by considering the cost (traffic) to move between hexagons. The algorithm visits each reachable hexagon, updating the shortest known distance, until it reaches the destination.';
  static MANHATTAN_DESCRIPTION: string = '<b>A* with Manhattan Distance</b> is a smart pathfinding algorithm that combines Dijkstra’s thoroughness with a “guess” of how close each hexagon is to the destination. It uses the Manhattan distance (sum of horizontal and vertical steps) as a heuristic to prioritize hexagons that are closer to the goal, making the search faster and more focused.';
  static MANHATTAN_PLUS_DESCRIPTION: string = '<b>A* Manhattan + No Traffic</b> is a fast pathfinding algorithm that uses the Manhattan distance heuristic but ignores traffic weights. It quickly finds a path by prioritizing hexagons closer to the goal, without considering any additional movement costs.';
  static CHEBYSHEV_DESCRIPTION: string = '<b>A* with Chebyshev Distance</b> is optimized for hexagonal grids. It uses the Chebyshev distance (the maximum of the differences in each coordinate direction) as its heuristic, which perfectly matches the movement rules of hex grids. This makes the search both fast and accurate for your map.';
}
