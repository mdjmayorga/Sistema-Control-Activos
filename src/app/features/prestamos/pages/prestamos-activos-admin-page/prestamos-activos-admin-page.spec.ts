import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrestamosActivosAdminPage } from './prestamos-activos-admin-page';

describe('PrestamosActivosAdminPage', () => {
  let component: PrestamosActivosAdminPage;
  let fixture: ComponentFixture<PrestamosActivosAdminPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrestamosActivosAdminPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrestamosActivosAdminPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
