import { NgOptimizedImage } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TranslateModule } from '@ngx-translate/core';

import { ApplicationDetailsComponent } from './application-details.component';

describe('ApplicationDetailsComponent', () => {
  let component: ApplicationDetailsComponent;
  let fixture: ComponentFixture<ApplicationDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), NgOptimizedImage],
      declarations: [ApplicationDetailsComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ApplicationDetailsComponent);
    component = fixture.componentInstance;
    component.application = {
      id: 1,
      name: 'App',
      appPrivate: false,
      isUnavailable: false,
      updateDate: new Date('2024-01-02'),
      createdDate: new Date(),
      creator: 'u',
      headerParams: {}
    };
    fixture.detectChanges();
  });

  it('uses updateDate when lastUpdate is absent', () => {
    expect(component.hasLastUpdate()).toBe(true);
    expect(component.displayLastUpdate()).toEqual(
      component.application.updateDate
    );
  });

  it('prefers lastUpdate when both dates exist', () => {
    const last = new Date('2025-05-24');
    component.application.lastUpdate = last;
    expect(component.displayLastUpdate()).toEqual(last);
  });
});
