import { installPopupDragReleasePatch } from './popup-drag-release';

describe('popup drag release', () => {
  function patchedInstance(): {
    handleEvent: (event: Event) => void;
    sitna: jest.Mock;
    proto: jest.Mock;
  } {
    const sitna = jest.fn();
    const proto = jest.fn();
    const draggabilly = {
      prototype: {
        _create() {
          return undefined;
        },
        handleEvent: proto
      }
    };
    installPopupDragReleasePatch(draggabilly);
    const instance = {} as { handleEvent?: (event: Event) => void };
    draggabilly.prototype._create.call(instance);
    instance.handleEvent = sitna;
    return { handleEvent: instance.handleEvent!.bind(instance), sitna, proto };
  }

  it('starts a drag through the cell exclusion', () => {
    const { handleEvent, sitna, proto } = patchedInstance();
    handleEvent({ type: 'pointerdown' } as Event);
    expect(sitna).toHaveBeenCalledTimes(1);
    expect(proto).not.toHaveBeenCalled();
  });

  it('ends the drag when the pointer is released over a result cell', () => {
    const { handleEvent, sitna, proto } = patchedInstance();
    handleEvent({ type: 'pointerup' } as Event);
    expect(proto).toHaveBeenCalledTimes(1);
    expect(sitna).not.toHaveBeenCalled();
  });
});
