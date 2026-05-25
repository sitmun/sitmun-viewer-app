import { Location } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, ActivatedRoute } from '@angular/router';

import { CommonService, DashboardItem } from '@api/services/common.service';
import { TranslateService } from '@ngx-translate/core';
import { EMPTY, of } from 'rxjs';

import { TerritoryComponent } from './territory.component';

describe('TerritoryComponent', () => {
  let component: TerritoryComponent;
  let fixture: ComponentFixture<TerritoryComponent>;

  const territory = (description?: string): DashboardItem =>
    ({
      id: 4,
      name: 'Menorca',
      description,
      type: 'T',
      appPrivate: false,
      isUnavailable: false,
      updateDate: new Date(),
      createdDate: new Date(),
      creator: 'u',
      headerParams: {}
    }) as DashboardItem;

  const apps = (): DashboardItem[] => [
    {
      id: 12,
      name: 'IDE genèric Menorca',
      title: 'IDE genèric Menorca',
      type: 'I',
      appPrivate: false,
      isUnavailable: false,
      updateDate: new Date(),
      createdDate: new Date(),
      creator: 'u',
      headerParams: {}
    },
    {
      id: 30,
      name: 'IDE genèric Menorca — Multi territory',
      title: 'IDE genèric Menorca — Multi territory',
      type: 'I',
      appPrivate: false,
      isUnavailable: false,
      updateDate: new Date(),
      createdDate: new Date(),
      creator: 'u',
      headerParams: {}
    }
  ];

  beforeEach(() => {
    const mockCommonService = {
      fetchDashboardItems: jest
        .fn()
        .mockReturnValue(of({ content: [territory('Island GIS hub')] })),
      fetchApplicationsByTerritory: jest
        .fn()
        .mockReturnValue(of({ content: apps() }))
    };

    TestBed.configureTestingModule({
      declarations: [TerritoryComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
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
            params: of({ territoryId: '4' }),
            snapshot: { paramMap: { get: () => '4' } }
          }
        },
        {
          provide: Location,
          useValue: {
            back: jest.fn()
          }
        },
        { provide: CommonService, useValue: mockCommonService },
        {
          provide: TranslateService,
          useValue: {
            onLangChange: EMPTY,
            instant: (key: string) => key
          }
        }
      ]
    });
    fixture = TestBed.createComponent(TerritoryComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('shows information panel when territory has a description', () => {
    component.territory = territory('Useful description');
    expect(component.showTerritoryInformationPanel).toBe(true);
  });

  it('hides information panel when territory description is empty', () => {
    component.territory = territory('');
    expect(component.showTerritoryInformationPanel).toBe(false);
    component.territory = territory(undefined);
    expect(component.showTerritoryInformationPanel).toBe(false);
  });

  it('filters territory applications by keyword', () => {
    component.allApplications = apps();
    component.onKeywordsSearch('Multi');
    expect(component.applications).toHaveLength(1);
    expect(component.applications[0].id).toBe(30);
    component.onKeywordsSearch('');
    expect(component.applications).toHaveLength(2);
  });

  it('reports application count from the full territory list', () => {
    component.allApplications = apps();
    expect(component.applicationCount).toBe(2);
  });
});
