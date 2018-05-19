import { Node } from './node';
export class Graph {
    private Nodes: Node[] = [];
    constructor() {}

    getMaxNeighbours(): number {
        let max = 0;
        for (let index = 0; index < this.Nodes.length; index++) {
            if (this.Nodes[index].Neighbours.length > max) {
                max = this.Nodes[index].Neighbours.length;
            }
        }
        return max;
    }
    addNode(id: string) {
        this.Nodes.push(new Node(id));
    }
    deleteNode(id: string) {
        // remove all node edges
        this.Nodes.forEach(node => {
            node.deleteNeighbour(id);
        });
        // remove the node
        const nodeToDelete: Node =  this.getNodeById(id);
        const index = this.Nodes.indexOf(nodeToDelete);
        if (index > -1) {
            this.Nodes.splice(index, 1);
        }
    }
    addEdge(source: string, destination: string) {
        // tslint:disable-next-line:triple-equals
        const sourceNode: Node = this.Nodes.find(n => n.Id == source);
        // tslint:disable-next-line:triple-equals
        const destinationNode: Node = this.Nodes.find(n => n.Id == destination);
        if (sourceNode !== null && destinationNode !== null) {
            sourceNode.addNeighbour(destinationNode);
            destinationNode.addNeighbour(sourceNode);
        }
    }
    deleteEdge(source: string, destination: string) {
        // tslint:disable-next-line:triple-equals
        const sourceNode: Node = this.Nodes.find(n => n.Id == source);
        // tslint:disable-next-line:triple-equals
        const destinationNode: Node = this.Nodes.find(n => n.Id == destination);
        if (sourceNode !== null && destinationNode !== null) {
            sourceNode.deleteNeighbour(destinationNode.Id);
            destinationNode.deleteNeighbour(sourceNode.Id);
        }
    }

    getNodeById(nodeId: string): Node {
        // tslint:disable-next-line:triple-equals
        const node: Node = this.Nodes.find(n => n.Id == nodeId);
        if (node === null  ||  node === undefined) {
            throw new Error('graph with id ' + nodeId + ' not found.');
        }
        return node;
    }

}
