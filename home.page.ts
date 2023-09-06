import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss']
})
export class HomePage {
  // public alertButtons = ['OK'];

  constructor(private router: Router) {}

  startGame() {
    this.router.navigate(['/categories']); // Updated navigation to the categories page
  }

}
