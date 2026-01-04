import { TestBed } from '@angular/core/testing';
import { RendererFactory2 } from '@angular/core';
import { DomUtilsService } from './dom-utils.service';

describe('DomUtilsService', () => {
  let service: DomUtilsService;
  let testContainer: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DomUtilsService);

    // Create a test container in the DOM
    testContainer = document.createElement('div');
    testContainer.id = 'test-container';
    document.body.appendChild(testContainer);
  });

  afterEach(() => {
    // Clean up test container
    if (testContainer && testContainer.parentNode) {
      testContainer.parentNode.removeChild(testContainer);
    }
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('hideElementById', () => {
    it('should hide element by adding tc-hidden class', () => {
      const element = document.createElement('div');
      element.id = 'test-element';
      testContainer.appendChild(element);

      const result = service.hideElementById('test-element');

      expect(result).toBe(true);
      expect(element.classList.contains('tc-hidden')).toBe(true);
    });

    it('should hide element with custom class', () => {
      const element = document.createElement('div');
      element.id = 'test-element';
      testContainer.appendChild(element);

      const result = service.hideElementById('test-element', 'custom-hidden');

      expect(result).toBe(true);
      expect(element.classList.contains('custom-hidden')).toBe(true);
    });

    it('should return false for non-existent element', () => {
      const result = service.hideElementById('non-existent');
      expect(result).toBe(false);
    });

    it('should handle multiple hide calls', () => {
      const element = document.createElement('div');
      element.id = 'test-element';
      testContainer.appendChild(element);

      service.hideElementById('test-element');
      service.hideElementById('test-element');

      expect(element.classList.contains('tc-hidden')).toBe(true);
      expect(element.classList.length).toBe(1); // Only one class
    });
  });

  describe('showElementById', () => {
    it('should show element by removing tc-hidden class', () => {
      const element = document.createElement('div');
      element.id = 'test-element';
      element.classList.add('tc-hidden');
      testContainer.appendChild(element);

      const result = service.showElementById('test-element');

      expect(result).toBe(true);
      expect(element.classList.contains('tc-hidden')).toBe(false);
    });

    it('should show element with custom class', () => {
      const element = document.createElement('div');
      element.id = 'test-element';
      element.classList.add('custom-hidden');
      testContainer.appendChild(element);

      const result = service.showElementById('test-element', 'custom-hidden');

      expect(result).toBe(true);
      expect(element.classList.contains('custom-hidden')).toBe(false);
    });

    it('should return false for non-existent element', () => {
      const result = service.showElementById('non-existent');
      expect(result).toBe(false);
    });

    it('should handle showing already visible element', () => {
      const element = document.createElement('div');
      element.id = 'test-element';
      testContainer.appendChild(element);

      const result = service.showElementById('test-element');

      expect(result).toBe(true);
      // No error should occur
    });
  });

  describe('hideElementsByClass', () => {
    it('should hide all elements with given class', () => {
      const element1 = document.createElement('div');
      element1.classList.add('test-class');
      const element2 = document.createElement('div');
      element2.classList.add('test-class');
      testContainer.appendChild(element1);
      testContainer.appendChild(element2);

      const count = service.hideElementsByClass('test-class');

      expect(count).toBe(2);
      expect(element1.classList.contains('tc-hidden')).toBe(true);
      expect(element2.classList.contains('tc-hidden')).toBe(true);
    });

    it('should return 0 for non-existent class', () => {
      const count = service.hideElementsByClass('non-existent');
      expect(count).toBe(0);
    });

    it('should hide with custom class', () => {
      const element = document.createElement('div');
      element.classList.add('test-class');
      testContainer.appendChild(element);

      const count = service.hideElementsByClass('test-class', 'custom-hidden');

      expect(count).toBe(1);
      expect(element.classList.contains('custom-hidden')).toBe(true);
    });
  });

  describe('showElementsByClass', () => {
    it('should show all elements with given class', () => {
      const element1 = document.createElement('div');
      element1.classList.add('test-class', 'tc-hidden');
      const element2 = document.createElement('div');
      element2.classList.add('test-class', 'tc-hidden');
      testContainer.appendChild(element1);
      testContainer.appendChild(element2);

      const count = service.showElementsByClass('test-class');

      expect(count).toBe(2);
      expect(element1.classList.contains('tc-hidden')).toBe(false);
      expect(element2.classList.contains('tc-hidden')).toBe(false);
    });

    it('should return 0 for non-existent class', () => {
      const count = service.showElementsByClass('non-existent');
      expect(count).toBe(0);
    });
  });

  describe('removeElementsBySelector', () => {
    it('should remove elements matching selector', () => {
      const element1 = document.createElement('div');
      element1.className = 'remove-me';
      const element2 = document.createElement('div');
      element2.className = 'remove-me';
      testContainer.appendChild(element1);
      testContainer.appendChild(element2);

      const count = service.removeElementsBySelector('.remove-me');

      expect(count).toBe(2);
      expect(testContainer.querySelectorAll('.remove-me').length).toBe(0);
    });

    it('should return 0 for non-matching selector', () => {
      const count = service.removeElementsBySelector('.non-existent');
      expect(count).toBe(0);
    });

    it('should handle complex selectors', () => {
      const element = document.createElement('div');
      element.className = 'parent';
      const child = document.createElement('span');
      child.className = 'child';
      element.appendChild(child);
      testContainer.appendChild(element);

      const count = service.removeElementsBySelector('.parent .child');

      expect(count).toBe(1);
      expect(testContainer.querySelectorAll('.child').length).toBe(0);
    });
  });

  describe('setDisplayById', () => {
    it('should set display style to none', () => {
      const element = document.createElement('div');
      element.id = 'test-element';
      testContainer.appendChild(element);

      const result = service.setDisplayById('test-element', 'none');

      expect(result).toBe(true);
      expect(element.style.display).toBe('none');
    });

    it('should set display style to inline-flex', () => {
      const element = document.createElement('div');
      element.id = 'test-element';
      testContainer.appendChild(element);

      const result = service.setDisplayById('test-element', 'inline-flex');

      expect(result).toBe(true);
      expect(element.style.display).toBe('inline-flex');
    });

    it('should return false for non-existent element', () => {
      const result = service.setDisplayById('non-existent', 'block');
      expect(result).toBe(false);
    });
  });

  describe('setDisplayByClass', () => {
    it('should set display on all elements with class', () => {
      const element1 = document.createElement('div');
      element1.classList.add('test-class');
      const element2 = document.createElement('div');
      element2.classList.add('test-class');
      testContainer.appendChild(element1);
      testContainer.appendChild(element2);

      const count = service.setDisplayByClass('test-class', 'flex');

      expect(count).toBe(2);
      expect(element1.style.display).toBe('flex');
      expect(element2.style.display).toBe('flex');
    });

    it('should return 0 for non-existent class', () => {
      const count = service.setDisplayByClass('non-existent', 'block');
      expect(count).toBe(0);
    });
  });

  describe('elementExistsById', () => {
    it('should return true for existing element', () => {
      const element = document.createElement('div');
      element.id = 'test-element';
      testContainer.appendChild(element);

      expect(service.elementExistsById('test-element')).toBe(true);
    });

    it('should return false for non-existent element', () => {
      expect(service.elementExistsById('non-existent')).toBe(false);
    });
  });

  describe('elementExistsByClass', () => {
    it('should return true for existing class', () => {
      const element = document.createElement('div');
      element.classList.add('test-class');
      testContainer.appendChild(element);

      expect(service.elementExistsByClass('test-class')).toBe(true);
    });

    it('should return false for non-existent class', () => {
      expect(service.elementExistsByClass('non-existent')).toBe(false);
    });

    it('should return true if at least one element has class', () => {
      const element1 = document.createElement('div');
      element1.classList.add('test-class');
      const element2 = document.createElement('div');
      element2.classList.add('test-class');
      testContainer.appendChild(element1);
      testContainer.appendChild(element2);

      expect(service.elementExistsByClass('test-class')).toBe(true);
    });
  });

  describe('getFirstElementByClass', () => {
    it('should return first element with class', () => {
      const element1 = document.createElement('div');
      element1.classList.add('test-class');
      element1.textContent = 'First';
      const element2 = document.createElement('div');
      element2.classList.add('test-class');
      element2.textContent = 'Second';
      testContainer.appendChild(element1);
      testContainer.appendChild(element2);

      const result = service.getFirstElementByClass('test-class');

      expect(result).toBe(element1);
      expect(result?.textContent).toBe('First');
    });

    it('should return null for non-existent class', () => {
      const result = service.getFirstElementByClass('non-existent');
      expect(result).toBeNull();
    });
  });

  describe('edge cases', () => {
    it('should handle elements with multiple classes', () => {
      const element = document.createElement('div');
      element.id = 'multi-class';
      element.classList.add('class1', 'class2', 'class3');
      testContainer.appendChild(element);

      service.hideElementById('multi-class');

      expect(element.classList.contains('class1')).toBe(true);
      expect(element.classList.contains('class2')).toBe(true);
      expect(element.classList.contains('class3')).toBe(true);
      expect(element.classList.contains('tc-hidden')).toBe(true);
    });

    it('should handle nested elements', () => {
      const parent = document.createElement('div');
      parent.id = 'parent';
      const child = document.createElement('div');
      child.id = 'child';
      parent.appendChild(child);
      testContainer.appendChild(parent);

      service.hideElementById('parent');
      expect(parent.classList.contains('tc-hidden')).toBe(true);
      expect(child.classList.contains('tc-hidden')).toBe(false);
    });

    it('should handle rapid consecutive operations', () => {
      const element = document.createElement('div');
      element.id = 'rapid-test';
      testContainer.appendChild(element);

      for (let i = 0; i < 100; i++) {
        if (i % 2 === 0) {
          service.hideElementById('rapid-test');
        } else {
          service.showElementById('rapid-test');
        }
      }

      expect(element.classList.contains('tc-hidden')).toBe(false); // Last was show
    });
  });
});

