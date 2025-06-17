import { HexagonCordinate } from "../cordinates/hexagon/hexagon-cordinate"
import { Point } from "../cordinates/Points/point";

export class Hexagon {
    public center:Point;
    public cordidates:HexagonCordinate;
    public neighbors:Array<Hexagon> = new Array<Hexagon>(6);
    public traffic: Array<string> = new Array<string>(6);
    public visit:boolean = false;
    constructor(center: Point, cordidates: HexagonCordinate){
        this.center = center;
        this.cordidates = cordidates;
    }
}
