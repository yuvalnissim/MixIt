import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.page.html',
  styleUrls: ['./categories.page.scss'],
})
export class CategoriesPage {

  constructor(private navCtrl: NavController, private router: Router, private route: ActivatedRoute) {}

  navigateToGamePage(category: string) {
   this.router.navigate(['/game', { category: category }]);
    
  }
}
