import { Point } from '../Points/point';

export class HexagonCordinate {
  public p1: Point;
  public p2: Point;
  public p3: Point;
  public p4: Point;
  public p5: Point;
  public p6: Point;

  constructor(
    p1: Point,
    p2: Point,
    p3: Point,
    p4: Point,
    p5: Point,
    p6: Point
  ) {
    this.p1 = p1;
    this.p2 = p2;
    this.p3 = p3;
    this.p4 = p4;
    this.p5 = p5;
    this.p6 = p6;
  }

  public getCord(i:number):Point | null{
    switch(i){
        case 1: return this.p1;
        case 2: return this.p2;
        case 3: return this.p3;
        case 4: return this.p4;
        case 5: return this.p5;
        case 6: return this.p6;
        default : return null;
    }
  }
}
