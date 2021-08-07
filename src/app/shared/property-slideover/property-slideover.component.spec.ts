import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PropertySlideoverComponent } from './property-slideover.component';

describe('PropertySlideoverComponent', () => {
  let component: PropertySlideoverComponent;
  let fixture: ComponentFixture<PropertySlideoverComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PropertySlideoverComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PropertySlideoverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
