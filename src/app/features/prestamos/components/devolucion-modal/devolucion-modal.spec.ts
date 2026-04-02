import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DevolucionModal } from './devolucion-modal';

describe('DevolucionModal', () => {
  let component: DevolucionModal;
  let fixture: ComponentFixture<DevolucionModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DevolucionModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DevolucionModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
