import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NetworkGraphComponent } from '../../network-graph/network-graph.component';

const routes: Routes = [
  {
    path: '',
    data: {
      title: 'Algorithmes'
    },
    children: [
      {
        path: 'deltamax',
        component: NetworkGraphComponent,
        data: {
          title: 'Delta Max'
        }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AlgoRoutingModule {}
