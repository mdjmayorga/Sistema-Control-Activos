import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrestamoItem } from './prestamo-item';

describe('PrestamoItem', () => {
  let component: PrestamoItem;
  let fixture: ComponentFixture<PrestamoItem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrestamoItem]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrestamoItem);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
