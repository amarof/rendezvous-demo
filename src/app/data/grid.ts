import { Point } from './point';
export class Grid {
    private Points: Point[] = [];
    constructor() {}

    addPoint(id: string) {
        this.Points.push(new Point(id));
    }
    setNorth(source: string, destination: string) {
        // tslint:disable-next-line:triple-equals
        const sourcePoint: Point = this.Points.find(n => n.Id == source);
        // tslint:disable-next-line:triple-equals
        const destinationPoint: Point = this.Points.find(n => n.Id == destination);
        if (sourcePoint !== null && destinationPoint !== null) {
            sourcePoint.North = destinationPoint;
            destinationPoint.South = sourcePoint;
        }
    }
    setWest(source: string, destination: string) {
        // tslint:disable-next-line:triple-equals
        const sourcePoint: Point = this.Points.find(n => n.Id == source);
        // tslint:disable-next-line:triple-equals
        const destinationPoint: Point = this.Points.find(n => n.Id == destination);
        if (sourcePoint !== null && destinationPoint !== null) {
            sourcePoint.West = destinationPoint;
            destinationPoint.East = sourcePoint;
        }
    }
    getPointById(pointId: string): Point {
        // tslint:disable-next-line:triple-equals
        const point: Point = this.Points.find(n => n.Id == pointId);
        if (point === null  ||  point === undefined) {
            throw new Error('grid with id ' + pointId + ' not found.');
        }
        return point;
    }

}
