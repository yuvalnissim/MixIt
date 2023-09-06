import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TopTenPage } from './top-ten.page';

describe('TopTenPage', () => {
  let component: TopTenPage;
  let fixture: ComponentFixture<TopTenPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(TopTenPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
