/**
 * Utility functions for loading script files dynamically.
 */

/**
 * Load a script file dynamically.
 * 
 * @param src - Path to script file (relative to assets or absolute)
 * @returns Promise that resolves when script is loaded
 */
export function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // Check if script already loaded
    const existingScript = document.querySelector(`script[src="${src}"]`);
    if (existingScript) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.head.appendChild(script);
  });
}

