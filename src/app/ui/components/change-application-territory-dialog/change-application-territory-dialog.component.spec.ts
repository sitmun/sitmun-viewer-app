import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { ChangeApplicationTerritoryDialogComponent } from './change-application-territory-dialog.component';

describe('ChangeApplicationTerritoryDialogComponent', () => {
  let component: ChangeApplicationTerritoryDialogComponent;
  let fixture: ComponentFixture<ChangeApplicationTerritoryDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [ChangeApplicationTerritoryDialogComponent]
    });
    fixture = TestBed.createComponent(
      ChangeApplicationTerritoryDialogComponent
    );
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
