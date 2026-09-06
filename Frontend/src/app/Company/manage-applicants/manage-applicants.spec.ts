import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ManageApplicantsComponent } from './manage-applicants'; 

describe('ManageApplicantsComponent', () => {
  let component: ManageApplicantsComponent;
  let fixture: ComponentFixture<ManageApplicantsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageApplicantsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ManageApplicantsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});