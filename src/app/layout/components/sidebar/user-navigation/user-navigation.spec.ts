import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserNavigation } from './user-navigation';

describe('UserNavigation', () => {
  let component: UserNavigation;
  let fixture: ComponentFixture<UserNavigation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserNavigation]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserNavigation);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
