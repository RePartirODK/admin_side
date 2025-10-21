import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Amadoununu } from './amadoununu';

describe('Amadoununu', () => {
  let component: Amadoununu;
  let fixture: ComponentFixture<Amadoununu>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Amadoununu]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Amadoununu);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
