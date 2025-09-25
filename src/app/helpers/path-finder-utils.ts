import { Point } from "../models/cordinates/Points/point";
import { PathFinderConstants as constants } from '../constants/path-finder-constants';
import { Hexagon } from "../models/shapes/hexagon";

export function getDistance(point: Point, target: Point): number {
    return Math.sqrt(
        Math.pow(point.x - target.x, 2) + Math.pow(point.y - target.y, 2)
    );
}

export function getHexCenter(row: number, col: number): Point {
    const x = col * constants.HEX_WIDTH * 0.75 + constants.HEX_SIZE + 10;
    const y =
      row * constants.HEX_HEIGHT +
      (col % 2) * constants.HEX_HEIGHT * 0.5 +
      constants.HEX_SIZE +
      10;
    return new Point(x, y);
}

export function getTrafficBetweenHex(p1: Point, p2: Point, hex: Hexagon): string{
    const theta = Math.atan2(p2.y - p1.y, p2.x - p1.x);
    const i = Math.round((theta - Math.PI / 6) / (Math.PI / 3));
    let traffic = "black";
    if (hex) traffic = hex.traffic[(i + 6) % 6];
    return traffic;
}

export function pixelToAxial(point: Point): [number, number]{
    const q = ((Math.sqrt(3) / 3) * point.x - (1 / 3) * point.y) / constants.HEX_SIZE;
    const r = (2 / 3) * point.y / constants.HEX_SIZE;
    return [q, r];
}

export function axialToCube(q: number, r: number): { x: number; y: number; z: number } {
    const x = q;
    const z = r;
    const y = -x - z;
    return { x, y, z };
}

export function getChebyshevDistance(source: Point, target: Point): number {
    const [p1,r1] = pixelToAxial(source);
    const [q2,r2] = pixelToAxial(target);
    const x1 = p1;
    const y1 = -p1 - r1;
    const z1 = r1;
    const x2 = q2;
    const y2 = -q2 - r2;
    const z2 = r2;
    return Math.max(Math.abs(x1 - x2), Math.abs(y1 - y2), Math.abs(z1 - z2));
}

export function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
};

export function getManhattanDistance(source: Point, target: Point): number {
    return Math.abs(source.x - target.x) + Math.abs(source.y - target.y);
};

export class Comperators {

    static comp: (a: [string, number], b: [string, number]) => boolean = (a, b) => a[1] < b[1];
    
    static compManhattan_Traffic: (
        a: [string, number, number],
        b: [string, number, number]
    ) => boolean = (a, b) => a[1] < b[1] || (a[1] === b[1] && a[2] < b[2]);
    
    static compManhattan_Fast: (
        a: [string, number, number],
        b: [string, number, number]
    ) => boolean = (a, b) => a[2] < b[2] || a[1] < b[1];
    
    static compChebyshev:(
        a: [string, number, number],
        b: [string, number, number]
      ) => boolean = (a, b) => {
        const fa = a[1] + a[2];
        const fb = b[1] + b[2];
        return fa < fb || (fa == fb && a[2] < b[2])
    };
}