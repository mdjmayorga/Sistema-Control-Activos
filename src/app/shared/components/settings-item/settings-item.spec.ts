import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsItem } from './settings-item';

describe('SettingsItem', () => {
  let component: SettingsItem;
  let fixture: ComponentFixture<SettingsItem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingsItem]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SettingsItem);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('title', 'Cerrar sesion');
    fixture.componentRef.setInput('description', 'Finaliza la sesion actual.');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
