import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SchoolComparisonComponent } from './school-comparison.component';

describe('SchoolComparisonComponent', () => {
  let component: SchoolComparisonComponent;
  let fixture: ComponentFixture<SchoolComparisonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SchoolComparisonComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SchoolComparisonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
