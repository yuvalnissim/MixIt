import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { CategoriesPage } from './categories.page';
import { IonicModule } from '@ionic/angular'; // Import IonicModule

const routes: Routes = [
  {
    path: '',
    component: CategoriesPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    IonicModule, // Add IonicModule to the imports array
    RouterModule.forChild(routes)
  ],
  declarations: [CategoriesPage]
})
export class CategoriesPageModule { }
