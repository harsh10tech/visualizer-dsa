import { Injectable } from '@angular/core';
import { HexagonCordinate } from '../models/cordinates/hexagon/hexagon-cordinate';
import { Point } from '../models/cordinates/Points/point';
import { PathFinderConstants } from '../constants/path-finder-constants';

@Injectable({
  providedIn: 'root',
})
export class PathFinderService {
  constructor() {}

  public getDistance(point: Point, target: Point): number {
    return Math.sqrt(
      Math.pow(point.x - target.x, 2) + Math.pow(point.y - target.y, 2)
    );
  }

  public getHexCenter(row: number, col: number): Point {
    const x =
      col * PathFinderConstants.HEX_WIDTH * 0.75 +
      PathFinderConstants.HEX_SIZE +
      10;
    const y =
      row * PathFinderConstants.HEX_HEIGHT +
      (col % 2) * PathFinderConstants.HEX_HEIGHT * 0.5 +
      PathFinderConstants.HEX_SIZE +
      10;
    return new Point(x, y);
  }

  public getNewPoint(x: number, y: number, i:number): Point {
    const angle = Math.PI / 6 + (Math.PI / 3) * i;
    const px =
      x + Math.sqrt(3) * PathFinderConstants.HEX_SIZE * Math.cos(angle);
    const py =
      y + Math.sqrt(3) * PathFinderConstants.HEX_SIZE * Math.sin(angle);
    return new Point(px, py);
  }
}
