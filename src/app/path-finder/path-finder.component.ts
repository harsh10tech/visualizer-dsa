import {
  Component,
  HostListener,
  ElementRef,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { Point } from '../models/cordinates/Points/point';
import { HexagonCordinate } from '../models/cordinates/hexagon/hexagon-cordinate';
import { Hexagon, typeOfTraffic } from '../models/shapes/hexagon';
import { PathFinderConstants as constants } from '../constants/path-finder-constants';
import { Heap } from '../models/data-structures/heap';
import { getChebyshevDistance, getDistance, getHexCenter,getManhattanDistance,sleep } from '../helpers/path-finder-utils';
import { Comperators } from '../helpers/path-finder-utils';

@Component({
  selector: 'app-path-finder',
  templateUrl: './path-finder.component.html',
  styleUrl: './path-finder.component.css',
})
export class PathFinderComponent {
  private startHex: Hexagon | null = null;
  private destinationHex: Hexagon | null = null;
  private radius: number = 5;
  private ROWS: number = 0;
  private COLS: number = 0;
  private HEX_HEIGHT: number = 0;
  private HEX_WIDTH: number = 0;
  private HEX_SIZE: number = 0;
  private centers: Array<Point>;
  private hexaCordinates: Array<HexagonCordinate>;
  private hexagons: Map<string, Hexagon>;
  private traffic: Array<[Point, Point, string]> = new Array<[Point, Point, string]>();
  public resetSelections: boolean = false;
  public dijkstra_Flag:boolean = true;
  public aStar_Manhattan_Flag = true;
  public aStar_Manhattan_Plus_Flag = true;
  public aStar_Chebyshev_Flag = true;
  public captures: string[] = [];
  public selectedCapture: string | null = null;
  public showThumbnails:boolean = false;


  @ViewChild('hexCanvas', { static: false })
  canvasEle!: ElementRef<HTMLCanvasElement>;
  private cntx!: CanvasRenderingContext2D;
  private canvas!: HTMLCanvasElement;

  public ngOnInit(): void {
    this.HEX_SIZE = 18.25;
    this.HEX_WIDTH = this.HEX_SIZE * 2;
    this.HEX_HEIGHT = this.HEX_SIZE * Math.sqrt(3);
    constants.HEX_SIZE = 18.25;
    constants.HEX_WIDTH = constants.HEX_SIZE * 2;
    constants.HEX_HEIGHT = constants.HEX_SIZE * Math.sqrt(3);
  }

  public ngAfterViewInit(): void {
    this.canvas = this.canvasEle.nativeElement;
    const cntx = this.canvas?.getContext('2d');
    if (cntx) {
      this.cntx = cntx;
      console.log('Drawing on Canvas!!');
      this.ROWS = this.canvas.height / 35;
      this.COLS = this.canvas.clientWidth / 29;
      this.drawOnCanvas();
    } else {
      console.log('Canvas is falling!!');
    }
  }

  constructor(private el: ElementRef, private renderer: Renderer2) {
    this.centers = new Array<Point>();
    this.hexaCordinates = new Array<HexagonCordinate>();
    this.hexagons = new Map();
  }

  //#region Canvas Drawing
  private drawHexagon(
    x: number,
    y: number,
    hexSize: number,
    lineWidth: number = 2
  ): HexagonCordinate {
    this.cntx.beginPath();
    let p: Array<Point> = [];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i;
      const px = x + hexSize * Math.cos(angle);
      const py = y + hexSize * Math.sin(angle);
      if (i === 0) this.cntx.moveTo(px, py);
      else this.cntx.lineTo(px, py);
      p.push(new Point(px, py));
    }
    this.cntx.closePath();

    if (true) {
      this.cntx.fillStyle = 'white';
      this.cntx.fill();
    }

    if (true) {
      this.cntx.strokeStyle = 'grey';
      this.cntx.lineWidth = lineWidth;
      this.cntx.stroke();
    }
    return new HexagonCordinate(p[0], p[1], p[2], p[3], p[4], p[5]);
  }

  private drawOnCanvas(): void {
    this.startHex = null;
    this.destinationHex = null;
    this.cntx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    for (let row = 0; row < this.ROWS; row++) {
      for (let col = 0; col < this.COLS; col++) {
        const center = getHexCenter(row, col);
        const hexCordinate = this.drawHexagon(
          center.x,
          center.y,
          this.HEX_SIZE - 1,
          1
        );
        this.centers.push(center);
        this.hexaCordinates.push(hexCordinate);
        const hexagon = new Hexagon(center, hexCordinate);

        this.hexagons.set(center.asKey(), hexagon);
      }
    }
    this.populateNeighbors();
  }

  private getNeighbors(currCenter: Point): void {
    for (let i = 0; i < 6; i++) {
      const angle = Math.PI / 6 + (Math.PI / 3) * i;
      const px = currCenter.x + Math.sqrt(3) * this.HEX_SIZE * Math.cos(angle);
      const py = currCenter.y + Math.sqrt(3) * this.HEX_SIZE * Math.sin(angle);
      const newPoint = new Point(px, py);
      const neighbor = this.hexagons.get(newPoint.asKey());
      const current = this.hexagons.get(currCenter.asKey());
      if (neighbor && current) {
        current.neighbors[i] = neighbor;
      }
    }
  }

  //Testing purpose
  private getCenter(hex: HexagonCordinate): Point | null {
    if (hex) {
      for (let hexagon of this.hexagons) {
        if (hexagon[1].cordidates === hex) {
          return hexagon[1].center;
        }
      }
    }
    return null;
  }

  private populateNeighbors(): void {
    const stack: string[] = [];
    let center = this.centers[0];
    stack.push(center.asKey());
    while (stack.length > 0) {
      const currCenter = stack.pop();
      const current = currCenter ? this.hexagons.get(currCenter) : null;
      if (current) {
        current.visit = true;
        this.getNeighbors(current.center);
        const neighbors = current.neighbors;
        const traffic = current.traffic;
        for (let i = 0; i < 6; i++) {
          if (neighbors[i] && !traffic[i]) {
            const traffic = typeOfTraffic[Math.floor(Math.random() * 4)];
            current.traffic[i] = traffic;
            const next = this.hexagons.get(neighbors[i].center.asKey());
            if (next) {
              next.traffic[(i + 3) % 6] = traffic;
              if (!next.visit) stack.push(next.center.asKey());
              this.colorTraffic(
                current.cordidates.getCord(i + 1),
                current.cordidates.getCord((i + 2) % 6),
                traffic
              );
              this.colorTraffic(
                next.cordidates.getCord(((i + 3) % 6) + 1),
                next.cordidates.getCord(((i + 9) % 6) + 1),
                traffic
              );
              this.traffic.push([current.cordidates.getCord(i + 1), current.cordidates.getCord((i + 2) % 6), traffic]);
              this.traffic.push([current.cordidates.getCord(((i + 3) % 6) + 1), current.cordidates.getCord(((i + 9) % 6) + 1), traffic]);
            }
          }
        }
      }
    }
  }

  private colorHexagon(hex: HexagonCordinate, color: string): void {
    this.cntx.beginPath();
    for (let i = 1; i <= 6; i++) {
      const p = hex.getCord(i);
      if (p) {
        i == 1 ? this.cntx.moveTo(p.x, p.y) : this.cntx.lineTo(p.x, p.y);
      } else break;
    }
    this.cntx.closePath();
    this.cntx.fillStyle = color;
    this.cntx.fill();
  }

  private colorTraffic(p1: Point, p2: Point, color: string): void {
    this.cntx.beginPath();
    this.cntx.moveTo(p1.x, p1.y);
    this.cntx.lineTo(p2.x, p2.y);
    this.cntx.closePath();
    this.cntx.strokeStyle = color;
    this.cntx.lineWidth = 3;
    this.cntx.stroke();
  }

  private drawPathLine(p1: Point, p2: Point, color: string='black'): void {
    this.cntx.beginPath();
    this.cntx.moveTo(p1.x, p1.y);
    this.cntx.lineTo(p2.x, p2.y);
    this.cntx.closePath();
    this.cntx.strokeStyle = color;
    this.cntx.lineWidth = 2;
    this.cntx.stroke();
  }

  public resetCanvasKeepTraffic(): void {
    if (!this.canvas || !this.cntx) return;

    this.dijkstra_Flag = true;
    this.aStar_Manhattan_Flag = true;
    this.aStar_Manhattan_Plus_Flag = true;
    this.aStar_Chebyshev_Flag = true;

    this.cntx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    for (let row = 0; row < this.ROWS; row++) {
      for (let col = 0; col < this.COLS; col++) {
        const center = getHexCenter(row, col);
        const hexCordinate = this.drawHexagon(
          center.x,
          center.y,
          this.HEX_SIZE - 1,
          1
        );
        const hexagon = this.hexagons.get(center.asKey());
        if (hexagon) {
          hexagon.visit = true;
        }
      }
    }

    this.traffic.forEach((traffic) => {
      this.colorTraffic(traffic[0], traffic[1], traffic[2]);
    });
    if (this.resetSelections) {
      this.startHex = null;
      this.destinationHex = null;
    } else {
      if (this.startHex)
        this.colorHexagon(this.startHex.cordidates, 'rgba(226, 62, 103, 0.99)');
      if (this.destinationHex)
        this.colorHexagon(this.destinationHex.cordidates, 'rgba(141, 233, 36, 0.94)');
    }
  }
  
  private getHexaCordinates(p: Point): HexagonCordinate | null {
    for (let hex of this.hexaCordinates) {
      let inHexa: boolean = false;
      for (let i = 1, j = 6; i <= 6; j = i++) {
        const pi = hex.getCord(i);
        const pj = hex.getCord(j);
        if (pi === null || pj === null) break;
        const xi = pi.x;
        const yi = pi.y;
        const xj = pj.x;
        const yj = pj.y;

        const intersect =
          yi > p.y !== yj > p.y &&
          p.x < ((xj - xi) * (p.y - yi)) / (yj - yi) + xi;
        if (intersect) inHexa = !inHexa;
      }
      if (inHexa) return hex;
    }
    return null;
  }

  public onHexClick(event: MouseEvent): void {
    const canvasBox = this.canvas.getBoundingClientRect();
    const adjustX = this.canvas.width / canvasBox.width;
    const adjustY = this.canvas.height / canvasBox.height;

    const x = (event.clientX - canvasBox.left) * adjustX;
    const y = (event.clientY - canvasBox.top) * adjustY;
    const hexCord = this.getHexaCordinates(new Point(x, y));

    if (hexCord) {
      const hexaCenter = Hexagon.getHexagonCenter(hexCord);
      const hexa =
        hexaCenter != null ? this.hexagons.get(hexaCenter?.asKey()) : null;
      if (hexa) {
        this.startHex === null
          ? this.setHexAsStart(hexa)
          : this.destinationHex === null
          ? this.setHexAsdestination(hexa)
          : console.log('Already selected!!');
      }
    }
  }

  private setHexAsdestination(hex: Hexagon): void {
    this.destinationHex = hex;
    this.colorHexagon(hex.cordidates, 'rgba(141, 233, 36, 0.94)');
  }
  private setHexAsStart(hex: Hexagon): void {
    this.startHex = hex;
    this.colorHexagon(hex.cordidates, 'rgba(226, 62, 103, 0.99)');
  }
  public resetHex(hex: HTMLElement) {
    this.renderer.removeStyle(hex, 'background');
    this.renderer.setProperty(hex, 'innerText', '');
  }
  //#endregion

  //#region Hover Effect
  @HostListener('mouseover', ['$event.target'])
  handleHover(target: HTMLElement): void {
    if (
      target.tagName.toLowerCase() === 'div' &&
      target.classList.contains('hex')
    ) {
      const hoveredElement = target;
      const allHexagons =
        this.el.nativeElement.querySelectorAll('.container div');

      const rectHovered = hoveredElement.getBoundingClientRect();
      const xHovered = rectHovered.left + rectHovered.width / 2;
      const yHovered = rectHovered.top + rectHovered.height / 2;

      allHexagons.forEach((hex: HTMLElement) => {
        const rectHex = hex.getBoundingClientRect();
        const xHex = rectHex.left + rectHex.width / 2;
        const yHex = rectHex.top + rectHex.height / 2;

        const distance = getDistance(
          new Point(xHovered, yHovered),
          new Point(xHex, yHex)
        );
        if (distance <= this.radius) {
          const fadeRatio = (this.radius - distance) / this.radius;
          const opacity = fadeRatio < 0 ? 0 : fadeRatio;
          this.renderer.setStyle(hex, 'opacity', `${opacity}`);
        } else {
          this.renderer.setStyle(hex, 'opacity', '0.3');
        }
      });
    }
  }

  @HostListener('mouseleave', ['$event.target'])
  resetHover(target: HTMLElement): void {
    const allHexagons =
      this.el.nativeElement.querySelectorAll('.container div');
    allHexagons.forEach((hex: HTMLElement) => {
      this.renderer.removeClass(hex, 'fade');
      this.renderer.removeClass(hex, 'inactive');
    });
    // this.resetAllHexagons();
  }
  //#endregion

  //#region Dijkstra's Algorithm
  public async findPath_Dijkstra(): Promise<void> {
    this.dijkstra_Flag = false;
    var dist: Map<string, number> = new Map();
    var parent: Map<string, string> = new Map();
    var pq = new Heap<[string, number]>(undefined, Comperators.comp);
    let destinationHexCenter: string;
    this.centers.forEach((c) => {
      dist.set(c.asKey(), Infinity);
      parent.set(c.asKey(), c.asKey());
    });
    if (this.startHex && this.destinationHex) {
      dist.set(this.startHex.center.asKey(), 0);
      pq.push([this.startHex.center.asKey(), 0]);
      destinationHexCenter = this.destinationHex.center.asKey();
    } else return;

    while (!pq.isEmpty()) {
      const node = pq.top();
      const currCenter = node[0];
      const dis = node[1];
      if (dis === -1) return;
      pq.pop();
      const currDestDis = dist.get(destinationHexCenter);
      if (currDestDis && dis > currDestDis) break;
      const hexagon = this.hexagons.get(currCenter);
      if (!hexagon) return;
      for (let i = 0; i < 6; i++) {
        const neighbor = hexagon.neighbors[i];
        // if (!neighbor || !neighbor.visit) continue;
        if (!neighbor) continue;
        const neighborTraffic = hexagon.traffic[i];
        const neighborCenter = neighbor.center.asKey();
        if (neighborCenter != destinationHexCenter)
          if(neighbor.visit)this.colorHexagon(neighbor.cordidates, 'rgba(210, 233, 127, 0.44)');
        const trafficWeight =
          neighborTraffic === typeOfTraffic[3]
            ? Infinity
            : typeOfTraffic[neighborTraffic as keyof typeof typeOfTraffic] + 1;

        const currDis = dist.get(neighborCenter);
        if (currDis && dis + trafficWeight < currDis) {
          dist.set(neighborCenter, dis + trafficWeight);
          pq.push([neighborCenter, dis + trafficWeight]);
          parent.set(neighborCenter, currCenter);
        }
        if (neighborCenter != destinationHexCenter) {
          await sleep(constants.DELAY);
          if(neighbor.visit)this.colorHexagon(neighbor.cordidates, 'rgba(191, 220, 221, 0.14)');
        }
        neighbor.visit = false;
      }
      hexagon.visit = false;
    }
    this.colorHexagon(this.destinationHex.cordidates, 'green');
    if (
      !dist.get(destinationHexCenter) ||
      dist.get(destinationHexCenter) === Infinity
    ) {
      console.log('Path not possible');
      return;
    }
    else {
      console.log('Path possible with efforts ', dist.get(destinationHexCenter));
    }
    var path: Array<Hexagon> = [];
    var tempNode = destinationHexCenter;
    while (parent.get(tempNode) != tempNode) {
      const tempHex = this.hexagons.get(tempNode);
      if (!tempHex) return;
      path.push(tempHex);
      tempNode = parent.get(tempHex.center.asKey()) ?? '';
    }
    path.reverse();
    path.pop();
    console.log('Distance: '+path.length);
    let tempHex = this.startHex;
    path.forEach((p) =>{
      this.colorHexagon(p.cordidates, 'rgba(50, 53, 241, 0.51)');
      this.drawPathLine(tempHex.center, p.center);
      tempHex = p;
    });
    this.drawPathLine(tempHex.center, this.destinationHex.center);
  }
  //#endregion

  // #region a-star with Manhattan Distance (Traffic weight considered)
  public async findPath_ManhattanDist(): Promise<void> {
    this.aStar_Manhattan_Flag = false;
    var dist: Map<string, number> = new Map();
    var parent: Map<string, string> = new Map();
    var pq = new Heap<[string, number, number]>(undefined, Comperators.compManhattan_Traffic);
    let destinationHexCenter: string;
    this.centers.forEach((c) => {
      dist.set(c.asKey(), Infinity);
      parent.set(c.asKey(), c.asKey());
    });
    if (this.startHex && this.destinationHex) {
      dist.set(this.startHex.center.asKey(), 0);
      pq.push([
        this.startHex.center.asKey(),
        0,
        getManhattanDistance(this.startHex.center, this.destinationHex.center),
      ]);
      destinationHexCenter = this.destinationHex.center.asKey();
    } else return;

    while (!pq.isEmpty()) {
      const node = pq.top();
      const currCenter = node[0];
      const dis = node[1];
      if (dis === -1) return;
      pq.pop();
      const currDestDis = dist.get(destinationHexCenter);
      if (currDestDis && dis > currDestDis) break;
      const hexagon = this.hexagons.get(currCenter);
      if (!hexagon) return;

      for (let i = 0; i < 6; i++) {
        const neighbor = hexagon.neighbors[i];
        if (!neighbor) continue;
        const neighborTraffic = hexagon.traffic[i];
        const neighborCenter = neighbor.center.asKey();
        if (neighborCenter != destinationHexCenter && neighbor.visit)
          this.colorHexagon(neighbor.cordidates, 'rgba(119, 233, 66, 0.12)');
        const trafficWeight =
          neighborTraffic === typeOfTraffic[3]
            ? Infinity
            : typeOfTraffic[neighborTraffic as keyof typeof typeOfTraffic] + 1;
        if(trafficWeight === Infinity) continue;
        const currDis = dist.get(neighborCenter);
        if (currDis && dis + trafficWeight < currDis) {
          dist.set(neighborCenter, dis + trafficWeight);
          pq.push([
            neighborCenter,
            dis + trafficWeight,
            getManhattanDistance(neighbor.center, this.destinationHex.center),
          ]);
          parent.set(neighborCenter, currCenter);
        }
        if (neighborCenter != destinationHexCenter) {
          await sleep(constants.DELAY);
          if(neighbor.visit)this.colorHexagon(neighbor.cordidates, 'rgba(191, 220, 221, 0.14)');
        }
        neighbor.visit = false;
      }
      hexagon.visit = false;
    }
    this.colorHexagon(this.destinationHex.cordidates, 'green');
    if (
      !dist.get(destinationHexCenter) ||
      dist.get(destinationHexCenter) === Infinity
    ) {
      console.log('Path not possible');
      return;
    }
    else {
      console.log('Path possible with efforts ', dist.get(destinationHexCenter));
    }
    var path: Array<Hexagon> = [];
    var tempNode = destinationHexCenter;
    while (parent.get(tempNode) != tempNode) {
      const tempHex = this.hexagons.get(tempNode);
      if (!tempHex) return;
      path.push(tempHex);
      tempNode = parent.get(tempHex.center.asKey()) ?? '';
    }
    path.reverse();
    path.pop();
    console.log('Distance: '+path.length);
    let tempHex = this.startHex;
    path.forEach((p) =>{
      this.colorHexagon(p.cordidates, 'rgba(50, 53, 241, 0.51)');
      this.drawPathLine(tempHex.center, p.center);
      tempHex = p;
    });
    this.drawPathLine(tempHex.center, this.destinationHex.center);
  }
  //#endregion

  // #region a-star with Manhattan Distance and Fast (without traffic weight)
  public async findPath_ManhattanDist_Fast(): Promise<void> {
    this.aStar_Manhattan_Plus_Flag = false;
    var dist: Map<string, number> = new Map();
    var parent: Map<string, string> = new Map();
    var pq = new Heap<[string, number, number]>(undefined, Comperators.compManhattan_Fast);
    let destinationHexCenter: string;
    this.centers.forEach((c) => {
      dist.set(c.asKey(), Infinity);
      parent.set(c.asKey(), c.asKey());
    });
    if (this.startHex && this.destinationHex) {
      dist.set(this.startHex.center.asKey(), 0);
      pq.push([
        this.startHex.center.asKey(),
        0,
        getManhattanDistance(this.startHex.center, this.destinationHex.center),
      ]);
      destinationHexCenter = this.destinationHex.center.asKey();
    } else return;

    while (!pq.isEmpty()) {
      const node = pq.top();
      const currCenter = node[0];
      const dis = node[1];
      if (dis === -1) return;
      pq.pop();
      const currDestDis = dist.get(destinationHexCenter);
      if (currDestDis && dis > currDestDis) break;
      const hexagon = this.hexagons.get(currCenter);
      if (!hexagon) return;
      for (let i = 0; i < 6; i++) {
        const neighbor = hexagon.neighbors[i];
        if(!neighbor) continue;
        const neighborTraffic = hexagon.traffic[i];
        const neighborCenter = neighbor.center.asKey();
        const currDis = dist.get(neighborCenter);
        const trafficWeight = neighborTraffic === typeOfTraffic[3]
            ? Infinity
            : typeOfTraffic[neighborTraffic as keyof typeof typeOfTraffic] + 1;
        if (trafficWeight===Infinity || (!neighbor.visit && currDis && (dis + trafficWeight > currDis))) continue;

        if (neighborCenter != destinationHexCenter && neighbor.visit)
          this.colorHexagon(neighbor.cordidates, 'rgba(119, 233, 66, 0.12)');

        if (currDis && dis + trafficWeight < currDis) {
          dist.set(neighborCenter, dis + trafficWeight);
          pq.push([
            neighborCenter,
            dis + trafficWeight,
            getManhattanDistance(neighbor.center, this.destinationHex.center),
          ]);
          parent.set(neighborCenter, currCenter);
        }
        if (neighborCenter != destinationHexCenter) {
          await sleep(constants.DELAY);
          if(neighbor.visit)this.colorHexagon(neighbor.cordidates, 'rgba(191, 220, 221, 0.14)');
        }
        neighbor.visit = false;
      }
      hexagon.visit = false;
    }
    this.colorHexagon(this.destinationHex.cordidates, 'green');
    if (
      !dist.get(destinationHexCenter) ||
      dist.get(destinationHexCenter) === Infinity
    ) {
      console.log('Path not possible');
      return;
    }
    else {
      console.log('Path possible with efforts ', dist.get(destinationHexCenter));
    }
    var path: Array<Hexagon> = [];
    var tempNode = destinationHexCenter;
    while (parent.get(tempNode) != tempNode) {
      const tempHex = this.hexagons.get(tempNode);
      if (!tempHex) return;
      path.push(tempHex);
      tempNode = parent.get(tempHex.center.asKey()) ?? '';
    }
    path.reverse();
    path.pop();
    console.log('Distance: '+path.length);
    let tempHex = this.startHex;
    path.forEach((p) =>{
      this.colorHexagon(p.cordidates, 'rgba(50, 53, 241, 0.51)');
      this.drawPathLine(tempHex.center, p.center);
      tempHex = p;
    });
    this.drawPathLine(tempHex.center, this.destinationHex.center);
  }
 //#endregion

 // #region a-star with Chebyshev Distance
  public async findPath_Chebyshev(): Promise<void> {
    this.aStar_Chebyshev_Flag = false;
    const dist: Map<string, number> = new Map();
    const parent: Map<string, string> = new Map();
    const pq = new Heap<[string, number, number]>(undefined, Comperators.compChebyshev);
    let destinationHexCenter: string;
    this.centers.forEach((c) => {
      dist.set(c.asKey(), Infinity);
      parent.set(c.asKey(), c.asKey());
    });
    if (this.startHex && this.destinationHex) {
      dist.set(this.startHex.center.asKey(), 0);
      pq.push([
        this.startHex.center.asKey(),
        0,
        getChebyshevDistance(this.startHex.center, this.destinationHex.center),
      ]);
      destinationHexCenter = this.destinationHex.center.asKey();
    } else return;

    while (!pq.isEmpty()) {
      const node = pq.top();
      const currCenter = node[0];
      const effort = node[1];
      if (effort === -1) return;
      pq.pop();
      const currDestDis = dist.get(destinationHexCenter);
      if (currDestDis && effort > currDestDis) break;
      const hexagon = this.hexagons.get(currCenter);
      if (!hexagon) return;
      for (let i = 0; i < 6; i++) {
        const neighbor = hexagon.neighbors[i];
        if (!neighbor) continue;
        const neighborTraffic = hexagon.traffic[i];
        const neighborCenter = neighbor.center.asKey();
        const currDis = dist.get(neighborCenter);
        const trafficWeight =
          neighborTraffic === typeOfTraffic[3]
            ? Infinity
            : typeOfTraffic[neighborTraffic as keyof typeof typeOfTraffic] + 1;
        if (trafficWeight === Infinity || (!neighbor.visit && currDis && (effort + trafficWeight > currDis)))
            continue;

        if (neighborCenter != destinationHexCenter && neighbor.visit)
          this.colorHexagon(neighbor.cordidates, 'rgba(119, 233, 66, 0.12)');

        if (currDis && effort + trafficWeight < currDis) {
          dist.set(neighborCenter, effort + trafficWeight);
          pq.push([
            neighborCenter,
            effort + trafficWeight,
            getChebyshevDistance(neighbor.center, this.destinationHex.center),
          ]);
          parent.set(neighborCenter, currCenter);
        }
        if (neighborCenter != destinationHexCenter) {
          await sleep(constants.DELAY);
          if (neighbor.visit)
            this.colorHexagon(neighbor.cordidates, 'rgba(191, 220, 221, 0.14)');
        }
        neighbor.visit = false;
      }
      hexagon.visit = false;
    }
    this.colorHexagon(this.destinationHex.cordidates, 'green');
    if (
      !dist.get(destinationHexCenter) ||
      dist.get(destinationHexCenter) === Infinity
    ) {
      console.log('Path not possible');
      return;
    } else {
      console.log('Path possible with efforts ', dist.get(destinationHexCenter));
    }
    const path: Array<Hexagon> = [];
    let tempNode = destinationHexCenter;
    while (parent.get(tempNode) != tempNode) {
      const tempHex = this.hexagons.get(tempNode);
      if (!tempHex) return;
      path.push(tempHex);
      tempNode = parent.get(tempHex.center.asKey()) ?? '';
    }
    path.reverse();
    path.pop();
    console.log('Distance: '+path.length);
    let tempHex = this.startHex;
    path.forEach((p) =>{
      this.colorHexagon(p.cordidates, 'rgba(50, 53, 241, 0.51)');
      this.drawPathLine(tempHex.center, p.center);
      tempHex = p;
    });
    this.drawPathLine(tempHex.center, this.destinationHex.center);
  }
  //#endregion

 // #region Screen capture helpers
  public captureCanvas(): void {
    if (!this.canvas) return;
    try {
      const url = this.canvas.toDataURL('image/png');
      this.captures.unshift(url);
    } catch (e) {
      console.error('Capture failed', e);
    }
  }

  public openPreview(url: string): void {
    this.selectedCapture = url;
  }

  public closePreview(): void {
    this.selectedCapture = null;
    this.showThumbnails = false;
  }

  public cloneSelected(): void {
    if (!this.selectedCapture) return;
    const win = window.open();
    if (win) {
      win.document.write('<iframe src="' + this.selectedCapture + '" frameborder="0" style="border:0; top:0; left:0; bottom:0; right:0; width:100%; height:100%; position:fixed;"></iframe>');
    }
  }

  public toggleThumbnails(state: boolean): void {
    this.showThumbnails = state;
  }

  public disabledFlag:()=> boolean =() => !(this.dijkstra_Flag && this.aStar_Manhattan_Flag && this.aStar_Manhattan_Plus_Flag && this.aStar_Chebyshev_Flag); 
  // #endregion
}
