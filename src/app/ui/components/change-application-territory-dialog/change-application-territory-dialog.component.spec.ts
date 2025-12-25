import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeApplicationTerritoryDialogComponent } from './change-application-territory-dialog.component';

describe('ChangeApplicationTerritoryDialogComponent', () => {
  let component: ChangeApplicationTerritoryDialogComponent;
  let fixture: ComponentFixture<ChangeApplicationTerritoryDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ChangeApplicationTerritoryDialogComponent]
    });
    fixture = TestBed.createComponent(ChangeApplicationTerritoryDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

