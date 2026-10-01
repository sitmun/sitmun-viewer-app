const DRAG_START_TYPES = new Set(['pointerdown', 'mousedown', 'touchstart']);

export function isPopupDragStart(eventType: string): boolean {
  return DRAG_START_TYPES.has(eventType);
}

interface DragInstance {
  handleEvent?: (event: Event) => void;
}

interface DraggabillyPrototype {
  _create: (this: DragInstance) => void;
  handleEvent?: (this: DragInstance, event: Event) => void;
  __sitmunPopupDragRelease?: boolean;
}

/**
 * SITNA skips Draggabilly events whose target is a feature-info cell.
 * That skip must apply only when the drag starts. pointerup over a cell
 * otherwise never reaches dragEnd, so `.tc-drag` and its 0.4 opacity stay.
 */
export function installPopupDragReleasePatch(draggabilly: {
  prototype: DraggabillyPrototype;
}): void {
  const proto = draggabilly.prototype;
  if (proto.__sitmunPopupDragRelease || typeof proto._create !== 'function') {
    return;
  }
  const originalCreate = proto._create;
  const originalHandle = proto.handleEvent;
  proto._create = function patchedCreate(this: DragInstance) {
    originalCreate.call(this);
    let assigned = originalHandle;
    Object.defineProperty(this, 'handleEvent', {
      configurable: true,
      enumerable: true,
      get() {
        return (event: Event) => {
          if (isPopupDragStart(event.type)) {
            assigned?.call(this, event);
            return;
          }
          originalHandle?.call(this, event);
        };
      },
      set(fn: (this: DragInstance, event: Event) => void) {
        assigned = fn;
      }
    });
  };
  proto.__sitmunPopupDragRelease = true;
}
