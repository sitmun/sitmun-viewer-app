import { NgOptimizedImage } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardItem } from '@api/services/common.service';
import { TranslateModule } from '@ngx-translate/core';

import { ApplicationDetailsComponent } from './application-details.component';

describe('ApplicationDetailsComponent', () => {
  let component: ApplicationDetailsComponent;
  let fixture: ComponentFixture<ApplicationDetailsComponent>;

  const baseApplication = (): DashboardItem => ({
    id: 1,
    name: 'App',
    appPrivate: false,
    isUnavailable: false,
    updateDate: new Date('2024-01-02'),
    createdDate: new Date('2023-06-01'),
    headerParams: {}
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), NgOptimizedImage],
      declarations: [ApplicationDetailsComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ApplicationDetailsComponent);
    component = fixture.componentInstance;
    component.application = {
      ...baseApplication(),
      pointOfContact: 'u'
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

  describe('institution and contact rows', () => {
    function render(overrides: Partial<DashboardItem>): HTMLElement {
      component.application = { ...baseApplication(), ...overrides };
      fixture.detectChanges();
      return fixture.nativeElement as HTMLElement;
    }

    it('shows institution and email when both exist', () => {
      const root = render({
        responsibleInstitutionName: 'Consell Insular de Menorca',
        pointOfContact: 'sig@cime.es'
      });

      const institution = root.querySelector(
        '#application-responsible-institution'
      );
      const contact = root.querySelector('#application-point-of-contact');
      expect(institution?.textContent).toContain('Consell Insular de Menorca');
      expect(contact?.textContent).toContain('sig@cime.es');
    });

    it('shows institution only when email is absent', () => {
      const root = render({
        responsibleInstitutionName: 'Consell Insular de Menorca'
      });

      expect(
        root.querySelector('#application-responsible-institution')?.textContent
      ).toContain('Consell Insular de Menorca');
      expect(root.querySelector('#application-point-of-contact')).toBeNull();
    });

    it('shows email only when institution is absent', () => {
      const root = render({ pointOfContact: 'sig@cime.es' });

      expect(root.querySelector('#application-responsible-institution')).toBeNull();
      expect(
        root.querySelector('#application-point-of-contact')?.textContent
      ).toContain('sig@cime.es');
    });

    it('renders neither row when both fields are absent', () => {
      const root = render({});

      expect(root.querySelector('#application-responsible-institution')).toBeNull();
      expect(root.querySelector('#application-point-of-contact')).toBeNull();
    });

    it('renders institution without email for a blocked-PoC API response', () => {
      // Backend omits pointOfContact for blocked creators; viewer only renders model values.
      const root = render({
        responsibleInstitutionName: 'Consell Insular de Menorca',
        pointOfContact: undefined
      });

      expect(
        root.querySelector('#application-responsible-institution')?.textContent
      ).toContain('Consell Insular de Menorca');
      expect(root.querySelector('#application-point-of-contact')).toBeNull();
    });
  });
});
