var roundTimer;
var subscription;
var agent;
var graph;
var _distance = 1;
var transformedLabel = [];
var roundCounter  = 0;
var visitedNodeCount = 0;
var rendezVousHappen = false;
var nodeVisitTime = 1000;
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
    this.visitedNodeCount = 4 * Math.pow(this._distance,2) + 4 * this._distance;
     this.roundTime = this.visitedNodeCount * this.nodeVisitTime * 2;
     this.consoleCounter = 1;
     writeToConsole('Temps (T) de parcours de la spirale :' +  this.visitedNodeCount + '.');
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
    this.runThroughSpiral();
    if (this.rendezVousHappen) {
        return;
    }
    this.runThroughSpiral();
    writeToConsole('Fin de l\'exécution de la procédure Exécution du bit 1.');
}
function runThroughSpiral(){
    writeToConsole('Début de l\'exécution de la procédure Parcourir Spirale(D).');
    writeToConsole('Début de la Génération du chemin de la spirale');
    var step = 1;
    var max  = 2 * this._distance;
    var path = '';
    for(var i = 1; step < max ; i++)
    {
        path += 'E'.repeat(step) + 'N'.repeat(step) + 'W'.repeat(step+1) + 'S'.repeat(step+1);
      step += 2;
    }
    path += 'E'.repeat(this._distance);
    path += 'N'.repeat(this._distance);
    var list = path.split('');
    this.goAndBackThroughPath(list);
    writeToConsole('Fin de l\'exécution de la procédure Parcourir Spirale(D).');
}
function goAndBackThroughPath(list) {

    for (let i = 0; i < list.length; i++) {
        var currentPoint = this.agent.CurrentPoint;
        var direction  = list[i];
        if (direction === 'E') {
            this.agent.CurrentPoint  = currentPoint.East;
        }else  if (direction === 'N') {
            this.agent.CurrentPoint  = currentPoint.North;
        }else  if (direction === 'W') {
            this.agent.CurrentPoint  = currentPoint.West;
        }else  if (direction === 'S') {
            this.agent.CurrentPoint  = currentPoint.South;
        }
        moveToNode(this.agent.CurrentPoint.Id);
        if (this.rendezVousHappen) {
            return;
        }
    }
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
function moveToNode(nodeId){
    var params = {
        moveToNode : nodeId
    }
    postMessage(params);
    wait(this.nodeVisitTime);
    
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