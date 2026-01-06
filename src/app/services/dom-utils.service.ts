import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';

/**
 * Service for centralized DOM manipulation utilities.
 *
 * Provides safe, testable methods for common DOM operations.
 * Uses Angular's Renderer2 for SSR compatibility and security.
 */
@Injectable({
  providedIn: 'root'
})
export class DomUtilsService {
  private renderer: Renderer2;

  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  /**
   * Hide an element by ID by adding a CSS class.
   *
   * @param id - Element ID
   * @param className - CSS class to add (default: 'tc-hidden')
   * @returns true if element was found and modified, false otherwise
   */
  hideElementById(id: string, className: string = 'tc-hidden'): boolean {
    const element = document.getElementById(id);
    if (element) {
      this.renderer.addClass(element, className);
      return true;
    }
    return false;
  }

  /**
   * Show an element by ID by removing a CSS class.
   *
   * @param id - Element ID
   * @param className - CSS class to remove (default: 'tc-hidden')
   * @returns true if element was found and modified, false otherwise
   */
  showElementById(id: string, className: string = 'tc-hidden'): boolean {
    const element = document.getElementById(id);
    if (element) {
      this.renderer.removeClass(element, className);
      return true;
    }
    return false;
  }

  /**
   * Hide all elements with a given class by adding another class.
   *
   * @param sourceClassName - Class name to search for
   * @param hideClassName - CSS class to add (default: 'tc-hidden')
   * @returns Number of elements modified
   */
  hideElementsByClass(
    sourceClassName: string,
    hideClassName: string = 'tc-hidden'
  ): number {
    const elements = document.getElementsByClassName(sourceClassName);
    let count = 0;
    Array.from(elements).forEach((element) => {
      this.renderer.addClass(element, hideClassName);
      count++;
    });
    return count;
  }

  /**
   * Show all elements with a given class by removing another class.
   *
   * @param sourceClassName - Class name to search for
   * @param hideClassName - CSS class to remove (default: 'tc-hidden')
   * @returns Number of elements modified
   */
  showElementsByClass(
    sourceClassName: string,
    hideClassName: string = 'tc-hidden'
  ): number {
    const elements = document.getElementsByClassName(sourceClassName);
    let count = 0;
    Array.from(elements).forEach((element) => {
      this.renderer.removeClass(element, hideClassName);
      count++;
    });
    return count;
  }

  /**
   * Remove all elements matching a selector.
   *
   * @param selector - CSS selector
   * @returns Number of elements removed
   */
  removeElementsBySelector(selector: string): number {
    const elements = document.querySelectorAll(selector);
    let count = 0;
    elements.forEach((element) => {
      const parent = element.parentElement;
      if (parent) {
        this.renderer.removeChild(parent, element);
        count++;
      }
    });
    return count;
  }

  /**
   * Set display style on an element by ID.
   *
   * @param id - Element ID
   * @param display - Display style value (e.g., 'none', 'block', 'inline-flex')
   * @returns true if element was found and modified, false otherwise
   */
  setDisplayById(id: string, display: string): boolean {
    const element = document.getElementById(id);
    if (element) {
      this.renderer.setStyle(element, 'display', display);
      return true;
    }
    return false;
  }

  /**
   * Set display style on elements by class name.
   *
   * @param className - Class name to search for
   * @param display - Display style value
   * @returns Number of elements modified
   */
  setDisplayByClass(className: string, display: string): number {
    const elements = document.getElementsByClassName(className);
    let count = 0;
    Array.from(elements).forEach((element) => {
      this.renderer.setStyle(element, 'display', display);
      count++;
    });
    return count;
  }

  /**
   * Check if an element exists by ID.
   *
   * @param id - Element ID
   * @returns true if element exists, false otherwise
   */
  elementExistsById(id: string): boolean {
    return document.getElementById(id) !== null;
  }

  /**
   * Check if elements exist by class name.
   *
   * @param className - Class name to search for
   * @returns true if at least one element exists, false otherwise
   */
  elementExistsByClass(className: string): boolean {
    return document.getElementsByClassName(className).length > 0;
  }

  /**
   * Get first element by class name.
   *
   * @param className - Class name to search for
   * @returns The first element, or null if not found
   */
  getFirstElementByClass(className: string): Element | null {
    const elements = document.getElementsByClassName(className);
    return elements.length > 0 ? elements[0] : null;
  }
}
