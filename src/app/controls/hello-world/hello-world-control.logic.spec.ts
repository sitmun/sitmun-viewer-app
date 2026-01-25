import {
  HelloWorldControlLogic,
  HelloWorldControlInstance,
  prototypeWrappers,
  TEMPLATE_PATH
} from './hello-world-control.logic';
import {
  BaseCustomControlInstance,
  ControlLogicBase,
  createPrototypeWrappers
} from '../utils/sitna-patch-helpers';

/**
 * Create a mock HelloWorldControlInstance for testing.
 */
function createMockControl(): jest.Mocked<HelloWorldControlInstance> {
  const div = document.createElement('div');
  div.innerHTML = '<button class="tc-ctl-hw-btn">Click me</button>';

  return {
    div,
    map: { baseLayer: { title: 'Test Base Layer' } },
    template: null,
    CLASS: 'tc-ctl-hw',
    _handleButtonClick: jest.fn(),
    _logic: undefined,
    getLocaleString: jest.fn().mockReturnValue(''),
    renderData: jest.fn().mockResolvedValue(undefined)
  } as any;
}

describe('HelloWorldControlLogic', () => {
  let logic: HelloWorldControlLogic;
  let mockControl: jest.Mocked<HelloWorldControlInstance>;

  beforeEach(() => {
    mockControl = createMockControl();
    logic = new HelloWorldControlLogic(mockControl);
  });

  describe('init()', () => {
    it('should bind _handleButtonClick to the logic instance', () => {
      logic.init();
      expect(typeof mockControl._handleButtonClick).toBe('function');
    });
  });

  describe('loadTemplates()', () => {
    it('should set template path when template is null', async () => {
      mockControl.template = null;

      await logic.loadTemplates();

      expect(mockControl.template).toEqual({
        'tc-ctl-hw': TEMPLATE_PATH
      });
    });

    it('should set template path when template is empty object', async () => {
      mockControl.template = {};

      await logic.loadTemplates();

      expect(mockControl.template['tc-ctl-hw']).toBe(TEMPLATE_PATH);
    });

    it('should overwrite existing template', async () => {
      const existingTemplate = 'custom/template/path.hbs';
      mockControl.template = { 'tc-ctl-hw': existingTemplate };

      await logic.loadTemplates();

      expect(mockControl.template['tc-ctl-hw']).toBe(TEMPLATE_PATH);
    });
  });

  describe('render()', () => {
    beforeEach(() => {
      logic.init();
      mockControl.renderData = jest.fn().mockResolvedValue(undefined);
    });

    it('should call renderData with translation keys', async () => {
      await logic.render();

      expect(mockControl.renderData).toHaveBeenCalledWith(
        {
          title: 'helloWorld.title',
          message: 'helloWorld.message',
          buttonLabel: 'helloWorld.buttonLabel'
        },
        expect.any(Function)
      );
    });

    it('should call addUIEventListeners in the renderData callback', async () => {
      const addUIEventListenersSpy = jest.spyOn(logic, 'addUIEventListeners');
      let renderCallback: (() => void) | undefined;

      mockControl.renderData = jest
        .fn()
        .mockImplementation(async (_data: unknown, callback?: () => void) => {
          renderCallback = callback;
        });

      await logic.render();

      expect(renderCallback).toBeDefined();
      renderCallback?.();
      expect(addUIEventListenersSpy).toHaveBeenCalled();
    });

    it('should pass callback through to control.renderData', async () => {
      const callback = jest.fn();
      let renderCallback: (() => void) | undefined;

      mockControl.renderData = jest
        .fn()
        .mockImplementation(async (_data: unknown, cb?: () => void) => {
          renderCallback = cb;
        });

      await logic.render(callback);

      expect(renderCallback).toBeDefined();
      renderCallback?.();
      expect(callback).toHaveBeenCalled();
    });
  });

  describe('addUIEventListeners()', () => {
    beforeEach(() => {
      logic.init();
    });

    it('should add click event listener to button', () => {
      const button = mockControl.div?.querySelector(
        '.tc-ctl-hw-btn'
      ) as HTMLElement;
      const addEventListenerSpy = jest.spyOn(button, 'addEventListener');

      logic.addUIEventListeners();

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'click',
        mockControl._handleButtonClick
      );
    });

    it('should handle missing button gracefully', () => {
      mockControl.div = document.createElement('div'); // Empty div, no button

      expect(() => logic.addUIEventListeners()).not.toThrow();
    });

    it('should handle null div gracefully', () => {
      mockControl.div = null;

      expect(() => logic.addUIEventListeners()).not.toThrow();
    });
  });

  describe('handleButtonClick()', () => {
    let alertSpy: jest.SpyInstance;

    beforeEach(() => {
      alertSpy = jest.spyOn(window, 'alert').mockImplementation(jest.fn());
      logic.init();
    });

    afterEach(() => {
      alertSpy.mockRestore();
    });

    it('should show alert with base layer title', () => {
      mockControl.map = { baseLayer: { title: 'Ortofoto' } };

      logic.handleButtonClick();

      expect(alertSpy).toHaveBeenCalledWith(
        'Hello from SITNA! You are viewing Ortofoto 1 times.'
      );
    });

    it('should show default message when base layer title is missing', () => {
      mockControl.map = { baseLayer: {} };

      logic.handleButtonClick();

      expect(alertSpy).toHaveBeenCalledWith(
        'Hello from SITNA! You are viewing the active basemap 1 times.'
      );
    });

    it('should show default message when map is null', () => {
      mockControl.map = null;

      logic.handleButtonClick();

      expect(alertSpy).toHaveBeenCalledWith(
        'Hello from SITNA! You are viewing the active basemap 1 times.'
      );
    });

    it('should show default message when baseLayer is undefined', () => {
      mockControl.map = {};

      logic.handleButtonClick();

      expect(alertSpy).toHaveBeenCalledWith(
        'Hello from SITNA! You are viewing the active basemap 1 times.'
      );
    });
  });
});

describe('prototypeWrappers', () => {
  let mockControl: jest.Mocked<HelloWorldControlInstance>;

  beforeEach(() => {
    mockControl = createMockControl();
  });

  it('should omit renderData wrapper to use SITNA default', () => {
    expect((prototypeWrappers as any).renderData).toBeUndefined();
  });

  describe('_initFromTypeScript', () => {
    it('should create logic instance on control', () => {
      prototypeWrappers._initFromTypeScript.call(mockControl);

      expect(mockControl._logic).toBeInstanceOf(HelloWorldControlLogic);
    });

    it('should call init on logic instance', () => {
      const initSpy = jest.spyOn(HelloWorldControlLogic.prototype, 'init');
      prototypeWrappers._initFromTypeScript.call(mockControl);

      expect(initSpy).toHaveBeenCalled();
    });
  });

  describe('loadTemplates', () => {
    it('should create logic instance if not exists', async () => {
      await prototypeWrappers.loadTemplates.call(mockControl);

      expect(mockControl._logic).toBeInstanceOf(HelloWorldControlLogic);
    });

    it('should reuse existing logic instance', async () => {
      prototypeWrappers._initFromTypeScript.call(mockControl);
      const existingLogic = mockControl._logic;

      await prototypeWrappers.loadTemplates.call(mockControl);

      expect(mockControl._logic).toBe(existingLogic);
    });

    it('should load templates via logic instance', async () => {
      await prototypeWrappers.loadTemplates.call(mockControl);

      expect(mockControl.template?.['tc-ctl-hw']).toBe(TEMPLATE_PATH);
    });
  });

  describe('render', () => {
    beforeEach(() => {
      mockControl.renderData = jest.fn().mockResolvedValue(undefined);
    });

    it('should create logic instance if not exists', async () => {
      await prototypeWrappers.render.call(mockControl);

      expect(mockControl._logic).toBeInstanceOf(HelloWorldControlLogic);
    });

    it('should call control.renderData via logic.renderData', async () => {
      await prototypeWrappers.render.call(mockControl);

      expect(mockControl.renderData).toHaveBeenCalled();
    });

    it('should pass callback through to control.renderData', async () => {
      const callback = jest.fn();
      let renderCallback: (() => void) | undefined;

      mockControl.renderData = jest
        .fn()
        .mockImplementation(async (_data: unknown, cb?: () => void) => {
          renderCallback = cb;
        });

      await prototypeWrappers.render.call(mockControl, callback);

      expect(renderCallback).toBeDefined();
      renderCallback?.();
      expect(callback).toHaveBeenCalled();
    });
  });

  // Note: renderData is omitted from HelloWorld prototype wrappers so SITNA's
  // default implementation remains untouched.

  describe('addUIEventListeners', () => {
    it('should create logic instance if not exists', () => {
      mockControl._logic = undefined;
      prototypeWrappers.addUIEventListeners.call(mockControl);

      expect(mockControl._logic).toBeInstanceOf(HelloWorldControlLogic);
    });

    it('should delegate to logic instance', () => {
      const testLogic = new HelloWorldControlLogic(mockControl);
      const addUIEventListenersSpy = jest.spyOn(
        HelloWorldControlLogic.prototype,
        'addUIEventListeners'
      );
      mockControl._logic = testLogic;

      prototypeWrappers.addUIEventListeners.call(mockControl);

      expect(addUIEventListenersSpy).toHaveBeenCalled();
    });
  });
});

describe('Constants', () => {
  it('should export correct TEMPLATE_PATH', () => {
    expect(TEMPLATE_PATH).toBe(
      'assets/js/templates/hello-world-control/HelloWorld.hbs'
    );
  });
});

describe('createPrototypeWrappers Factory', () => {
  /**
   * Test interface extending base
   */
  interface TestControlInstance extends BaseCustomControlInstance {
    customValue: string;
    _logic?: TestLogic;
  }

  /**
   * Test logic class implementing base interface
   */
  class TestLogic implements ControlLogicBase {
    constructor(private readonly control: TestControlInstance) {}

    init(): void {
      this.control.customValue = 'initialized';
    }

    async loadTemplates(): Promise<void> {
      this.control.template = { test: 'test-template.hbs' };
    }

    async render(callback?: () => void): Promise<void> {
      await this.control.renderData({ test: 'data' }, callback);
    }

    async renderData(
      data: Record<string, unknown>,
      callback?: () => void
    ): Promise<void> {
      await this.control.renderData(data, callback);
    }

    addUIEventListeners(): void {
      // No-op for test
    }
  }

  function createTestControl(): jest.Mocked<TestControlInstance> {
    return {
      div: null,
      map: null,
      template: null,
      CLASS: 'tc-ctl-test',
      _logic: undefined,
      customValue: '',
      getLocaleString: jest.fn().mockReturnValue(''),
      renderData: jest.fn().mockResolvedValue(undefined)
    };
  }

  it('should generate wrappers from a logic class', () => {
    const wrappers = createPrototypeWrappers<TestControlInstance>(TestLogic);

    expect(typeof wrappers._initFromTypeScript).toBe('function');
    expect(typeof wrappers.loadTemplates).toBe('function');
    expect(typeof wrappers.render).toBe('function');
    expect(typeof wrappers.addUIEventListeners).toBe('function');
  });

  it('should create logic instance on _initFromTypeScript', () => {
    const wrappers = createPrototypeWrappers<TestControlInstance>(TestLogic);
    const mockControl = createTestControl();

    wrappers._initFromTypeScript.call(mockControl);

    expect(mockControl._logic).toBeInstanceOf(TestLogic);
    expect(mockControl.customValue).toBe('initialized');
  });

  it('should delegate loadTemplates to logic instance', async () => {
    const wrappers = createPrototypeWrappers<TestControlInstance>(TestLogic);
    const mockControl = createTestControl();

    await wrappers.loadTemplates.call(mockControl);

    expect(mockControl.template).toEqual({ test: 'test-template.hbs' });
  });

  it('should delegate render to logic instance', async () => {
    const wrappers = createPrototypeWrappers<TestControlInstance>(TestLogic);
    const mockControl = createTestControl();
    const callback = jest.fn();

    await wrappers.render.call(mockControl, callback);

    expect(mockControl.renderData).toHaveBeenCalledWith(
      { test: 'data' },
      callback
    );
  });

  it('should create logic instance lazily in each method', () => {
    const wrappers = createPrototypeWrappers<TestControlInstance>(TestLogic);
    const mockControl = createTestControl();

    expect(mockControl._logic).toBeUndefined();

    wrappers.addUIEventListeners.call(mockControl);

    expect(mockControl._logic).toBeInstanceOf(TestLogic);
  });

  it('should reuse existing logic instance', async () => {
    const wrappers = createPrototypeWrappers<TestControlInstance>(TestLogic);
    const mockControl = createTestControl();

    wrappers._initFromTypeScript.call(mockControl);
    const firstLogic = mockControl._logic;

    await wrappers.loadTemplates.call(mockControl);

    expect(mockControl._logic).toBe(firstLogic);
  });

  it('should work with HelloWorldControlLogic (real usage)', () => {
    // Verify the actual exported prototypeWrappers work
    const mockControl = createMockControl();

    prototypeWrappers._initFromTypeScript.call(mockControl);

    expect(mockControl._logic).toBeInstanceOf(HelloWorldControlLogic);
  });
});
