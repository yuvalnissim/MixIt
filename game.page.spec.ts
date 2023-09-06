import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { GamePage } from './game.page';

describe('GamePage', () => {
  let component: GamePage;
  let fixture: ComponentFixture<GamePage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(GamePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

//cd /opt/homebrew/share/phpmyadmin
//php -S localhost:8080 -t . 