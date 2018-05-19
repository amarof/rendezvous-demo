export class Node {
    public Id: string;
    public Neighbours: Node[] = [];

    constructor(id: string) {
        this.Id = id;
    }
    getNeighbourIdAtPort(portId: number) {
        let nodeId;
        if (portId < this.Neighbours.length) {
            const node: Node = this.Neighbours[portId];
            nodeId = node.Id;
        }
        return nodeId;
    }
    addNeighbour(node: Node) {
        this.Neighbours.push(node);
    }

    deleteNeighbour(id: string) {
        // tslint:disable-next-line:triple-equals
        const index = this.Neighbours.findIndex(n => n.Id == id);
        if (index > -1) {
            this.Neighbours.splice(index, 1);
         }
    }
}
