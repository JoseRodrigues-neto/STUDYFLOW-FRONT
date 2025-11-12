import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoadmapFormComponent } from './roadmap-form.component';

describe('RoadmapFormComponent', () => {
  let component: RoadmapFormComponent;
  let fixture: ComponentFixture<RoadmapFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoadmapFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoadmapFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
