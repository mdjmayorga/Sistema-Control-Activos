import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReturnModal } from './return-modal';

describe('ReturnModal', () => {
  let component: ReturnModal;
  let fixture: ComponentFixture<ReturnModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReturnModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReturnModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
