export class Point {
    public Id: string;
    public North: Point = null;
    public South: Point = null;
    public East: Point = null;
    public West: Point = null;
    constructor(id: string) {
        this.Id = id;
    }
}
export enum PointDirection {
    NORTH,
    SOUTH,
    EAST,
    WEST
}
