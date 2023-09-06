import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TopTenPageRoutingModule } from './top-ten-routing.module';

import { TopTenPage } from './top-ten.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TopTenPageRoutingModule
  ],
  declarations: [TopTenPage]
})
export class TopTenPageModule {}
