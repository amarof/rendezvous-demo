import { Injectable, Input } from '@angular/core';
import { Graph } from '../data/graph';
import { Agent } from '../data/agent';
import { Network, DataSet, Node, Edge, IdType } from 'vis';
import { Dijkstra, Vertex } from '../algorithm/dijkstra';
@Injectable()
export class RendezVousManager {


  public RendezVousNodeId: String = '';
  public distance = 0;
  public transofrmedLabel1 = '';
  public transofrmedLabel2 = '';
  public FirstAgent: Agent;
  public SecondAgent: Agent;
  private Network: Graph = new Graph();
  private agent1Label = '1';
  private agent2Label = '2';
  private initialAgent1Node: any;
  private initialAgent2Node: any;
  private nodes: DataSet;
  private edges: DataSet;
  private visNetwork: Network;

  private agent1Worker;
  private agent2Worker;
  private agent1CurrentBit = 0;
  private agent2CurrentBit = 0;
  private timer;
  private updateTransformedLabels: () => void;
  constructor() {}

  register(nodes: DataSet, edges: DataSet, visNetwork: Network) {
    this.nodes = nodes;
    this.edges = edges;
    this.visNetwork = visNetwork;
   }
   clear(): any {
    this.Network = new Graph();
    this.FirstAgent = new Agent(this.agent1Label);
    this.SecondAgent = new Agent(this.agent2Label);
  }
  addNode(id: string) {
    this.Network.addNode(id);
  }
  deleteNode(id: string) {
    this.Network.deleteNode(id);
  }
  addEdge(source: string, destination: string) {
    this.Network.addEdge(source, destination);
  }
  deleteEdge(source: string, destination: string) {
    this.Network.deleteEdge(source, destination);
  }
  setSecondAgentLabel(label: any): any {
    this.agent2Label = label;
    this.SecondAgent.Label = label;
  }
  setFirstAgentLabel(label: any): any {
    this.agent1Label = label;
    this.FirstAgent.Label = label;
  }
  setFirstAgent(label: string){
    this.agent1Label = label;
    this.FirstAgent = new Agent(label);
  }
  setSecondAgent(label: string){
    this.agent2Label = label;
    this.SecondAgent = new Agent(label);
  }
  setFirstAgentPosition(nodeId: string){
    const node = this.Network.getNodeById(nodeId);
    this.FirstAgent.CurrentNode = node;
    this.calculateDistance();
  }
  setSecondAgentPosition(nodeId: string) {
    const node = this.Network.getNodeById(nodeId);
    this.SecondAgent.CurrentNode = node;
    this.calculateDistance();
    if (this.RendezVousNodeId !== '') {
      const n: Node = this.nodes.get(this.RendezVousNodeId);
      n.shape = 'ellipse';
      n.image = '';
      n.x = undefined;
      n.y = undefined;
      this.nodes.update(n);
    }
  }
  calculateDistance() {
    if (this.SecondAgent.CurrentNode != null && this.FirstAgent.CurrentNode != null) {
      const dijkstra = new Dijkstra();
       this.nodes.forEach(node => {
        const connectedEdges = this.edges.get({
          filter: function (edge) {
            return (edge.from === node.id || edge.to === node.id);
          }
        });
        const connectVertex = [];
        connectedEdges.forEach(e => {
          if (e.to === node.id) {
            connectVertex.push({ nameOfVertex: e.from, weight: 1 });
          } else {
            connectVertex.push({ nameOfVertex: e.to, weight: 1 });
          }
        });
        dijkstra.addVertex(new Vertex(node.id, connectVertex, 1));
      });
      const path = dijkstra.findShortestWay( this.FirstAgent.CurrentNode.Id , this.SecondAgent.CurrentNode.Id);
      this.distance = Number(path[path.length - 1]);
      // draw the path
      const edgesToSelect = [];
      const edgesIds = [];
      for (let index = 0; index <= path.length - 2; index++) {
        if ( (index - 1) > -1) {
          const from = path[index - 1];
          const to = path[index];
          edgesIds.push({from: from, to: to});
        }
      }
      edgesIds.forEach((element) => {
          const edges = this.edges.get({
            filter: function (edge) {
              return ( (edge.from === element.from && edge.to === element.to) ||
              (edge.to === element.from && edge.from === element.to));
            }
          });
          edgesToSelect.push(edges[0]);
      });
      // clear previous color
      const ids = this.edges.getIds();
      for (let index = 0; index < ids.length; index++) {
        const id = ids[index];
        const edge = this.edges.get(id);
        edge.color = {color: 'blue', highlight: 'blue'};
        this.edges.update(edge);
      }
      // set new color
      for (let index = 0; index < edgesToSelect.length; index++) {
        edgesToSelect[index].color = {color: 'red', highlight: 'red'};
      }
      this.edges.update(edgesToSelect);
    }
  }
  run(updateTransformedLabels: () => any) {
    this.updateTransformedLabels = updateTransformedLabels;
    this.initWorker();
    this.start();
  }
  stop() {
    if (this.agent2Worker !== undefined) {
      this.agent2Worker.terminate();
    }
    if (this.agent1Worker !== undefined) {
      this.agent1Worker.terminate();
    }
  }
  moveAgent1ToNode(nodeId: string) {
     const oldNodePos: Node = this.nodes.get(this.FirstAgent.CurrentNode.Id);
     oldNodePos.shape = 'ellipse';
     oldNodePos.image = '';
     oldNodePos.x = undefined;
     oldNodePos.y = undefined;
     const newNodePos: Node = this.nodes.get(nodeId);
     newNodePos.shape = 'icon';
     newNodePos.icon = {
       face: 'FontAwesome',
       code: '\uf21d',
       size: 30,
       color: 'red'
     };
     newNodePos.x = undefined;
     newNodePos.y = undefined;
    this.FirstAgent.CurrentNode = this.Network.getNodeById(nodeId);
    this.nodes.update([oldNodePos, newNodePos]);
  }
  moveAgent2ToNode(nodeId: string){
    const oldNodePos: Node = this.nodes.get(this.SecondAgent.CurrentNode.Id);
    oldNodePos.shape = 'ellipse';
    oldNodePos.image = '';
    oldNodePos.x = undefined;
    oldNodePos.y = undefined;
    const newNodePos: Node = this.nodes.get(nodeId);
    newNodePos.shape = 'icon';
    newNodePos.icon = {
      face: 'FontAwesome',
      code: '\uf21d',
      size: 30,
      color: 'blue'
    };
    newNodePos.x = undefined;
    newNodePos.y = undefined;
    this.SecondAgent.CurrentNode = this.Network.getNodeById(nodeId);
    this.nodes.update([oldNodePos, newNodePos]);
  }
  setRendezVous(nodeId: any) {
      const rendezVousNode: Node = this.nodes.get(nodeId);
      rendezVousNode.shape = 'circularImage';
      rendezVousNode.image = 'assets/img/rdv.png';
      rendezVousNode.size = 15;
      rendezVousNode.x = undefined;
      rendezVousNode.y = undefined;
      this.nodes.update(rendezVousNode);
  }
  getAgent1TransofrmedLabel() {
    this.FirstAgent.getTransformedLabel();
  }
  getAgent2TransofrmedLabel() {
    this.FirstAgent.getTransformedLabel();
  }
  getDeltaMax(): number {
    return this.Network.getMaxNeighbours();
  }
  getBouleTime(): number {
    const delta = this.Network.getMaxNeighbours();
    return 2 * this.distance * delta * (Math.pow( delta - 1, this.distance - 1));
  }
  initWorker() {
    this.initialAgent1Node = this.FirstAgent.CurrentNode;
    this.initialAgent2Node = this.SecondAgent.CurrentNode;
    const delta = this.Network.getMaxNeighbours();
    console.log('Delta is:' + delta);
    const nodeVisitTime = 1;
    const visitedNodeCount = this.getBouleTime(); // 2 * this.distance * delta * (Math.pow( delta - 1, this.distance - 1));
    const roundTime = (visitedNodeCount * nodeVisitTime * 2);

    this.agent1Worker = new Worker('assets/algo-graph-delta.js');
    this.agent2Worker = new Worker('assets/algo-graph-delta.js');
    const agent1params = {
      action: 'init',
      params: {
        agent : this.FirstAgent,
        distance: this.distance,
        maxNeighbours : delta,
        graph : this.Network,
        nodeVisitTime: nodeVisitTime,
        shift : this.FirstAgent.Shift
      }
    };
    this.agent1Worker.postMessage(agent1params);
    const agent2params = {
      action: 'init',
      params: {
        agent : this.SecondAgent,
        distance: this.distance,
        maxNeighbours : delta,
        graph : this.Network,
        nodeVisitTime : nodeVisitTime,
        shift : this.SecondAgent.Shift
      }
    };
    this.agent2Worker.postMessage(agent2params);
  }
  getTransofrmedLabelWithPos(label: Array<string>, pos: number): string {
    const tmp = Object.assign([], label);
    const shifted = [];
    let transfLabel = '';
    let emptyBitCounter = 0;
    for (let index = 0; index < tmp.length; index++) {
      const element = tmp[index];
      if (element !== '*') {
        shifted.push(element);
      } else {
        emptyBitCounter++;
      }
    }
    if (tmp[pos] === '*') {
      transfLabel = shifted.join(' ');
    } else {
      shifted[pos - emptyBitCounter] = '[' + shifted[pos - emptyBitCounter] + ']';
      transfLabel = shifted.join(' ');
    }
    return transfLabel;
  }
  start() {
    let currentAgent1Bit = '';
    let currentAgent2Bit = '';
    const agent1transformedLabel = this.FirstAgent.getTransformedLabelWithShift();
    const agent2transformedLabel = this.SecondAgent.getTransformedLabelWithShift();
    let agent1bitCounter  = 0;
    let agent2bitCounter  = 0;
    let syncBits = 0;
    this.transofrmedLabel1 = this.getTransofrmedLabelWithPos(agent1transformedLabel, agent1bitCounter);
    this.transofrmedLabel2 = this.getTransofrmedLabelWithPos(agent2transformedLabel, agent2bitCounter);
    this.updateTransformedLabels();
    this.timer = setTimeout(() => {
      if (agent1bitCounter < agent1transformedLabel.length) {
        currentAgent1Bit = agent1transformedLabel[agent1bitCounter];
        this.agent1Worker.postMessage({action: 'exec'});
        agent1bitCounter++;
      }
      if (agent2bitCounter < agent1transformedLabel.length) {
        currentAgent2Bit = agent2transformedLabel[agent2bitCounter];
        this.agent2Worker.postMessage({action: 'exec'});
        agent2bitCounter++;
      }
    }, 3000);

    this.agent1Worker.onmessage = (event) => {
      if (event.data.moveToNode !== undefined) {
        const nodeId = event.data.moveToNode;
        this.moveAgent1ToNode(nodeId);
        if (currentAgent2Bit === '0'  && this.SecondAgent.CurrentNode.Id === nodeId &&
        this.initialAgent2Node.Id === nodeId) {
          console.log('OUTSIDE: agent1 find agent 2:  RDV DONE:');
          this.agent1Worker.terminate();
          this.agent2Worker.terminate();
          this.setRendezVous(nodeId);
        }
      } else if (event.data.bit !== undefined) {
        syncBits += 1;
        if (syncBits === 2) {
          console.log('agent 1 bit ' + currentAgent1Bit + '.' + this.agent1CurrentBit + ' execution done' + syncBits);
          syncBits = 0;
          currentAgent1Bit = agent1transformedLabel[agent1bitCounter];
          currentAgent2Bit = agent2transformedLabel[agent2bitCounter];
          this.transofrmedLabel1 = this.getTransofrmedLabelWithPos(agent1transformedLabel, agent1bitCounter);
          this.transofrmedLabel2 = this.getTransofrmedLabelWithPos(agent2transformedLabel, agent2bitCounter);
          this.updateTransformedLabels();
          if ((agent1bitCounter + 1) < agent1transformedLabel.length) {
            agent1bitCounter++;
            this.agent1Worker.postMessage({action: 'exec'});
          } else {
            this.agent1Worker.postMessage({action: '*'});
          }
          if ((agent2bitCounter + 1) < agent2transformedLabel.length) {
            agent2bitCounter++;
            this.agent2Worker.postMessage({action: 'exec'});
          } else {
            this.agent2Worker.postMessage({action: '*'});
          }
        }
        this.agent1CurrentBit = Number(event.data.bit);
      }
    };
    this.agent2Worker.onmessage = (event) => {
      if (event.data.moveToNode !== undefined) {
        const nodeId = event.data.moveToNode;
        this.moveAgent2ToNode(nodeId);
        if (currentAgent1Bit === '0' &&  this.FirstAgent.CurrentNode.Id === nodeId  &&
          this.initialAgent1Node.Id === nodeId) {
          console.log('OUTSIDE: agent2 find agent 1: RDV DONE:');
          this.agent1Worker.terminate();
          this.agent2Worker.terminate();
          this.setRendezVous(nodeId);
        }
      } else if (event.data.bit !== undefined) {
        syncBits += 1;
        if (syncBits === 2) {
          console.log('agent 2 bit ' + currentAgent2Bit + '.' + this.agent2CurrentBit + ' execution done ' + syncBits);
          syncBits = 0;
          currentAgent1Bit = agent1transformedLabel[agent1bitCounter];
          currentAgent2Bit = agent2transformedLabel[agent2bitCounter];
          this.transofrmedLabel1 = this.getTransofrmedLabelWithPos(agent1transformedLabel, agent1bitCounter);
          this.transofrmedLabel2 = this.getTransofrmedLabelWithPos(agent2transformedLabel, agent2bitCounter);
          this.updateTransformedLabels();
          if ((agent1bitCounter + 1) < agent1transformedLabel.length) {
            agent1bitCounter++;
            this.agent1Worker.postMessage({action: 'exec'});
          } else {
            this.agent1Worker.postMessage({action: '*'});
          }
          if ((agent2bitCounter + 1) < agent2transformedLabel.length) {
            agent2bitCounter++;
            this.agent2Worker.postMessage({action: 'exec'});
          } else {
            this.agent2Worker.postMessage({action: '*'});
          }
        }
        this.agent2CurrentBit = Number(event.data.bit);
      }
    };
  } // start
}
