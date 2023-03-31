import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthorizedNavigationBarComponent } from './authorized-navigation-bar.component';

describe('AuthorizedNavigationBarComponent', () => {
  let component: AuthorizedNavigationBarComponent;
  let fixture: ComponentFixture<AuthorizedNavigationBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AuthorizedNavigationBarComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuthorizedNavigationBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
