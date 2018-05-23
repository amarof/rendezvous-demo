var roundTimer;
var subscription;
var agent;
var graph;
var _maxNeighbours = 3;
var _distance = 1;
var transformedLabel = [];
var roundCounter  = 0;
var visitedNodeCount = 0;
var rendezVousHappen = false;
var nodeVisitTime = 1;
var shift = 0;
var consoleCounter = 1;
onmessage = function(e) {
    if (e.data.action === 'exec'){
        executeRoundBit();
    }else if (e.data.action == 'init') {
        init(e.data.params);
    }else if (e.data.action == '*'){
        var params = {
            bit : '*'
        }
        postMessage(params);
    }
    
}
function init(params){
    this.nodeVisitTime = params.nodeVisitTime;
    this.agent = params.agent;
    this._distance = params.distance;
    this._maxNeighbours = params.maxNeighbours;
    this.graph = params.graph;
    this.shift = params.shift;    
    this.transformedLabel = this.getTransformedLabel(this.agent.Label);
    this.visitedNodeCount = 2 * this._distance * this._maxNeighbours *
     (Math.pow( this._maxNeighbours - 1, this._distance - 1));
     this.roundTime = this.visitedNodeCount * this.nodeVisitTime * 2;
     this.consoleCounter = 1;
     writeToConsole('Temps (T) de parcours de la boule :' +  this.visitedNodeCount + '.');
     writeToConsole('Résultat de l\'exécution de la procédure Transformer étiquette l:' +  this.transformedLabel + '.');
     writeToConsole('Début de l\'exécution de l\'algorithme.');
     console.log('T =' + this.visitedNodeCount);
     console.log('Round Time:' + this.roundTime);
     console.log('Agent label :' + this.agent.Label + ' transformed to: ' + this.transformedLabel);
     console.log(agent.Label + 'EXECUTION INITIALIZED'); 

}

function executeRoundBit(){
    var bit = this.transformedLabel[this.roundCounter];
    console.log(this.agent.Label + ' : Execution BIT:' +  bit  + ' at Position: ' + this.roundCounter);
    writeToConsole('Début de l\'exécution du bit ' + bit + ' à la position ' + this.roundCounter + ' de l\'étiquette transformée.');
    if (bit === '1') {
       this.executeBitOne();       
    }else if(bit === '0'){
        writeToConsole('Rester immobile pour un temps de 2T:'+ this.roundTime +'.');
        this.wait(this.roundTime);
    }else{
        console.log(this.agent.Label + ' : en attente....');
    }    
    
    if ((this.roundCounter + 1) < this.transformedLabel.length) {
        this.roundCounter++;
    }
    var params = {
        bit : bit
    }
    writeToConsole('Fin de l\'exécution du bit ' + bit + ' à la position ' + this.roundCounter + ' de l\'étiquette transformée.');
    postMessage(params);
}
function executeBitOne(){
    // console.log(this.agent.Label + ' :Start excution of bit 1');
    writeToConsole('Début de l\'exécution de la procédure Exécution du bit 1.');
    var realVisitedNodeCount = this.runThroughBall();
    writeToConsole('Temps (alpha) de l\'exécution de la procédure Parcourir Boule(D):'+ realVisitedNodeCount +'.');
    if (this.rendezVousHappen) {
        return;
    }
    var timeToWait = ( 2 * this.visitedNodeCount * this.nodeVisitTime) - ( 2 * realVisitedNodeCount * nodeVisitTime);
    writeToConsole('Rester Immobile pendant le temps (2T-2 alpha):' + timeToWait);
    this.wait(timeToWait);
    this.runThroughBall();
    writeToConsole('Fin de l\'exécution de la procédure Exécution du bit 1.');
}
function runThroughBall(){
    // console.log(this.agent.Label + ' :Start excution of Parcourir_Boule:');
    writeToConsole('Début de l\'exécution de la procédure Parcourir Boule(D).');
    writeToConsole('Début de la Génération de toutes les suites des ports de longueur D.(ordre lexicographique)');
    var nodeCount = 0;
    var pathCount = Math.pow( this._maxNeighbours, this._distance );
    var list = [];
    // initialize path
    for (var i = 0; i < this._distance; i++)
    {
        list.push(0);
    }
    for (var index = 0; index < pathCount; index++) {
        var c = list.join(',');
        writeToConsole('Début de parcours du chemin:' + c + ' en revenant par le chemin rebours' );
        this.goAndBackThroughPath(list);
        writeToConsole('Fin de parcours du chemin:' + c + ' en revenant par le chemin rebours' );
        list = this.getPath(list);
        if (this.rendezVousHappen) {
            break;
        }
    }
    // console.log(this.agent.Label + 'Excution of Parcourir_Boule Ends');
    writeToConsole('Fin de l\'exécution de la procédure Parcourir Boule(D).');
    return nodeCount;
}
function goAndBackThroughPath(list) {
    // console.log(this.agent.Label + 'Start go forward path:' + list.join('=>'));
    var inversePath = [];
    for (var portIndex = 0; portIndex < list.length; portIndex++) {
        var portId = list[portIndex];
        inversePath.push(Number(this.agent.CurrentNode.Id));
        const nodeId = getNeighbourIdAtPort(portId);
        // the node has a portId and it's a port to a node that was never visited
        if (nodeId !== undefined && inversePath.indexOf(nodeId) < 0) {
            this.agent.CurrentNode = getNodeById(nodeId);
            // console.log('forward agent' + this.agent.Label + ' current node:' + this.agent.CurrentNode.Id);
            moveToNode(nodeId);
        } else {
            break;
        }
        if (this.rendezVousHappen) {
            return;
        }
    }
    if (this.rendezVousHappen) {
        return;
    }    
    inversePath = inversePath.reverse();
    var r = inversePath.join(',');    
    // console.log(this.agent.Label + 'Start go backward path:' + inversePath.join('=>'));
    // go back through Path
    for (var index = 0; index < inversePath.length; index++) {
        var nId = String(inversePath[index]);
        this.agent.CurrentNode = getNodeById(nId);
        // console.log('backward agent' + this.agent.Label + ' current node:' + this.agent.CurrentNode.Id);
        moveToNode(nId); 
    }    
}
function getPath(list){
    for (var index = list.length - 1; index >= 0; index--) {
        if ( list[index] < this._maxNeighbours) {
            list[index]++;
            for (var k = index + 1; k < list.length; k++) {
                list[k] = 0;
            }
            break;
        }
    }
    return list;
}
function getTransformedLabel(label){
    var binaryString = numberToBinary(label);
    var result = [];
    var table  = binaryString.split('');
    binaryString = table.map(function(elem){
        return elem.repeat(2);
    }).join('');
    binaryString = '10' + binaryString + '10';
    result = binaryString.split('');        
    const shift = [];
    for ( let i = 0; i < this.shift; i++ ) {
        shift.push('*');
    }
    result = shift.concat(result);        
    return result;
}
function numberToBinary(number){
    number = parseInt(number.toString(), 10);
    return number.toString(2);
}
function getNeighbourIdAtPort(portId) {
    var nodeId;
    if (portId < this.agent.CurrentNode.Neighbours.length) {
        var node = this.agent.CurrentNode.Neighbours[portId];
        nodeId = node.Id;
    }
    return nodeId;
}
function moveToNode(nodeId){
    var params = {
        moveToNode : nodeId
    }
    postMessage(params);
    wait(this.nodeVisitTime);
    
}
function getNodeById(nodeId) {    
    var node = graph.Nodes.find(n => n.Id == nodeId);
    if (node === null  ||  node === undefined) {
        throw new Error('graph with id ' + nodeId + ' not found.');
    }
    return node;
}
function wait(ms){
    var start = new Date().getTime();
    var end = start;
    while(end < start + ms) {
      end = new Date().getTime();
   }
 }
 function writeToConsole(message){
    var params = {
        messageToConsole : this.consoleCounter +':' + message + "\n\r"
    }
    this.consoleCounter++;
    postMessage(params);
 }