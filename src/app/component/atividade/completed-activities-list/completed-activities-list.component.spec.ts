import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompletedActivitiesListComponent } from './completed-activities-list.component';

describe('CompletedActivitiesListComponent', () => {
  let component: CompletedActivitiesListComponent;
  let fixture: ComponentFixture<CompletedActivitiesListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompletedActivitiesListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompletedActivitiesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
