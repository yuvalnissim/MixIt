import { Component, OnDestroy } from '@angular/core';
import { Platform } from '@ionic/angular';
import { NavController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { forkJoin, of, Observable} from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { map, delay } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router'; // Correct import statement
import { AlertController } from '@ionic/angular';

//const BASE_URL = 'http://gamedb.cbgja1mg2wpp.us-east-1.rds.amazonaws.com:3306'; // Change to HTTPS if needed
//const BASE_URL = 'http://localhost:3306'; 

const BASE_URL = 'http://3.89.129.239:3306'; 





interface AnimalData {
  FirstAnimal: string;
  SecondAnimal: string;
  ImageURL: string;
  FirstAnimalURL: string; // Add this property for the specific animal URL
  SecondAnimalURL: string; // Add this property for the specific animal URL
}


@Component({
  selector: 'app-game',
  templateUrl: 'game.page.html',
  styleUrls: ['game.page.scss'],
})
export class GamePage implements OnDestroy {
  imageUrls: AnimalData[] = [];
  currentIndex: number = 0;
  displayDuration: number = 10000; // 7 seconds
  finalScore: number = 0;
  playerName: string = '';
  timer: any;
  remainingTime: number = 10; // 7 seconds
  countdownInterval: any;
  randomObjectUrls: string[] = [];
  selectedObjectImages: HTMLImageElement[] = [];
  userPicks: string[] = [];
  score: number = 0;
  userHasSelected: boolean = false;
  canPickPictures: boolean = true;
  gameFinished: boolean = false;
  scorePrompted: boolean = false;
  lives : number = 10;
  category: string = '';
  userPicksArray: string[] = [];
  

  

  

  constructor(
    private platform: Platform,
    private navCtrl: NavController,
    private http: HttpClient,
    private route: ActivatedRoute, // Inject ActivatedRoute
    private alertController: AlertController
  ) {
    this.platform.ready().then(() => {
      this.startGame();
    });
  }
  ngOnInit() {
    this.route.paramMap.subscribe((params: any) => { // Specify the type of 'params'
      this.category = params.get('category');
      console.log('Selected category:', this.category);
    });
  }

  ngOnDestroy() {
    clearInterval(this.countdownInterval);
  }


  // Updated fetchRandomAnimals() function
  fetchRandomObjects() {
    // Create a comma-separated string of random animal names to exclude from the query
    const excludeObjects = this.randomObjectUrls.join(',');
  
    // Check if excludeAnimals is empty, and if so, set it to an empty string
    const encodedExcludeAnimals = excludeObjects ? encodeURIComponent(excludeObjects) : '';
  
    // Fetch random animal image URLs from the server and pass the excludeAnimals parameter

    //this.http.get<string[]>(`gamedb.cbgja1mg2wpp.us-east-1.rds.amazonaws.com:3306/randomAnimals?excludeAnimals=${encodedExcludeAnimals}&category=${encodeURIComponent(this.category)}`).subscribe(
    this.http.get<string[]>(`${BASE_URL}/randomAnimals?excludeAnimals=${encodedExcludeAnimals}&category=${encodeURIComponent(this.category)}`).subscribe(
      (imageUrls: string[]) => {
        // Ensure we have at least 4 new random animal URLs
        const additionalRandomURLs = this.getRandomUniqueElements(imageUrls, 4 - this.randomObjectUrls.length);
        this.randomObjectUrls.push(...additionalRandomURLs);
  
        // Shuffle the array before displaying the images
        this.randomObjectUrls = this.shuffleArray(this.randomObjectUrls);
        console.log("check1")
        // Check if we have enough URLs to display
        if (this.randomObjectUrls.length === 6) {
          this.displayRandomAnimals();
        }
      },
      (error) => {
        console.error('Failed to fetch random animal images:', error);
        alert('Failed to fetch random animal images. Please try again.');
      }
    );
  }
  


  startGame() {
    this.finalScore = 0;
    this.playerName = '';
    this.timer = null;
    this.remainingTime = 5;
    this.countdownInterval = null;
    this.fetchRandomObjects(); // Make sure this line is correct
    this.gameFinished = false;
    this.scorePrompted = false;


  
    // Fetch mixed animal image URLs from the server

    //const mixedAnimalURLs$ = this.http.get<AnimalData[]>(`gamedb.cbgja1mg2wpp.us-east-1.rds.amazonaws.com:3306/mixedAnimal?category=${encodeURIComponent(this.category)}`);
    const mixedAnimalURLs$ = this.http.get<AnimalData[]>(`${BASE_URL}/mixedAnimal?category=${encodeURIComponent(this.category)}`);
    console.log("mixedAnimalURLs :" + mixedAnimalURLs$)
    // Fetch random animal image URLs from the server
    
    //const randomAnimalURLs$ = this.http.get<string[]>(`gamedb.cbgja1mg2wpp.us-east-1.rds.amazonaws.com:3306/randomAnimals?category=${encodeURIComponent(this.category)}`);
    const randomAnimalURLs$ = this.http.get<string[]>(`${BASE_URL}/randomAnimals?category=${encodeURIComponent(this.category)}`);
    console.log("randomAnimalURLs :" + randomAnimalURLs$)
    
    // Use forkJoin to make parallel API calls
    forkJoin([mixedAnimalURLs$, randomAnimalURLs$]).subscribe(
      ([mixedAnimalURLs, randomAnimalURLs]: [AnimalData[], string[]]) => {
        this.imageUrls = mixedAnimalURLs;
        this.randomObjectUrls = randomAnimalURLs;

        this.updateRandomAnimals().subscribe(() => {
          // Start displaying images
          this.displayRandomAnimals();
        });
      },
      (error) => {
        console.error('Failed to fetch data:', error);
        alert('Failed to fetch data. Please try again.');
      }
    );
  }
  
  


  // Updated displayRandomAnimals() function
  displayRandomAnimals() {
    this.userPicksArray.length = 0;
    console.log("displayRandomAnimals")
    clearTimeout(this.timer);
    clearInterval(this.countdownInterval);

    this.resetUI(); // Reset the UI before displaying new specific animal images
  
    // Check if currentIndex is within bounds
    if (this.currentIndex < this.imageUrls.length) {
      console.log("in loop of displayRandomAnimals")
      const imageUrl = this.imageUrls[this.currentIndex].ImageURL;
      this.displayRandomImage(imageUrl);
  
      // Display the specific animal images for the current mixedAnimal picture
      const specificAnimalURLs = [
        this.imageUrls[this.currentIndex].FirstAnimalURL,
        this.imageUrls[this.currentIndex].SecondAnimalURL
      ];
  
      if (this.randomObjectUrls.length < 6) {
        // Fetch 4 random animal image URLs to ensure we have enough for the next picture
        this.fetchRandomObjects();
      } else {
        // Shuffle the array before displaying the images
        this.randomObjectUrls = this.shuffleArray(this.randomObjectUrls);
  
        // Display the images using the shuffled URLs
        for (let i = 0; i < this.randomObjectUrls.length; i++) {
          const animalImageElement = document.getElementById(`randomAnimalImage${i}`) as HTMLImageElement;
          if (animalImageElement) {
            animalImageElement.src = this.randomObjectUrls[i];
          }
        }
  
        this.displaySpecificAnimals(specificAnimalURLs, imageUrl); // Display specific animal images
  
        // Start the countdown
  this.remainingTime = 10;
  this.countdownInterval = setInterval(() => {
    this.remainingTime--;
    if (this.remainingTime === 0) {
      clearInterval(this.countdownInterval);
      this.currentIndex++; // Move to the next image

      // Check if the user made a correct pick
      const firstAnimal = this.imageUrls[this.currentIndex].FirstAnimal.toLowerCase();
      const secondAnimal = this.imageUrls[this.currentIndex].SecondAnimal.toLowerCase();
      const pickedAnimal1 = this.userPicks[0]?.toLowerCase();
      const pickedAnimal2 = this.userPicks[1]?.toLowerCase();


      if (pickedAnimal1 === firstAnimal || pickedAnimal1 === secondAnimal) {
        this.score += 10;
      }

      if (pickedAnimal2 === firstAnimal || pickedAnimal2 === secondAnimal) {
        this.score += 10;
      }

      // Update the score display
      this.updateScoreDisplay();

      // Clear the userPicks array for the next iteration
      this.userPicks = [];

      // Call updateRandomAnimals() to update the mixed picture and random animal pictures
      this.updateRandomAnimals().subscribe(() => {
        this.displayRandomAnimals(); // Call recursively with the updated images
      });
    }
  }, 1000);
}
    } else {
    
      // All images have been displayed
      this.finishGame();
    }
  }
  
  updateScoreDisplay() {
    const scoreElement = document.getElementById('score') as HTMLElement;
    if (scoreElement) {
      scoreElement.textContent = `Score: ${this.score}`;
    }
  }



  
  updateRandomAnimals(): Observable<any> {
    const imageUrl = this.imageUrls[this.currentIndex].ImageURL;
    console.log('imageUrl:', imageUrl);
    console.log('imageUrls:', this.imageUrls[this.currentIndex]);
    
    
    const firstAnimal = this.imageUrls[this.currentIndex].FirstAnimal;

    
    const secondAnimal = this.imageUrls[this.currentIndex].SecondAnimal;
  
    console.log('Updating random' , this.category ,":");
    console.log('First Animal:', firstAnimal);
    console.log('Second Animal:', secondAnimal);
  
    // Fetch specific animal image URLs for FirstAnimal and SecondAnimal separately


    //const specificAnimalFirst$ = this.http.get<string[]>(`gamedb.cbgja1mg2wpp.us-east-1.rds.amazonaws.com:3306/specificAnimals?category=${encodeURIComponent(this.category)}&firstAnimal=${encodeURIComponent(firstAnimal)}`);
    const specificAnimalFirst$ = this.http.get<string[]>(`${BASE_URL}/specificAnimals?category=${encodeURIComponent(this.category)}&firstAnimal=${encodeURIComponent(firstAnimal)}`);


    //const specificAnimalSecond$ = this.http.get<string[]>(`gamedb.cbgja1mg2wpp.us-east-1.rds.amazonaws.com:3306/specificAnimals?category=${encodeURIComponent(this.category)}&secondAnimal=${encodeURIComponent(secondAnimal)}`);
    const specificAnimalSecond$ = this.http.get<string[]>(`${BASE_URL}/specificAnimals?category=${encodeURIComponent(this.category)}&secondAnimal=${encodeURIComponent(secondAnimal)}`);
  
    // Fetch random animal image URLs excluding FirstAnimal and SecondAnimal
    const excludeAnimals = `${firstAnimal},${secondAnimal}`;
    
    //const randomAnimalURLs$ = this.http.get<string[]>(`gamedb.cbgja1mg2wpp.us-east-1.rds.amazonaws.com:3306/randomAnimals?category=${encodeURIComponent(this.category)}&excludeAnimals=${encodeURIComponent(excludeAnimals)}`);
    const randomAnimalURLs$ = this.http.get<string[]>(`${BASE_URL}/randomAnimals?category=${encodeURIComponent(this.category)}&excludeAnimals=${encodeURIComponent(excludeAnimals)}`);
  
    // Log the SQL query for the specific animal FirstAnimal
    specificAnimalFirst$.subscribe((specificAnimalFirstUrls) => {
      //console.log('SQL Query for First Animal:', specificAnimalFirstUrls);
    });
  
    // Log the SQL query for the specific animal SecondAnimal
    specificAnimalSecond$.subscribe((specificAnimalSecondUrls) => {
      //console.log('SQL Query for Second Animal:', specificAnimalSecondUrls);
    });

    
  
    return forkJoin([specificAnimalFirst$, specificAnimalSecond$, randomAnimalURLs$]).pipe(
      switchMap(([specificAnimalFirst, specificAnimalSecond, randomAnimalURLs]: [string[], string[], string[]]) => {
        //console.log('Specific Animal URLs for First Animal:', specificAnimalFirst);
        //console.log('Specific Animal URLs for Second Animal:', specificAnimalSecond);
        //console.log('Random Animal URLs:', randomAnimalURLs);
  
        // Shuffle the arrays to get random elements
        specificAnimalFirst = this.shuffleArray(specificAnimalFirst);
        specificAnimalSecond = this.shuffleArray(specificAnimalSecond);
        randomAnimalURLs = this.shuffleArray(randomAnimalURLs);
  
        // Ensure we have exactly 2 specific animal URLs for each FirstAnimal and SecondAnimal
        const selectedSpecificURLs = [...specificAnimalFirst.slice(0, 2), ...specificAnimalSecond.slice(0, 2)];
  
        // Include the specific animal URLs in the random animal URLs array
        const selectedRandomURLs = [...selectedSpecificURLs, ...this.getRandomUniqueElements(randomAnimalURLs, 4)];
        const allAnimalURLs = [...selectedSpecificURLs, ...selectedRandomURLs];
        this.displaySpecificAnimals(allAnimalURLs, imageUrl);
  
        // Update the randomAnimalUrls array with the new URLs
        this.randomObjectUrls = selectedRandomURLs;
  
        // Return an observable that resolves when the data is updated
        return of(null);
      })
    );
  }
  
  

  getRandomUniqueElements(array: any[], count: number): any[] {
    // Function to get 'count' random unique elements from the array
    if (array.length <= count) {
      return array;
    }
  
    const result: any[] = [];
    const indices: Set<number> = new Set();
  
    while (indices.size < count) {
      const index = Math.floor(Math.random() * array.length);
      if (!indices.has(index)) {
        indices.add(index);
        result.push(array[index]);
      }
    }
  
    return result;
  }
  

  shuffleArray(array: any[]): any[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
  
  
  
  
  displaySpecificAnimals(specificAnimalURLs: string[], mixedAnimalImageUrl: string) {

    //console.log('Displaying specific', this.category ,'...');
    //console.log('Mixed Animal URL:', mixedAnimalImageUrl);
    //console.log('Specific Animal URLs:', specificAnimalURLs);
    // Display the mixedAnimal image
    this.displayRandomImage(mixedAnimalImageUrl);
  
    // Display the specific animal images below the mixedAnimal image
    const specificAnimalImageElements = document.getElementsByClassName('specific-animal-image');
  
    const specificAnimalImageArray = Array.from(specificAnimalImageElements) as HTMLImageElement[];
    for (let i = 0; i < specificAnimalImageArray.length; i++) {
      if (i < 2 && specificAnimalURLs[i]) {
        specificAnimalImageArray[i].src = specificAnimalURLs[i];
      } else {
        specificAnimalImageArray[i].src = this.randomObjectUrls[i - 2]; // Set the remaining images to random animals
      }
    }  
}
  


getAnimalNameFromUrl(imageUrl: string): Observable<string> {
  // Send a request to the server endpoint to get the animal name based on the image URL

  //return this.http.get<{ animalName: string }>(`gamedb.cbgja1mg2wpp.us-east-1.rds.amazonaws.com:3306/animalName?category=${encodeURIComponent(this.category)}`, {
  return this.http.get<{ animalName: string }>(`${BASE_URL}/animalName?category=${encodeURIComponent(this.category)}`, {
    params: { imageUrl: imageUrl }
  }).pipe(
    map((response) => response.animalName)
  );
}
 
  

  displayRandomImage(imageUrl: string) {
    const animalImageElement = document.getElementById(
      'animalImage'
    ) as HTMLImageElement;
    if (animalImageElement) {
      animalImageElement.src = imageUrl;
    }
  }

  handleImageClickExtractAnimalName(event: Event, imageUrl: string): void {
    // Prevent the default behavior of the click event
    event.preventDefault();
  
    // Get the clicked element
    const clickedImage = event.target as HTMLImageElement;
  
    // Toggle the "clicked" class to apply/remove the colorful frame
    clickedImage.classList.toggle('clicked');
  
    // Check if the clicked image URL is already in the userPicksArray
    const pickIndex = this.userPicksArray.indexOf(imageUrl);
  
    if (pickIndex === -1) {
      // Image URL not found in the array, add it
      this.userPicksArray.push(imageUrl);
    } else {
      // Image URL found in the array, remove it
      this.userPicksArray.splice(pickIndex, 1);
    }
  
    // Log the current user's picks
    console.log('User Picks:', this.userPicksArray);
  
    // Check if the user has picked two images
    if (this.userPicksArray.length === 2) {
      // Stop the countdown interval and display the selected images for a short delay
      clearInterval(this.countdownInterval);
      this.displaySelectedImages();
      const delayDuration = 500; // Adjust the delay duration in milliseconds (e.g., 2000ms = 2 seconds)
  
      // Wait for the delay to finish before moving to the next iteration
      setTimeout(() => {
        this.moveToNextIteration();
      }, delayDuration);
    }
    else if (this.userPicksArray.length === 1 && this.timer === 0) {
      // Stop the countdown interval and display the selected images for a short delay
      clearInterval(this.countdownInterval);
      this.displaySelectedImages();
      const delayDuration = 500; // Adjust the delay duration in milliseconds (e.g., 2000ms = 2 seconds)
  
      // Wait for the delay to finish before moving to the next iteration
      setTimeout(() => {
        this.moveToNextIteration();
      }, delayDuration);
    }
}

moveToNextIteration(): void {
    // Check if the user made a correct pick
    const firstAnimal = this.imageUrls[this.currentIndex].FirstAnimal.toLowerCase();
    const secondAnimal = this.imageUrls[this.currentIndex].SecondAnimal.toLowerCase();
  
    // Extract the animal names from the URL strings in userPicksArray
    const userPicksAnimalNames = this.userPicksArray.map((imageUrl) => {
      const animalName = imageUrl.split('/').pop()?.split('.')[0]; // Extract the name between the last '/' and '.'
      return animalName || ''; // Return an empty string if extraction fails
    });
  
    let scoreToAdd = 0;
  
    console.log("firstAnimalXXXXX:", firstAnimal);
    console.log("secondAnimalXXXXX:", secondAnimal);
    console.log('userPicksAnimalNames:', userPicksAnimalNames);

    // Convert the animal names in userPicksAnimalNames to lowercase
    const lowercaseUserPicksAnimalNames = userPicksAnimalNames.map(name => name.toLowerCase());

    // Check if the lowercaseUserPicksAnimalNames contain the correct animal names
    if (lowercaseUserPicksAnimalNames.includes(firstAnimal) && lowercaseUserPicksAnimalNames.includes(secondAnimal)) {
      scoreToAdd = 30;
    } else if (lowercaseUserPicksAnimalNames.includes(firstAnimal) || lowercaseUserPicksAnimalNames.includes(secondAnimal)) {
      scoreToAdd = 10;
      this.lives--;
    } else {
      this.lives -= 2; // Reduce lives by 2 if neither animal is correct
    }

    this.currentIndex++; // Move to the next image

    this.score += scoreToAdd;

    // Clear the userPicksArray for the next iteration
    this.userPicksArray = [];

    // Call updateRandomAnimals() to update the mixed picture and random animal pictures
    this.updateRandomAnimals().subscribe(() => {
      this.displayRandomAnimals(); // Call recursively with the updated images
    });

    // Move this line inside the code block
    console.log("this.score:" + this.score);
}


  displaySelectedImages() {
    // Get the elements representing the selected images
    const selectedImageElements = document.querySelectorAll('.clicked') as NodeListOf<HTMLImageElement>;
  
    // Set a class to indicate that the selected images should remain highlighted until the next iteration
    selectedImageElements.forEach((img) => img.classList.add('highlighted'));
  }
  
  extractAnimalNameFromUrl(imageUrl: string): Observable<string> {
    // Extract the animal name from the image URL
    const startIndex = imageUrl.lastIndexOf('/') + 1;
    const endIndex = imageUrl.lastIndexOf('.');
    const animalName = imageUrl.substring(startIndex, endIndex);
    return of(animalName);
  }

  // handleImageClick() {
  //   console.log('Clicked on an Object image');
  // }

  getCurrentImageUrl(): string {
    if (this.imageUrls.length > 0) {
      return this.imageUrls[this.currentIndex].ImageURL;
    } else {
      return ''; // Return an empty string if no image URLs are available
    }
  }

  resetUI() {
    // Remove the "clicked" class from all animal images
    const animalImages = document.querySelectorAll('.additional-animal-image, .animal-image');
    animalImages.forEach((img) => img.classList.remove('clicked'));
  
    // Reset the selectedAnimalImages array
    this.selectedObjectImages = [];
  }

  nextPicture() {
    this.resetUI(); // Reset the UI before moving to the next picture
  
    this.displayNextPicture(); // Call displayNextPicture() to show the next mixed animal picture
  
    // Update random animal pictures for the next mixed animal picture
    this.updateRandomAnimals().subscribe(() => {
      this.displayRandomAnimals();
    });
  }
  
  displayNextPicture() {
    console.log("displayNextPicture")
    // Clear the countdown interval to prevent double counting
    clearInterval(this.countdownInterval);
    this.remainingTime = 10;
  
    // Check if currentIndex is within bounds
    if (this.currentIndex < this.imageUrls.length - 1) {
      this.currentIndex++; // Move to the next image
    } 
    else {
      // Call updateRandomAnimals() when the user reaches the end of all images
      // console.log("got here")
      this.finishGame(); // Reset the index
    }
  
    // Get the next image URL
    const imageUrl = this.imageUrls[this.currentIndex].ImageURL;
    this.displayRandomImage(imageUrl);
  
    // Start the countdown
    this.countdownInterval = setInterval(() => {
      this.remainingTime--;
      if (this.remainingTime === 0) {
        clearInterval(this.countdownInterval);
        this.updateRandomAnimals().subscribe(() => {
          this.displayRandomAnimals(); // Call recursively with the updated images
        });
      }
    }, 1000);
  }
  
  
  

  finishGame() {
    this.gameFinished = true;
    
    this.finalScore = this.score;
    if (!this.scorePrompted) {
      this.promptForScore();
    }
  }

  async showGameOverAlert() {
    return new Promise<void>(async (resolve) => {
      const alert = await this.alertController.create({
        header: 'Game Over',
        message: 'You ran out of lives!',
        buttons: [
          {
            text: 'Next',
            handler: () => {
              // Resolve the promise to indicate that the "Next" button was clicked
              resolve();
            }
          }
        ]
      });
  
      await alert.present();
    });
  }
  //Users/esiboni/Desktop/Mixit Files/mixit/Mixit Repo/Mixit-Repo/mixitApp/src/app/game/game.page.ts
  
  private async promptForScore() {
    const alert = await this.alertController.create({
      header: 'Your Score',
      message: `Your score: ${this.finalScore}`,
      buttons: [
        {
          text: 'Next',
          handler: () => {
            if (!this.scorePrompted) {
              this.promptForName();
            }
            this.scorePrompted = true;
          },
        },
      ],
    });

    await alert.present();
  }

  private async promptForName() {
  const alert = await this.alertController.create({
    header: 'Enter your name:',
    inputs: [
      {
        name: 'playerName',
        type: 'text',
        placeholder: 'Your Name'
      }
    ],
    buttons: [
      {
        text: 'Submit',
        handler: (data) => {
          const playerName = data.playerName;
          if (playerName) {
            this.playerName = playerName;
            this.sendScore();
          }
        }
      }
    ]
  });

  await alert.present();
}
  

  seeTopTen() {
    this.navCtrl.navigateForward('/top-ten');
  }


  private sendScore() {
    // Prepare the data to be sent
    const data = { name: this.playerName, score: this.finalScore };
  
    // Send a POST request to your API endpoint using BASE_URL
    this.http.post(`${BASE_URL}/score_table`, data).subscribe(
      () => {
        // Handle the successful response
        console.log('Score saved successfully');
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