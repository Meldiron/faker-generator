import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PropertyTreeComponent } from './property-tree.component';

describe('PropertyTreeComponent', () => {
  let component: PropertyTreeComponent;
  let fixture: ComponentFixture<PropertyTreeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PropertyTreeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PropertyTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
