import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfiguracionesPageUsuario } from './configuraciones-page-usuario';

describe('ConfiguracionesPageUsuario', () => {
  let component: ConfiguracionesPageUsuario;
  let fixture: ComponentFixture<ConfiguracionesPageUsuario>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfiguracionesPageUsuario]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfiguracionesPageUsuario);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
