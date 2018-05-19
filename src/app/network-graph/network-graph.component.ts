import { Component, OnInit, Input } from '@angular/core';
import { Network, DataSet, Node, Edge, IdType } from 'vis';
import { RendezVousManager } from '../manager/rendez-vous.manager';
@Component({
  templateUrl: './network-graph.component.html',
  providers: [ RendezVousManager ]
})
export class NetworkGraphComponent implements OnInit {
  nodes: DataSet;
  edges: DataSet;
  network: Network;
  nodeIds = [];
  agent1Label =  '1';
  agent2Label = '2';
  distance = 0;
  deltaMax = 0;
  agent1Shit = 0;
  agent2Shit = 0;
  transofrmedLabel1 = '';
  transofrmedLabel2 = '';
  startButtonLabel = 'Départ';
  private firstAgentPosition = '';
  private secondAgentPosition = '';
  private counter = 3;
  constructor(private _rendezVousManager: RendezVousManager) { }

  ngOnInit() {
    this.networkInit();
  }
  networkInit() {
    this.nodes = new DataSet();
    // create an array with edges
    this.edges = new DataSet();
    // create a network
    const container = document.getElementById('mynetwork');
    const data = {
      nodes: this.nodes,
      edges: this.edges
    };
    const options = {
      physics : {
        enabled: true,
        stabilization: {
          enabled: true,
          iterations: 1000,
          updateInterval: 100,
          onlyDynamicEdges: true,
          fit: true
        }
      },
      interaction: {
        hover: true
      },
      manipulation: {
        enabled: true,
        // tslint:disable-next-line:no-shadowed-variable
        addNode: (data, callback) => {
          const nodeId  = this.nodes.length + 1;
          data.label =  '';
          data.id =  nodeId;
          this._rendezVousManager.addNode(nodeId);
          callback(data);
          this.nodeIds = this.nodes.getIds();
          this.deltaMax = this._rendezVousManager.getDeltaMax();
        },
        // tslint:disable-next-line:no-shadowed-variable
        deleteNode: (data, callback) => {
          const nodeId = data.nodes[0];
          this._rendezVousManager.deleteNode(nodeId);
          callback(data);
          this.nodeIds = this.nodes.getIds();
          this.deltaMax = this._rendezVousManager.getDeltaMax();
        },
        // tslint:disable-next-line:no-shadowed-variable
        addEdge: (data, callback) => {
          data.color = {color: 'blue'};
          this._rendezVousManager.addEdge(data.from, data.to);
          callback(data);
          this.deltaMax = this._rendezVousManager.getDeltaMax();
        },
        // tslint:disable-next-line:no-shadowed-variable
        deleteEdge: (data, callback) => {
          const edgeId = data.edges[0];
          const edge = this.edges.get(edgeId);
          this._rendezVousManager.deleteEdge(edge.from, edge.to);
          callback(data);
          this.deltaMax = this._rendezVousManager.getDeltaMax();
        }
      }
    };
    this.network = new Network(container, data, options);
    this._rendezVousManager.register(this.nodes, this.edges, this.network);
    this._rendezVousManager.setFirstAgent(this.agent1Label);
    this._rendezVousManager.setSecondAgent(this.agent2Label);
  }
  setAgent2Shift(){
    this.agent1Shit = 0;
    this._rendezVousManager.FirstAgent.Shift = 0;
    this._rendezVousManager.SecondAgent.Shift = this.agent2Shit;
  }
  setAgent1Shift(){
    this.agent2Shit = 0;
    this._rendezVousManager.SecondAgent.Shift = 0;
    this._rendezVousManager.FirstAgent.Shift = this.agent1Shit;
  }
  canSetPosition(): boolean {
    if (this.network.getSelectedNodes().length > 0) {
      return true;
    } else {
      return false;
    }
  }
  canStart(): boolean {
    if (this.distance > 0 && this.deltaMax > 0) {
      return true;
    } else {
      return false;
    }
  }
  getTransformedLabel1(): string {
    return this._rendezVousManager.transofrmedLabel1;
  }
  getTransformedLabel2(): string {
    return this._rendezVousManager.transofrmedLabel2;
  }
  setSecondAgentLabel() {
    this._rendezVousManager.setSecondAgentLabel(this.agent2Label);
  }
  setFirstAgentLabel() {
    this._rendezVousManager.setFirstAgentLabel(this.agent1Label);
  }
  setFirstAgentPosition() {
    const nodeId = this.network.getSelectedNodes()[0];
    const node: Node = this.nodes.get(nodeId);
    if (node === null || node === undefined) {
      return;
    }
    node.shape = 'icon';
    node.icon = {
      face: 'FontAwesome',
      code: '\uf21d',
      size: 30,
      color: 'red'
    };
    if (this.firstAgentPosition !== '') {
      const oldPositionNode: Node = this.nodes.get(this.firstAgentPosition);
      oldPositionNode.shape = 'ellipse';
      oldPositionNode.image = '';
      this.nodes.update(oldPositionNode);
    }
    this.firstAgentPosition = nodeId;
    node.x = undefined;
    node.y = undefined;
    this.nodes.update(node);
    this._rendezVousManager.setFirstAgent(this.agent1Label);
    this._rendezVousManager.setFirstAgentPosition(nodeId);
    this.distance = this._rendezVousManager.distance;
  }
  setSecondAgentPosition() {
    const nodeId = this.network.getSelectedNodes()[0];
    const node: Node = this.nodes.get(nodeId);
    if (node === null || node === undefined) {
      return;
    }
    node.shape = 'icon';
    node.icon = {
      face: 'FontAwesome',
      code: '\uf21d',
      size: 30,
      color: 'blue'
    };
    if (this.secondAgentPosition !== '') {
      const oldPositionNode: Node = this.nodes.get(this.secondAgentPosition);
      oldPositionNode.shape = 'ellipse';
      oldPositionNode.image = '';
      this.nodes.update(oldPositionNode);
    }
    this.secondAgentPosition = nodeId;
    node.x = undefined;
    node.y = undefined;
    this.nodes.update(node);
    this._rendezVousManager.setSecondAgent(this.agent2Label);
    this._rendezVousManager.setSecondAgentPosition(nodeId);
    this.distance = this._rendezVousManager.distance;    
  }
  start() {
    // init edges color
    const ids = this.edges.getIds();
    ids.forEach((id) => {
      const edge = this.edges.get(id);
      edge.color = {};
      this.edges.update(edge);
    });
    this._rendezVousManager.run(() => {
      this.updateTransformedLabels();
    }, () => {
      this.updateCounter();
    }, () => {
      this.rendezvousDone();
    });
  }
  rendezvousDone(){
    this.startButtonLabel = 'Rendezvous effectué';
  }
  stop() {
    this._rendezVousManager.stop();
  }
  generateGraph() {
    this.clear();
    this._rendezVousManager.clear();
    this.rendererGraph(25);
    this.nodeIds = this.nodes.getIds();
    this.deltaMax = this._rendezVousManager.getDeltaMax();
  }
  updateCounter() {
    this.startButtonLabel = '' + this.counter;
    this.counter--;
    if (this.counter === 0) {
      this.counter = 3;
      this.startButtonLabel = 'Rendez-vous en cours...';
    }
  }
  updateTransformedLabels() {
    if ( this.distance === 0 && this.deltaMax === 0) {
      this.transofrmedLabel1 = '';
      this.transofrmedLabel2 = '';
    } else {
      this.transofrmedLabel1 = this._rendezVousManager.transofrmedLabel1;
      this.transofrmedLabel2 = this._rendezVousManager.transofrmedLabel2;
    }
  }
  clear() {
    this._rendezVousManager.clear();
    this._rendezVousManager.stop();
    this.nodes.clear();
    this.edges.clear();
    this.distance = 0;
    this.deltaMax = 0;
    this.agent1Shit = 0;
    this.agent2Shit = 0;
    this.setAgent1Shift();
    this.setAgent2Shift();
    this.transofrmedLabel1 = '';
    this.transofrmedLabel2 = '';
    this.startButtonLabel = 'Départ';
  }
  private rendererGraph (nodeCount: Number) {
    this.nodes.clear();
    this.edges.clear();
    const connectionCount = [];
    // randomly create some nodes and edges
    for (let i = 0; i < nodeCount; i++) {
      const nodeId: any  = i;
      const node = {
        id: nodeId,
        label: ''
      };
      this.nodes.add(node);
      this._rendezVousManager.addNode(nodeId);
      connectionCount[i] = 0;
      // create edges in a scale-free-network way
      if (i === 1) {
        // tslint:disable-next-line:no-shadowed-variable
        const from = i;
        // tslint:disable-next-line:no-shadowed-variable
        const to = 0;
        const edge = {
          color : {color: 'blue', highlight: 'blue'},
          from: from,
          to: to
        };
        this.edges.add(edge);
        this._rendezVousManager.addEdge(String(from), String(to));
        connectionCount[from]++;
        connectionCount[to]++;
      } else if (i > 1) {
        const conn = this.edges.length * 2;
        const rand = Math.floor(Math.random() * conn);
        let cum = 0;
        let j = 0;
        while (j < connectionCount.length && cum < rand) {
          cum += connectionCount[j];
          j++;
        }
        const from = i;
        const to = j;
        const edge = {
          color : {color: 'blue', highlight: 'blue'},
          from: from,
          to: to
        };
        this.edges.add({
          from: from,
          to: to
        });
        this._rendezVousManager.addEdge(String(from), String(to));
        connectionCount[from]++;
        connectionCount[to]++;
      }
    }
  }
}
