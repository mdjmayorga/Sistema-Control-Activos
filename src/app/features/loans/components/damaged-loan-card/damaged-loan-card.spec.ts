import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DamagedLoanCard } from './damaged-loan-card';

describe('DamagedLoanCard', () => {
  let component: DamagedLoanCard;
  let fixture: ComponentFixture<DamagedLoanCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DamagedLoanCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DamagedLoanCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
