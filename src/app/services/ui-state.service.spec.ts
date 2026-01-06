import { TestBed } from '@angular/core/testing';
import { UIStateService } from './ui-state.service';
import { take } from 'rxjs/operators';

describe('UIStateService', () => {
  let service: UIStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UIStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('initial state', () => {
    it('should have all buttons disabled by default', () => {
      expect(service.isLegendButtonEnabled()).toBe(false);
      expect(service.isOverviewMapButtonEnabled()).toBe(false);
      expect(service.isToolsButtonEnabled()).toBe(false);
    });

    it('should emit false from all observables initially', (done) => {
      let emissionCount = 0;
      
      service.showLegend$.pipe(take(1)).subscribe((value) => {
        expect(value).toBe(false);
        emissionCount++;
      });
      
      service.showOverviewMap$.pipe(take(1)).subscribe((value) => {
        expect(value).toBe(false);
        emissionCount++;
      });
      
      service.showTools$.pipe(take(1)).subscribe((value) => {
        expect(value).toBe(false);
        emissionCount++;
        if (emissionCount === 3) {
          done();
        }
      });
    });
  });

  describe('legend button state', () => {
    it('should enable legend button', () => {
      service.enableLegendButton();
      expect(service.isLegendButtonEnabled()).toBe(true);
    });

    it('should disable legend button', () => {
      service.enableLegendButton();
      service.disableLegendButton();
      expect(service.isLegendButtonEnabled()).toBe(false);
    });

    it('should emit true when enabled', (done) => {
      service.showLegend$.pipe(take(2)).subscribe((value) => {
        if (value === true) {
          expect(value).toBe(true);
          done();
        }
      });
      service.enableLegendButton();
    });

    it('should emit false when disabled', (done) => {
      service.enableLegendButton();
      
      let skipFirst = true;
      service.showLegend$.subscribe((value) => {
        if (skipFirst) {
          skipFirst = false;
          return;
        }
        expect(value).toBe(false);
        done();
      });
      
      service.disableLegendButton();
    });
  });

  describe('overview map button state', () => {
    it('should enable overview map button', () => {
      service.enableOverviewMapButton();
      expect(service.isOverviewMapButtonEnabled()).toBe(true);
    });

    it('should disable overview map button', () => {
      service.enableOverviewMapButton();
      service.disableOverviewMapButton();
      expect(service.isOverviewMapButtonEnabled()).toBe(false);
    });

    it('should emit state changes', (done) => {
      let emissionCount = 0;
      service.showOverviewMap$.subscribe((value) => {
        emissionCount++;
        if (emissionCount === 1) {
          expect(value).toBe(false); // Initial
        } else if (emissionCount === 2) {
          expect(value).toBe(true); // After enable
          done();
        }
      });
      service.enableOverviewMapButton();
    });
  });

  describe('tools button state', () => {
    it('should enable tools button', () => {
      service.enableToolsButton();
      expect(service.isToolsButtonEnabled()).toBe(true);
    });

    it('should disable tools button', () => {
      service.enableToolsButton();
      service.disableToolsButton();
      expect(service.isToolsButtonEnabled()).toBe(false);
    });

    it('should handle multiple enable calls', () => {
      service.enableToolsButton();
      service.enableToolsButton();
      service.enableToolsButton();
      expect(service.isToolsButtonEnabled()).toBe(true);
    });
  });

  describe('reset', () => {
    it('should reset all button states to false', () => {
      // Enable all buttons
      service.enableLegendButton();
      service.enableOverviewMapButton();
      service.enableToolsButton();
      
      expect(service.isLegendButtonEnabled()).toBe(true);
      expect(service.isOverviewMapButtonEnabled()).toBe(true);
      expect(service.isToolsButtonEnabled()).toBe(true);

      // Reset
      service.reset();

      expect(service.isLegendButtonEnabled()).toBe(false);
      expect(service.isOverviewMapButtonEnabled()).toBe(false);
      expect(service.isToolsButtonEnabled()).toBe(false);
    });

    it('should emit false from all observables after reset', (done) => {
      service.enableLegendButton();
      service.enableOverviewMapButton();
      service.enableToolsButton();

      let emissionCount = 0;
      const checkDone = () => {
        emissionCount++;
        if (emissionCount === 3) {
          done();
        }
      };

      // Subscribe and wait for reset emissions
      let legendReceived = false;
      let overviewReceived = false;
      let toolsReceived = false;

      service.showLegend$.pipe(take(3)).subscribe((value) => {
        // Third emission (after initial false, enable true, reset false)
        if (!legendReceived) {
          legendReceived = true;
          expect(value).toBe(false);
          checkDone();
        }
      });

      service.showOverviewMap$.pipe(take(3)).subscribe((value) => {
        if (!overviewReceived) {
          overviewReceived = true;
          expect(value).toBe(false);
          checkDone();
        }
      });

      service.showTools$.pipe(take(3)).subscribe((value) => {
        if (!toolsReceived) {
          toolsReceived = true;
          expect(value).toBe(false);
          checkDone();
        }
      });

      service.reset();
    });
  });

  describe('independent state management', () => {
    it('should manage legend button independently', () => {
      service.enableLegendButton();
      expect(service.isLegendButtonEnabled()).toBe(true);
      expect(service.isOverviewMapButtonEnabled()).toBe(false);
      expect(service.isToolsButtonEnabled()).toBe(false);
    });

    it('should manage overview map button independently', () => {
      service.enableOverviewMapButton();
      expect(service.isLegendButtonEnabled()).toBe(false);
      expect(service.isOverviewMapButtonEnabled()).toBe(true);
      expect(service.isToolsButtonEnabled()).toBe(false);
    });

    it('should manage tools button independently', () => {
      service.enableToolsButton();
      expect(service.isLegendButtonEnabled()).toBe(false);
      expect(service.isOverviewMapButtonEnabled()).toBe(false);
      expect(service.isToolsButtonEnabled()).toBe(true);
    });

    it('should handle mixed states', () => {
      service.enableLegendButton();
      service.enableToolsButton();
      
      expect(service.isLegendButtonEnabled()).toBe(true);
      expect(service.isOverviewMapButtonEnabled()).toBe(false);
      expect(service.isToolsButtonEnabled()).toBe(true);
    });
  });

  describe('observable behavior', () => {
    it('should allow multiple subscriptions', (done) => {
      let subscription1Called = false;
      let subscription2Called = false;

      service.showLegend$.pipe(take(2)).subscribe((value) => {
        if (value === true) {
          subscription1Called = true;
          checkBoth();
        }
      });

      service.showLegend$.pipe(take(2)).subscribe((value) => {
        if (value === true) {
          subscription2Called = true;
          checkBoth();
        }
      });

      const checkBoth = () => {
        if (subscription1Called && subscription2Called) {
          done();
        }
      };

      service.enableLegendButton();
    });

    it('should provide latest value to new subscribers', (done) => {
      service.enableLegendButton();
      
      // Subscribe after state change
      setTimeout(() => {
        service.showLegend$.pipe(take(1)).subscribe((value) => {
          expect(value).toBe(true);
          done();
        });
      }, 10);
    });
  });

  describe('thread safety (no race conditions)', () => {
    it('should handle rapid state changes', () => {
      for (let i = 0; i < 100; i++) {
        if (i % 2 === 0) {
          service.enableToolsButton();
        } else {
          service.disableToolsButton();
        }
      }
      expect(service.isToolsButtonEnabled()).toBe(false); // Last operation was disable
    });

    it('should handle concurrent enable/disable', (done) => {
      let emissionCount = 0;
      const emissions: boolean[] = [];

      service.showTools$.subscribe((value) => {
        emissions.push(value);
        emissionCount++;
      });

      service.enableToolsButton();
      service.disableToolsButton();
      service.enableToolsButton();

      setTimeout(() => {
        expect(emissionCount).toBe(4); // Initial + 3 changes
        expect(emissions[emissions.length - 1]).toBe(true); // Last was enable
        expect(service.isToolsButtonEnabled()).toBe(true);
        done();
      }, 50);
    });
  });
});

