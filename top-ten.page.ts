import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

const BASE_URL = 'http://3.89.129.239:3306';

@Component({
  selector: 'app-top-ten',
  templateUrl: 'top-ten.page.html',
  styleUrls: ['top-ten.page.scss'],
})
export class TopTenPage {
  players: { name: string; score: number }[] = [];

  constructor(
    private navCtrl: NavController,
    private route: ActivatedRoute,
    private http: HttpClient
  ) {
    this.route.queryParams.subscribe((params) => {
      const previousPage = params['previousPage'];
      if (previousPage === 'GamePage' && params['score']) {
        const score = Number(params['score']);
        const playerName = 'Player'; // Replace with actual player name input

        this.saveScore(playerName, score);
      }
    });

    this.getTopTenScores();
  }

  saveScore(playerName: string, score: number) {
    const data = { name: playerName, score: score };

    this.http.post(`${BASE_URL}/score_table`, data).subscribe(
      (response) => {
        console.log('Score saved successfully:', response);
      },
      (error) => {
        console.error('Failed to save score:', error);
        alert('Failed to save score. Please try again.');
      }
    );
  }

  getTopTenScores() {
    this.http.get<any[]>(`${BASE_URL}/`).subscribe(
      (response) => {
        this.players = response.sort((a, b) => b.score - a.score).slice(0, 10);
      },
      (error) => {
        console.error('Failed to retrieve top scores:', error);
        // Handle error case
      }
    );
  }

  startNewGame() {
    this.navCtrl.navigateBack('/home');
  }
}
