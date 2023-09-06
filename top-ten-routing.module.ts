import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TopTenPage } from './top-ten.page';

const routes: Routes = [
  {
    path: '',
    component: TopTenPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TopTenPageRoutingModule {}
