import { Location } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, ActivatedRoute } from '@angular/router';

import { CommonService } from '@api/services/common.service';
import { of } from 'rxjs';

import { TerritoryComponent } from './territory.component';

describe('TerritoryComponent', () => {
  let component: TerritoryComponent;
  let fixture: ComponentFixture<TerritoryComponent>;

  beforeEach(() => {
    const mockCommonService = {
      fetchDashboardItems: jest.fn().mockReturnValue(of({ content: [] })),
      fetchApplicationsByTerritory: jest
        .fn()
        .mockReturnValue(of({ content: [] }))
    };

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [TerritoryComponent],
      providers: [
        {
          provide: Router,
          useValue: {
            navigate: jest.fn(),
            navigateByUrl: jest.fn()
          }
        },
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ territoryId: '1' }),
            snapshot: { paramMap: { get: () => '1' } }
          }
        },
        {
          provide: Location,
          useValue: {
            back: jest.fn()
          }
        },
        { provide: CommonService, useValue: mockCommonService }
      ]
    });
    fixture = TestBed.createComponent(TerritoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
