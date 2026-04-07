import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoanItem } from './loan-item';

describe('LoanItem', () => {
  let component: LoanItem;
  let fixture: ComponentFixture<LoanItem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoanItem]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoanItem);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
