import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActiveLoansPage } from './active-loans';

describe('ActiveLoansPage', () => {
  let component: ActiveLoansPage;
  let fixture: ComponentFixture<ActiveLoansPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActiveLoansPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActiveLoansPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
