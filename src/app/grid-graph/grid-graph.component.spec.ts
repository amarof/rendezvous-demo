import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GridGraphComponent } from './grid-graph.component';

describe('GridGraphComponent', () => {
  let component: GridGraphComponent;
  let fixture: ComponentFixture<GridGraphComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GridGraphComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GridGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
