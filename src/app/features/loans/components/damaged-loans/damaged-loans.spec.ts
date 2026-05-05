import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DamagedLoansPage } from './damaged-loans';

describe('DamagedLoansPage', () => {
  let component: DamagedLoansPage;
  let fixture: ComponentFixture<DamagedLoansPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DamagedLoansPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DamagedLoansPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
