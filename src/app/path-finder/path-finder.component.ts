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

@Component({
  selector: 'app-path-finder',
  templateUrl: './path-finder.component.html',
  styleUrl: './path-finder.component.css',
})
export class PathFinderComponent {
  private startHex: HexagonCordinate | null = null;
  private destinationHex: HexagonCordinate | null = null;
  private radius: number = 5;
  private ROWS: number = 0;
  private COLS: number = 0;
  private HEX_HEIGHT: number = 0;
  private HEX_WIDTH: number = 0;
  private HEX_SIZE: number = 0;
  private centers: Array<Point>;
  private hexaCordinates: Array<HexagonCordinate>;
  private hexagons: Map<string, Hexagon>;
  // private typeOfTraffic: string[] = ['red', 'orange', 'yellow', 'green'];

  @ViewChild('hexCanvas', { static: false })
  canvasEle!: ElementRef<HTMLCanvasElement>;
  private cntx!: CanvasRenderingContext2D;
  private canvas!: HTMLCanvasElement;

  public ngOnInit(): void {
    this.HEX_SIZE = 15;
    this.HEX_WIDTH = this.HEX_SIZE * 2;
    this.HEX_HEIGHT = this.HEX_SIZE * Math.sqrt(3);
  }

  public ngAfterViewInit(): void {
    this.canvas = this.canvasEle?.nativeElement;
    const cntx = this.canvas?.getContext('2d');
    if (cntx) {
      this.cntx = cntx;
      console.log('Drawing on Canvas!!');
      this.ROWS = this.canvas.height / 28;
      this.COLS = this.canvas.width / 24;
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

  private getDistance(point: Point, target: Point): number {
    return Math.sqrt(
      Math.pow(point.x - target.x, 2) + Math.pow(point.y - target.y, 2)
    );
  }

  private getHexCenter(row: number, col: number): Point {
    const x = col * this.HEX_WIDTH * 0.75 + this.HEX_SIZE + 10;
    const y =
      row * this.HEX_HEIGHT +
      (col % 2) * this.HEX_HEIGHT * 0.5 +
      this.HEX_SIZE +
      10;
    return new Point(x, y);
  }

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
        const center = this.getHexCenter(row, col);
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
    console.log(
      Math.floor(this.ROWS) * Math.floor(this.COLS),
      this.hexaCordinates.length,
      this.centers.length
    );
  }

  private getNeighbors(currCenter: Point): void {
    for (let i = 0; i < 6; i++) {
      const angle = Math.PI / 6 + (Math.PI / 3) * i;
      const px = currCenter.x + Math.sqrt(3) * this.HEX_SIZE * Math.cos(angle);
      const py = currCenter.y + Math.sqrt(3) * this.HEX_SIZE * Math.sin(angle);
      const newPoint = new Point(px, py);
      // const hex = this.getHexaCordinates(newPoint);
      // if(hex){
      //   const newHex = this.getCenter(hex);
      //   if(newHex)console.log(newHex.x-newPoint.x , newHex.y-newPoint.y);
      // }
      // console.log(newPoint);
      const neighbor = this.hexagons.get(newPoint.asKey());
      const current = this.hexagons.get(currCenter.asKey());
      // console.log("neighbor");
      // console.log(neighbor,current);
      // console.log("be")
      if (neighbor && current) {
        // if(hex)this.colorHexagon(hex,'blue');
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

  //#region Old One
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

        const distance = this.getDistance(
          new Point(xHovered, yHovered),
          new Point(xHex, yHex)
        );

        /**
        if (distance <= this.radius) {
          this.renderer.addClass(hex, 'active');
          this.renderer.removeClass(hex, 'fade');
        } else {
          this.renderer.addClass(hex, 'fade');
          this.renderer.removeClass(hex, 'active');
        }
        */
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
    this.resetAllHexagons();
  }

  //useless
  private closestCordinate(point: Point): Point {
    let resPoint = this.centers[0];
    var minDistance = this.getDistance(resPoint, point);
    for (let center of this.centers) {
      let tempDist = this.getDistance(center, point);
      if (minDistance > tempDist) {
        resPoint = center;
      }
    }
    return resPoint;
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
  onHexClick(event: MouseEvent): void {
    const canvasBox = this.canvas.getBoundingClientRect();
    const adjustX = this.canvas.width / canvasBox.width;
    const adjustY = this.canvas.height / canvasBox.height;

    const x = (event.clientX - canvasBox.left) * adjustX;
    const y = (event.clientY - canvasBox.top) * adjustY;
    console.log(x, y);
    const hex = this.getHexaCordinates(new Point(x, y));
    console.log(hex);
    if (hex) {
      this.startHex === null
        ? this.setHexAsStart(hex)
        : this.destinationHex === null
        ? this.setHexAsdestination(hex)
        : console.log('Already selected!!');
    }
  }

  onHexHover(event: Event): void {}

  private resetAllHexagons() {
    if (this.startHex) {
      // this.resetHex(this.startHex);
      this.startHex = null;
    }
  }
  private setHexAsdestination(hex: HexagonCordinate): void {
    this.destinationHex = hex;
    this.colorHexagon(hex, 'rgba(141, 233, 36, 0.94)');
  }
  private setHexAsStart(hex: HexagonCordinate): void {
    this.startHex = hex;
    this.colorHexagon(hex, 'rgba(226, 62, 103, 0.99)');
  }
  public resetHex(hex: HTMLElement) {
    this.renderer.removeStyle(hex, 'background');
    this.renderer.setProperty(hex, 'innerText', '');
  }
  //#endregion
}
