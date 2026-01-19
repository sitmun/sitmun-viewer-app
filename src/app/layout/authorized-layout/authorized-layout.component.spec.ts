import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { AuthorizedLayoutComponent } from './authorized-layout.component';

@Component({ selector: 'app-navigation-bar', template: '' })
class StubNavigationBarComponent {}

describe('AuthorizedLayoutComponent', () => {
  let component: AuthorizedLayoutComponent;
  let fixture: ComponentFixture<AuthorizedLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [AuthorizedLayoutComponent, StubNavigationBarComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(AuthorizedLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
