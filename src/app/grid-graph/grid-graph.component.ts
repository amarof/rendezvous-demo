import { Component, OnInit } from '@angular/core';
import { Network, DataSet, Node, Edge, IdType } from 'vis';
import { GridRendezVousManager } from '../manager/grid-rendez-vous.manager';

@Component({
  selector: 'app-grid-graph',
  templateUrl: './grid-graph.component.html',
  styleUrls: ['./grid-graph.component.scss'],
  providers: [ GridRendezVousManager ]
})
export class GridGraphComponent implements OnInit {
  nodes: DataSet;
  edges: DataSet;
  network: Network;
  nodeIds = [];
  agent1Label =  '1';
  agent2Label = '2';
  agent1Console = '';
  agent2Console = '';
  distance = 0;
  deltaMax = 0;
  agent1Shit = 0;
  agent2Shit = 0;
  gridSize = 10;
  transofrmedLabel1 = '';
  transofrmedLabel2 = '';
  startButtonLabel = 'Départ';
  stopAfterEachRound = false;
  allowRDVWithSameBit = false;
  isRunning = false;
  private firstAgentPosition = '';
  private secondAgentPosition = '';
  private counter = 3;
  constructor(private _gridRendezVousManager: GridRendezVousManager) { }

  ngOnInit() {
    this.gridInit();
  }

  gridInit() {
    this.nodes = new DataSet();
    // create an array with edges
    this.edges = new DataSet();
    // create a network
    const container = document.getElementById('mygrid');
    const data = {
      nodes: this.nodes,
      edges: this.edges
    };
    const options = {
      physics : {
        enabled: false,
        stabilization: {
          enabled: true,
          iterations: 1000,
          updateInterval: 100,
          onlyDynamicEdges: true,
          fit: true
        }
      },
      interaction: {
        hover: true,
        dragNodes: false
      },
      nodes: {
        color: '#669999'
      }
    };
    this.network = new Network(container, data, options);
    this._gridRendezVousManager.register(this.nodes, this.edges, this.network);
    this._gridRendezVousManager.setFirstAgent(this.agent1Label);
    this._gridRendezVousManager.setSecondAgent(this.agent2Label);
    this.gridBuild();
  }
  setSecondAgentLabel() {
    this._gridRendezVousManager.setSecondAgentLabel(this.agent2Label);
  }
  setFirstAgentLabel() {
    this._gridRendezVousManager.setFirstAgentLabel(this.agent1Label);
  }
  canSetPosition(): boolean {
    if (this.network.getSelectedNodes().length > 0) {
      return true;
    } else {
      return false;
    }
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
      if (oldPositionNode !== null && oldPositionNode !== undefined) {
        oldPositionNode.shape = 'ellipse';
        oldPositionNode.image = '';
        this.nodes.update(oldPositionNode);
      }

    }
    this.firstAgentPosition = nodeId;
    node.x = undefined;
    node.y = undefined;
    this.nodes.update(node);
    this._gridRendezVousManager.setFirstAgent(this.agent1Label);
    this._gridRendezVousManager.setFirstAgentPosition(nodeId);
    this.distance = this._gridRendezVousManager.distance;
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
      if (oldPositionNode !== null && oldPositionNode !== undefined) {
        oldPositionNode.shape = 'ellipse';
        oldPositionNode.image = '';
        this.nodes.update(oldPositionNode);
      }

    }
    this.secondAgentPosition = nodeId;
    node.x = undefined;
    node.y = undefined;
    this.nodes.update(node);
    this._gridRendezVousManager.setSecondAgent(this.agent2Label);
    this._gridRendezVousManager.setSecondAgentPosition(nodeId);
    this.distance = this._gridRendezVousManager.distance;
  }

  setAgent2Shift(){
    this.agent1Shit = 0;
    this._gridRendezVousManager.FirstAgent.Shift = 0;
    this._gridRendezVousManager.SecondAgent.Shift = this.agent2Shit;
  }
  setAgent1Shift(){
    this.agent2Shit = 0;
    this._gridRendezVousManager.SecondAgent.Shift = 0;
    this._gridRendezVousManager.FirstAgent.Shift = this.agent1Shit;
  }
  canStepForword(): boolean {
    return (this.isRunning && this.stopAfterEachRound);
  }
  canStart(): boolean {
    if (this.distance > 0 ) {
      return true;
    } else {
      return false;
    }
  }
  getAgent1Console() {
    this.agent1Console =  this._gridRendezVousManager.agent1Console;
  }
  getAgent2Console() {
    this.agent2Console =  this._gridRendezVousManager.agent2Console;
  }
  executeCurrentBit() {
    this._gridRendezVousManager.executeCurrentBit();
  }

  start() {
    // init edges color
    const ids = this.edges.getIds();
    ids.forEach((id) => {
      const edge = this.edges.get(id);
      edge.color = {};
      this.edges.update(edge);
    });
    this._gridRendezVousManager.stopAfterEachRound = false;
    this._gridRendezVousManager.allowRDVWithSameBit = false;
    this.isRunning = true;
    this._gridRendezVousManager.run(() => {
      this.updateTransformedLabels();
    }, () => {
      this.updateCounter();
    }, () => {
      this.rendezvousDone();
    }, () => {
      this.getAgent1Console();
    }, () => {
      this.getAgent2Console();
    });
  }
  updateCounter() {
    this.startButtonLabel = '' + this.counter;
    this.counter--;
    if (this.counter === 0) {
      this.counter = 3;
      this.startButtonLabel = 'Rendez-vous en cours...';
    }
  }
  rendezvousDone(){
    this.startButtonLabel = 'Rendezvous effectué';
    this.stopAfterEachRound = false;
    this.isRunning = false;
  }
  stop() {
    this._gridRendezVousManager.stop();
    this.isRunning = false;
  }
  updateTransformedLabels() {
    if ( this.distance === 0 && this.deltaMax === 0) {
      this.transofrmedLabel1 = '';
      this.transofrmedLabel2 = '';
    } else {
      this.transofrmedLabel1 = this._gridRendezVousManager.transofrmedLabel1;
      this.transofrmedLabel2 = this._gridRendezVousManager.transofrmedLabel2;
    }
  }
  clear() {
    this._gridRendezVousManager.clear();
    this._gridRendezVousManager.stop();
    this.nodes.clear();
    this.edges.clear();
    this.distance = 0;
    this.agent1Shit = 0;
    this.agent2Shit = 0;
    this.secondAgentPosition = '1';
    this.firstAgentPosition = '1';
    this.setAgent1Shift();
    this.setAgent2Shift();
    this.transofrmedLabel1 = '';
    this.transofrmedLabel2 = '';
    this.startButtonLabel = 'Départ';
    this.stopAfterEachRound = false;
    this.isRunning = false;
    this.gridBuild();
  }
  gridBuild() {
    const size = +this.gridSize;
    console.log(this.gridSize);
    // generate nodes
    const grid: any [][] = new Array(size).fill(0).map(() => new Array(size).fill(0));
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        grid[i][j] =  {
                        id: i + '-' + j,
                        label: '',
                        x : j * 80,
                        y : i * 80
                      };
      }
    }
    // set edge
    for (let i = 0; i < grid.length; i++) {
      const line = grid[i];
      for (let j = 0; j < line.length; j++) {
        const currentNode = grid[i][j];
        this.nodes.add(currentNode);
        this._gridRendezVousManager.addPoint(currentNode.id);
        // north
        if ( (i - 1) >= 0 ) {
          const targetId = grid[i - 1][j].id;
          const edge1 = {
            color : '#669999',
            from: currentNode.id,
            to: targetId
          };
          const edge2 = {
            color : '#669999',
            from: targetId,
            to: currentNode.id
          };
          this.edges.add(edge1);
          this.edges.add(edge2);
          this._gridRendezVousManager.addPoint(targetId);
          this._gridRendezVousManager.setNorth(currentNode.id, targetId );
        }
        // west
        if ( (j - 1) >= 0 ) {
          const targetId = grid[i][j - 1].id;
          const edge1 = {
            color : '#669999',
            from: currentNode.id,
            to: targetId
          };
          const edge2 = {
            color : '#669999',
            from: targetId,
            to: currentNode.id
          };
          this.edges.add(edge1);
          this.edges.add(edge2);
          this._gridRendezVousManager.addPoint(targetId);
          this._gridRendezVousManager.setWest(currentNode.id, targetId );
        }
      }
    }
  }
}