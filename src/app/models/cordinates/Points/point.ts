export class Point {
  public x: number;
  public y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
  
  public asKey():string{
    return `${this.x.toFixed(8)},${this.y.toFixed(8)}`;
  }

  public static getXY(xy:string):Point{
    const x = Number(xy.split(',')[0]);
    const y = Number(xy.split(',')[1]);
    return new Point(x,y);
  } 
}
