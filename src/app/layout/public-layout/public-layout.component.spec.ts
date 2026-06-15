import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, RouterOutlet } from '@angular/router';

import { PublicLayoutComponent } from './public-layout.component';

@Component({ selector: 'app-navigation-bar', template: '', standalone: true })
class StubNavigationBarComponent {}

describe('PublicLayoutComponent', () => {
  let component: PublicLayoutComponent;
  let fixture: ComponentFixture<PublicLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterOutlet, StubNavigationBarComponent],
      declarations: [PublicLayoutComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(PublicLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
