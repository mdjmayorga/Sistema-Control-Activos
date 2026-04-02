import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DevolverButton } from './devolver-button';

describe('DevolverButton', () => {
  let component: DevolverButton;
  let fixture: ComponentFixture<DevolverButton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DevolverButton]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DevolverButton);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
