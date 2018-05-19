import {Node} from './node';
import { angularMath } from 'angular-ts-math';
export class Agent {
    public Label: string ;
    public CurrentNode: Node;
    public Shift = 0;
    public agent2Shit = 0;
    constructor(label: string) {
        this.Label = label;
    }
    getTransformedLabel(): Array<string> {
        let binaryString = angularMath.numberToBinary(Number(this.Label));
        let result = [];
        const table  = binaryString.split('');
        binaryString = table.map(function(elem){
            return elem.repeat(2);
        }).join('');
        binaryString = '10' + binaryString + '10';
        result = binaryString.split('');
        console.log(result);
       return result;
    }
    getTransformedLabelWithShift(): Array<string> {
        let binaryString = angularMath.numberToBinary(Number(this.Label));
        let result = [];
        const table  = binaryString.split('');
        binaryString = table.map(function(elem){
            return elem.repeat(2);
        }).join('');
        binaryString = '10' + binaryString + '10';
        result = binaryString.split('');
        const shift = [];
        for ( let i = 0; i < this.Shift; ++ i ) {
            shift.push('*');
        }
        result = shift.concat(result);
        console.log(result);
        return result;
    }
}
