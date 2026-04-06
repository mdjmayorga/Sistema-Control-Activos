import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistorialPageUsuario } from './historial-page-usuario';

describe('HistorialPageUsuario', () => {
  let component: HistorialPageUsuario;
  let fixture: ComponentFixture<HistorialPageUsuario>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistorialPageUsuario]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HistorialPageUsuario);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
