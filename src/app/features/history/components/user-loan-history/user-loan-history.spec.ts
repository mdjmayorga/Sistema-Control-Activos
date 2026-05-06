import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserLoanHistoryPage } from './user-loan-history';

describe('UserLoanHistoryPage', () => {
  let component: UserLoanHistoryPage;
  let fixture: ComponentFixture<UserLoanHistoryPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserLoanHistoryPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserLoanHistoryPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
