import { Injectable, Input } from '@angular/core';
import { Graph } from '../data/graph';
import { Agent } from '../data/agent';
import { Network, DataSet, Node, Edge, IdType } from 'vis';
import { Dijkstra, Vertex } from '../algorithm/dijkstra';
import { Movement } from '../data/movement';
@Injectable()
export class RendezVousManager {


  public RendezVousNodeId: String = '';
  public distance = 0;
  public transofrmedLabel1 = '';
  public transofrmedLabel2 = '';
  public FirstAgent: Agent;
  public SecondAgent: Agent;
  public stopAfterEachRound = false;
  public allowRDVWithSameBit = false;
  public agent1Console  = '';
  public agent2Console  = '';
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
  private currentAgent1Bit = '';
  private currentAgent2Bit = '';
  private agent1transformedLabel: any;
  private agent2transformedLabel: any;
  private agent1bitCounter  = 0;
  private agent2bitCounter  = 0;
  private syncBits = 0;
  private traficAnimationSpeed = 8;
  private nodeVisitTime = 1500;
  private timer;
  private updateTransformedLabels: () => void;
  private updateCounter: () => void;
  private rendezvousDone: () => any;
  private getAgent1Console: () => any;
  private getAgent2Console: () => any;
  private isRDV = false;
  private rdvNodeId = '';  
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
    this.agent1Console = '';
    this.agent2Console = '';
    this.isRDV = false;
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
     /* const edgesToSelect = [];
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
      this.clearPreviousEdgeColor();
      // set new color
      for (let index = 0; index < edgesToSelect.length; index++) {
        edgesToSelect[index].color = {color: 'blue', highlight: 'blue'};
        edgesToSelect[index].dashes = true;
        edgesToSelect[index].width = 5;
      }
      this.edges.update(edgesToSelect);*/
    }
  }
  clearPreviousEdgeColor() {
      // clear previous color
      const ids = this.edges.getIds();
      for (let index = 0; index < ids.length; index++) {
        const id = ids[index];
        const edge = this.edges.get(id);
        edge.color = {color: '#669999', highlight: '#669999'};
        edge.dashes = false;
        edge.width = 1;
        this.edges.update(edge);
      }
  }
  run(updateTransformedLabels: () => any , updateCounter: () => any, rendezvousDone: () => any,
   getAgent1Console: () => any, getAgent2Console: () => any) {
    this.updateTransformedLabels = updateTransformedLabels;
    this.updateCounter = updateCounter;
    this.rendezvousDone = rendezvousDone;
    this.getAgent1Console = getAgent1Console;
    this.getAgent2Console = getAgent2Console;
    this.isRDV = false;
    this.clearPreviousEdgeColor();
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
    const  move: Movement = new Movement();
    move.AgentId = '1';
    move.From = this.FirstAgent.CurrentNode.Id;
    move.To = nodeId;
    const tt =  this.getEdgeBetweenNodes(Number(move.From), Number(nodeId));
    if (tt.length  === 0) {
      console.log('aie 1 :' + move.From + '->' + nodeId);
      move.EdgeId  = undefined;
    } else {
      move.EdgeId  = tt[0];
    }
    this.updateAgent1Position(move);

  }
  moveAgent2ToNode(nodeId: string) {
    const  move: Movement = new Movement();
    move.AgentId = '2';
    move.From = this.SecondAgent.CurrentNode.Id;
    move.To = nodeId;
    const bb =  this.getEdgeBetweenNodes(Number(move.From), Number(nodeId));
    if (bb.length === 0) {
      console.log('aie 2 :' + move.From + '->' + nodeId);
      move.EdgeId = undefined;
    } else {
      move.EdgeId = bb[0];
    }
    this.updateAgent2Position(move);
  }
  getEdgeBetweenNodes(source, dest) {
    return this.edges.get().filter(function (edge) {
        return (edge.from === source && edge.to === dest );
    });
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
  updateAgent1Position(move: Movement) {
    const agent1OldNode: Node = this.nodes.get(move.From);
    agent1OldNode.shape = 'ellipse';
    agent1OldNode.image = '';
    agent1OldNode.icon = undefined;
    agent1OldNode.x = undefined;
    agent1OldNode.y = undefined;
    const agent1NewNode: Node = this.nodes.get(move.To);
    agent1NewNode.shape = 'icon';
    agent1NewNode.x = undefined;
    agent1NewNode.y = undefined;
    const targetNode: Node = this.Network.getNodeById(move.To);
    if (move.EdgeId === undefined) {
      agent1OldNode.shape = 'icon';
      agent1OldNode.icon = {
        face: 'FontAwesome',
        code: '\uf21d',
        size: 30,
        color: 'red'
      };
      this.nodes.update(agent1OldNode);
      this.FirstAgent.CurrentNode = targetNode;
    } else {
      this.nodes.update(agent1OldNode);
      this.visNetwork.animateTraffic([{edge: move.EdgeId, trafficSize: 5, isBackward : false}],
        this.traficAnimationSpeed * 3 , 'red', function() {}, function() {}, function() { } , () => {
          const graphicNode: Node = this.nodes.get(move.To);
          if (graphicNode.shape === 'icon')  {
            agent1NewNode.shape = 'circularImage';
            agent1NewNode.image = 'assets/img/rdv.png';
            agent1NewNode.size = 15;
          } else {
            agent1NewNode.shape = 'icon';
            agent1NewNode.icon = {
              face: 'FontAwesome',
              code: '\uf21d',
              size: 30,
              color: 'red'
            };
          }
          this.nodes.update(agent1NewNode);
          this.FirstAgent.CurrentNode = targetNode;
          if (this.isRDV) {
            this.theRendezVousIsDone();
          }
      });
    }
  }
  updateAgent2Position(move: Movement) {

    const agent2OldNode: Node = this.nodes.get(move.From);
    agent2OldNode.shape = 'ellipse';
    agent2OldNode.image = '';
    agent2OldNode.icon = undefined;
    agent2OldNode.x = undefined;
    agent2OldNode.y = undefined;
    const agent2NewNode: Node = this.nodes.get(move.To);
    agent2NewNode.shape = 'icon';
    agent2NewNode.icon = {
      face: 'FontAwesome',
      code: '\uf21d',
      size: 30,
      color: 'blue'
    };
    agent2NewNode.x = undefined;
    agent2NewNode.y = undefined;
    const targetNode = this.Network.getNodeById(move.To);

    if (move.EdgeId === undefined){
      agent2OldNode.shape = 'icon';
      agent2OldNode.icon = {
        face: 'FontAwesome',
        code: '\uf21d',
        size: 30,
        color: 'blue'
      };
      this.nodes.update(agent2OldNode);
      this.SecondAgent.CurrentNode = targetNode;
    } else {
      if ( String(move.From) === String(move.To)) {
        agent2OldNode.shape = 'icon';
        agent2OldNode.icon = {
          face: 'FontAwesome',
          code: '\uf21d',
          size: 30,
          color: 'blue'
        };
      }
      this.nodes.update(agent2OldNode);
      this.visNetwork.animateTraffic([{edge: move.EdgeId, trafficSize: 5, isBackward : false}],
        this.traficAnimationSpeed * 3 , 'blue', function() {}, function() {}, function() { } , () => {
          const graphicNode: Node = this.nodes.get(move.To);
          if (graphicNode.shape === 'icon' )  {
            agent2NewNode.shape = 'circularImage';
            agent2NewNode.image = 'assets/img/rdv.png';
            agent2NewNode.size = 15;
          } else {
            agent2NewNode.shape = 'icon';
            agent2NewNode.icon = {
              face: 'FontAwesome',
              code: '\uf21d',
              size: 30,
              color: 'blue'
            };
          }
          this.nodes.update(agent2NewNode);
          this.SecondAgent.CurrentNode = targetNode;
          if (this.isRDV) {
            this.theRendezVousIsDone();
          }
      });
    }
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
    const visitedNodeCount = this.getBouleTime(); // 2 * this.distance * delta * (Math.pow( delta - 1, this.distance - 1));
    const roundTime = (visitedNodeCount * this.nodeVisitTime * 2);

    this.agent1Worker = new Worker('assets/algo-graph-delta.js');
    this.agent2Worker = new Worker('assets/algo-graph-delta.js');
    const agent1params = {
      action: 'init',
      params: {
        agent : this.FirstAgent,
        distance: this.distance,
        maxNeighbours : delta,
        graph : this.Network,
        nodeVisitTime: this.nodeVisitTime,
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
        nodeVisitTime : this.nodeVisitTime,
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
    const  tracker = [];
    let counter = 3;
    this.agent1transformedLabel = this.FirstAgent.getTransformedLabelWithShift();
    this.agent2transformedLabel = this.SecondAgent.getTransformedLabelWithShift();
    this.agent1bitCounter  = 0;
    this.agent2bitCounter  = 0;
    this.transofrmedLabel1 = this.getTransofrmedLabelWithPos(this.agent1transformedLabel, this.agent1bitCounter);
    this.transofrmedLabel2 = this.getTransofrmedLabelWithPos(this.agent2transformedLabel, this.agent2bitCounter);
    this.updateTransformedLabels();
    this.timer = setTimeout(() => {
      if (this.agent1bitCounter < this.agent1transformedLabel.length) {
        this.currentAgent1Bit = this.agent1transformedLabel[this.agent1bitCounter];
        this.agent1Worker.postMessage({action: 'exec'});
        this.agent1bitCounter++;
      }
      if (this.agent2bitCounter < this.agent1transformedLabel.length) {
        this.currentAgent2Bit = this.agent2transformedLabel[this.agent2bitCounter];
        this.agent2Worker.postMessage({action: 'exec'});
        this.agent2bitCounter++;
      }
    }, 3000);
    const counterTimer = setInterval(() => {
      this.updateCounter();
      counter--;
      if ( counter === 0 ){
        counter = 3;
        clearInterval(counterTimer);
      }
    }, 1000);
    this.agent1Worker.onmessage = (event) => {
      if (event.data.moveToNode !== undefined) {
        const nodeId = event.data.moveToNode;
        tracker.push(nodeId);
        this.moveAgent1ToNode(nodeId);
        if (this.allowRDVWithSameBit) {
          if ( this.SecondAgent.CurrentNode.Id === nodeId) {
            this.isRDV = true;
          }
        } else {
          if (this.currentAgent2Bit === '0'  && this.SecondAgent.CurrentNode.Id === nodeId &&
          this.initialAgent2Node.Id === nodeId) {
            this.isRDV = true;
          }
        }
        if (this.isRDV) {
          this.rdvNodeId = nodeId;
          this.theRendezVousIsDone();
        }
      } else if (event.data.bit !== undefined) {
        this.syncBits += 1;
        if (this.syncBits === 2) {
          console.log('agent 1 bit ' + this.currentAgent1Bit + '.' + this.agent1CurrentBit + ' execution done' + this.syncBits);
          if (!this.stopAfterEachRound) {
            this.executeCurrentBit();
          }
        }
        this.agent1CurrentBit = Number(event.data.bit);
      } else if (event.data.messageToConsole !== undefined) {
        this.agent1Console += event.data.messageToConsole;
        this.getAgent1Console();
      }
    };
    this.agent2Worker.onmessage = (event) => {
      if (event.data.moveToNode !== undefined) {
        const nodeId = event.data.moveToNode;
        this.moveAgent2ToNode(nodeId);
        if (this.allowRDVWithSameBit) {
          if (this.FirstAgent.CurrentNode.Id === nodeId) {
            this.isRDV = true;
          }
        } else {
          if (this.currentAgent1Bit === '0' &&  this.FirstAgent.CurrentNode.Id === nodeId  &&
          this.initialAgent1Node.Id === nodeId) {
            this.isRDV = true;
          }
        }
        if (this.isRDV) {
          this.rdvNodeId = nodeId;
          this.theRendezVousIsDone();
        }
      } else if (event.data.bit !== undefined) {
        this.syncBits += 1;
        if (this.syncBits === 2) {
          console.log('agent 2 bit ' + this.currentAgent2Bit + '.' + this.agent2CurrentBit + ' execution done ' + this.syncBits);
          if (!this.stopAfterEachRound) {
            this.executeCurrentBit();
          }
        }
        this.agent2CurrentBit = Number(event.data.bit);
      } else if (event.data.messageToConsole !== undefined) {
        this.agent2Console += event.data.messageToConsole;
        this.getAgent2Console();
      }
    };
  } // start

  executeCurrentBit() {
    this.syncBits = 0;
    this.currentAgent1Bit = this.agent1transformedLabel[this.agent1bitCounter];
    this.currentAgent2Bit = this.agent2transformedLabel[this.agent2bitCounter];
    this.transofrmedLabel1 = this.getTransofrmedLabelWithPos(this.agent1transformedLabel, this.agent1bitCounter);
    this.transofrmedLabel2 = this.getTransofrmedLabelWithPos(this.agent2transformedLabel, this.agent2bitCounter);
    this.updateTransformedLabels();
    if ((this.agent1bitCounter + 1) < this.agent1transformedLabel.length) {
      this.agent1bitCounter++;
      this.agent1Worker.postMessage({action: 'exec'});
    } else {
      this.agent1Worker.postMessage({action: '*'});
    }
    if ((this.agent2bitCounter + 1) < this.agent2transformedLabel.length) {
      this.agent2bitCounter++;
      this.agent2Worker.postMessage({action: 'exec'});
    } else {
      this.agent2Worker.postMessage({action: '*'});
    }
  }
  theRendezVousIsDone() {
    console.log('OUTSIDE: agent2 find agent 1: RDV DONE:');
    this.agent1Worker.terminate();
    this.agent2Worker.terminate();
    this.setRendezVous(this.rdvNodeId);
    this.rendezvousDone();
  }

}
