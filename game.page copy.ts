import { Component, OnDestroy } from '@angular/core';
import { Platform } from '@ionic/angular';
import { NavController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { delay } from 'rxjs';



        

 


const imagesFolder = 'assets/Animals Pictures Mix/';
const imageFileNames = [
'chicken + horse.png', 'alligator + frog.png', 
'ant + turtle.png', 'alligator + lion.png', 'alligator + mouse.png', 
 'Bear + wasp.png', 'bear + seal.png', 'Bear + wasp.png', 'bird + chameleon.png'
];
const animalsAloneFolder = 'assets/animals-alone/';
const animalAloneFileNames = [
  'ant.jpeg',  'bat.jpeg',  'bear.jpeg',  'bee.jpeg',  'bird.jpeg',  'butterfly.jpeg',  'cat.jpeg',
  'chameleon.jpeg',  'eagle.jpeg',  'frog.jpeg',  'horse.jpeg',  'hyena.jpeg',  'kangaroo.jpeg',
  'koala.jpeg',  'lion.jpeg',  'mantis.jpeg',  'mouse.jpeg',  'octopus.jpeg',  'owl.jpeg',  'rabbit.jpeg',
  'racoon.jpeg',  'rhinoceros.jpeg',  'sheep.jpeg',  'snail.jpeg',  'snake.jpeg',  'spider.jpeg',  'tiger.jpeg',
  'turtle.jpeg',  'wasp.jpeg',  'wolf.jpeg',  'zebra.jpeg'];

@Component({
  selector: 'app-game',
  templateUrl: 'game.page.html',
  styleUrls: ['game.page.scss'],
})
export class GamePage implements OnDestroy {
  currentImage: string = '';
  firstAnimal: string = '';
  secondAnimal: string = '';
  score: number = 0;
  timer: any;
  remainingTime: number = 5;
  countdownInterval: any;
  gameFinished: boolean = false;
  finalScore: number = 0;
  playerName: string = '';
  namePrompted: boolean = false;
  animalImages: string[] = [];
  selectedAnimals: string[] = [];
  scorePrompted: boolean = false;
  lives: number = 5;

  mixedAnimals: any[] = [];
  private apiUrl = 'http://your_backend_server_ip_or_domain:3000/api/imageUrls'; // Replace with your backend API URL




  constructor(
    private platform: Platform,
    private navCtrl: NavController,
    private http: HttpClient
  ) {
    this.platform.ready().then(() => {
      this.startGame();
    });
  }

  ngOnDestroy() {
    clearInterval(this.countdownInterval);
  }

  startGame() {
    // Reset all the values to their original state
    this.currentImage = '';
    this.firstAnimal = '';
    this.secondAnimal = '';
    this.score = 0;
    this.timer = null;
    this.remainingTime = 5;
    this.countdownInterval = null;
    this.gameFinished = false;
    this.finalScore = 0;
    this.playerName = '';
    this.namePrompted = false;
    this.animalImages = [];
    this.selectedAnimals = [];
    this.scorePrompted = false;
    this.lives = 5;
  
 



    // Reset the imageFileNames array to its original state
    imageFileNames.push(
      'chicken + horse.png',   'alligator + frog.png',      'ant + turtle.png',      'alligator + lion.png',
      'alligator + mouse.png',  'Bear + wasp.png',      'bear + seal.png',      'Bear + wasp.png',      'bird + chameleon.png',
    );
  
    this.displayRandomImage();
    this.displayRandomAnimals();
  
    this.namePrompted = false; // Reset the name prompted flag
  }
  

  displayRandomAnimals() {
    this.animalImages = [];
  
    // Add the correct animal images
    const imageName = this.extractImageName(this.currentImage);
    let [animal1, animal2] = imageName.split(/[+.]/).map((animal) => animal.trim().toLowerCase());
    
  
    // Add random additional animal images
    const remainingAnimals = [...animalAloneFileNames];
    
    remainingAnimals.splice(remainingAnimals.indexOf(animal1 + '.jpeg'), 1);
    remainingAnimals.splice(remainingAnimals.indexOf(animal2 + '.jpeg'), 1);
    this.animalImages.push(this.getAnimalImagePath(animal1 + '.jpeg'));
    this.animalImages.push(this.getAnimalImagePath(animal2 + '.jpeg'));
    
    for (let i = 0; i < 4; i++) {
      const randomIndex = Math.floor(Math.random() * remainingAnimals.length);
      const randomAnimal = remainingAnimals[randomIndex];
      remainingAnimals.splice(randomIndex, 1);
      this.animalImages.push(this.getAnimalImagePath(randomAnimal));
    }
    this.shuffleArray(this.animalImages);
  }

  displayRandomImage() {
    if (imageFileNames.length > 0) {
      const randomIndex = Math.floor(Math.random() * imageFileNames.length);
      this.currentImage = imagesFolder + imageFileNames[randomIndex];
      imageFileNames.splice(randomIndex, 1);

      // Clear the previous timer and countdown interval, if any
      clearTimeout(this.timer);
      clearInterval(this.countdownInterval);

      // Start a new timer for 5 seconds
      this.timer = setTimeout(() => {
        this.displayRandomImage();
        this.generateAnimalImages();
        this.displayRandomAnimals();
      }, 7000);

      // Start the countdown
      this.remainingTime = 7;
      this.countdownInterval = setInterval(() => {
        this.remainingTime--;
        if (this.remainingTime === 0) {
          clearInterval(this.countdownInterval);
          this.finishGame();
        }
      }, 1000);
      // Generate the animal images for guessing
      this.generateAnimalImages();

    } else {
      this.finishGame();
      this.currentImage = '';
    }
  }
  
  generateAnimalImages() {
    const imageName = this.extractImageName(this.currentImage);
    const [animal1, animal2] = imageName.split(/[+.]/).map((animal) => animal.trim().toLowerCase());

    // Add the correct animal images
    this.animalImages = [this.getAnimalImagePath(animal1), this.getAnimalImagePath(animal2)];
  
    // Add random additional animal images
    while (this.animalImages.length < 6) {
      const randomIndex = Math.floor(Math.random() * animalAloneFileNames.length);
      const randomAnimal = this.getAnimalImagePath(animalAloneFileNames[randomIndex]);
      if (!this.animalImages.includes(randomAnimal)) {
        this.animalImages.push(randomAnimal);
      }
    }

    // Shuffle the array of animal images
    this.shuffleArray(this.animalImages);
  }

  submit() {
    const imageName = this.extractImageName(this.currentImage);
    const [animal1, animal2] = imageName.split(/[+.]/).map((animal) => animal.trim().toLowerCase());

    const guessedAnimalImages = this.selectedAnimals.map((animal) => this.extractImageName(animal));
    let guessedAnimal1 = this.extractImageName(guessedAnimalImages[0]).toLowerCase();
    let guessedAnimal2 = this.extractImageName(guessedAnimalImages[1]).toLowerCase();
    
    
    if ((animal1 + '.jpeg' === guessedAnimal1 && animal2 + '.jpeg' === guessedAnimal2) || (animal1 + '.jpeg' === guessedAnimal2 && animal2 + '.jpeg' === guessedAnimal1)) {
      // Both animals were correctly guessed
      this.score += 30;
    } else if (animal1 + '.jpeg' === guessedAnimal1 || animal1 + '.jpeg' === guessedAnimal2 || animal2 + '.jpeg' === guessedAnimal1 || animal2 + '.jpeg' === guessedAnimal2) {
      // Only one animal was correctly guessed
      this.score += 10;
      //enable for lives deduction
      this.lives--;
    }

    //enalbe to reduce 2 lives for 2 faulty guesses
    else{
      this.lives -= 2; 
    }


    // Reset the selected animals
    this.selectedAnimals = [];

    // Move to the next picture
    this.displayRandomImage();
    this.displayRandomAnimals();
  }

  nextPicture() {
    // Move to the next picture
    this.displayRandomImage();
    this.displayRandomAnimals();

  }

  

  finishGame() {
    this.gameFinished = true;
    this.finalScore = this.score;
    if (!this.scorePrompted) {
      this.promptForScore();
    }
  }

  private promptForScore() {
    alert(`Your score: ${this.finalScore}`);
    if (!this.scorePrompted) {
      this.promptForName();
    }
    this.scorePrompted = true;
  }


  private extractImageName(imagePath: string): string {
    // Extract the file name from the image path
    const parts = imagePath.split('/');
    return parts[parts.length - 1];
  }

  private getAnimalImagePath(animalFileName: string): string {
    return animalsAloneFolder + animalFileName;
  }

  private shuffleArray(array: any[]) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  selectAnimal(animalImage: string) {
    if (this.selectedAnimals.length < 2) {
      this.selectedAnimals.push(animalImage);
    }
    if (this.selectedAnimals.length === 2) {
      setTimeout(() => {
        this.submit(); // Automatically submit after one second
      }, 700);
      //this.submit(); // Automatically submit when two pictures are selected
    }
  }
  isSelected(animalImage: string): boolean {
    return this.selectedAnimals.includes(animalImage);
  }
  
  private promptForName() {
    const playerName = prompt('Enter your name:');
    if (!playerName) {
      return;
    }

    this.playerName = playerName;
    this.sendScore();
  }

  seeTopTen() {
    this.navCtrl.navigateForward('/top-ten');
  }


  private sendScore() {
    // Prepare the data to be sent
    const data = { name: this.playerName, score: this.finalScore };

    // Send a POST request to your API endpoint
    //this.http.post('http://gamedb.cbgja1mg2wpp.us-east-1.rds.amazonaws.com/score_table', data).subscribe(
    this.http.post('http://localhost:3333/score_table', data).subscribe(
      () => {
        // Handle the successful response
        console.log('Score saved successfully');
        // this.navCtrl.navigateBack('/home');
        this.navCtrl.navigateBack('/top-ten');
      },
      (error) => {
        // Handle errors
        console.error('Failed to save score:', error);
        const errorMessage = error.error?.error || 'Failed to save score. Please try again.';
        alert('Failed to save score. Please try again: ' + errorMessage);
      }
    );
  }

  
}