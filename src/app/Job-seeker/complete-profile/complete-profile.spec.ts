import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CompleteProfileComponent } from './complete-profile.component'; // Added correct import

describe('CompleteProfileComponent', () => { // Updated name
  let component: CompleteProfileComponent; // Updated name
  let fixture: ComponentFixture<CompleteProfileComponent>; // Updated name

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompleteProfileComponent], // Updated name
    }).compileComponents();

    fixture = TestBed.createComponent(CompleteProfileComponent); // Updated name
    component = fixture.componentInstance;
    
    // Optional: Only need whenStable() if you are testing async operations in setup
    // await fixture.whenStable(); 
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});