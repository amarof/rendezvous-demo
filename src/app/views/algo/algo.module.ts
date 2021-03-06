// Angular
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TabsModule } from 'ngx-bootstrap/tabs';
// Theme Routing
import { AlgoRoutingModule } from './algo-routing.module';
import { NetworkGraphComponent } from '../../network-graph/network-graph.component';

@NgModule({
  imports: [
    CommonModule,
    AlgoRoutingModule,
    TabsModule,
    FormsModule
  ],
  declarations: [
    NetworkGraphComponent
  ]
})
export class AlgoModule { }
