import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GuesserComponent } from './guesser.component';

describe('GuesserComponent', () => {
  let component: GuesserComponent;
  let fixture: ComponentFixture<GuesserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GuesserComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GuesserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
