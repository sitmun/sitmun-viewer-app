document.querySelectorAll('.tc-map').forEach(function (elm) {
  const map = SITNA.Map.get(elm);

  if (map && !map._layoutDone) {
    /**
     * Array de condiciones para distintas resoluciones de pantalla. La estructura del array que recibe como parámetro es es:
     *  - screenCondition (string): media query que debe evaluarse a true para que se apliquen los cambios.
     *  - apply:
     *      - event (string): evento que debe producirse para que se lleve a cabo la acción.
     *      - elements (array o string): selectores CSS de los elementos sobre los que se debe producir el evento anterior.
     *      - changes:
     *          - targets (array o string): selectores CSS de los elementos a los que se aplicarán las clases CSS siguientes
     *          - classes (array o string): clases CSS a aplicar
     */
    TC.Cfg.applyChanges = function (configArray) {
      var changes = configArray instanceof Array ? configArray : [configArray];

      if (changes) {
        var map;
        changes.forEach(function (item) {
          var elem = item.apply;
          var clickedElems =
            elem.elements instanceof Array ? elem.elements : [elem.elements];
          map =
            item.map || map || SITNA.Map.get(document.querySelector('.tc-map'));
          map.div.addEventListener(
            elem.event,
            TC.EventTarget.listenerBySelector(clickedElems.join(), function () {
              if (window.matchMedia(item.screenCondition).matches) {
                // si es una pantalla estrecha
                elem.changes.forEach(function (change) {
                  var targets = Array.isArray(change.targets)
                    ? change.targets
                    : [change.targets];
                  var classes = Array.isArray(change.classes)
                    ? change.classes
                    : [change.classes];

                  map.div
                    .querySelectorAll(targets.join())
                    .forEach(function (elm) {
                      classes.forEach(function (cls) {
                        elm.classList.add(cls);
                      });
                    });
                });
              }
            })
          );
        });
      }
    };

    // En pantalla estrecha cambiamos el método de mostrar GFI.
    if (
      window.matchMedia(
        'screen and (max-width: 40em), screen and (max-height: 40em)'
      ).matches
    ) {
      map.defaultInfoContainer = SITNA.Consts.infoContainer.RESULTS_PANEL;
    }

    map.ready(function () {
      // Colapsamos los controles de tipo web component, porque no los podemos colapsar por markup
      map.controls.forEach((c) => {
        if (c instanceof HTMLElement) {
          if (
            c.parentElement &&
            c.parentElement.classList.contains(SITNA.Consts.classes.COLLAPSED)
          ) {
            c.classList.add(SITNA.Consts.classes.COLLAPSED);
          }
        }
      });

      /* --- LEGACY --- */
      const ovPanel = map.div.querySelector(
        `.${TC.Consts.classes.OVERVIEW_MAP_PANEL},.ovmap-panel`
      );
      const rcollapsedClass =
        TC.Consts.classes.COLLAPSED_RIGHT || 'right-collapsed';
      const lcollapsedClass =
        TC.Consts.classes.COLLAPSED_LEFT || 'left-collapsed';

      const ovmap = map.getControlsByClass('TC.control.OverviewMap')[0];
      const rightPanel = map.div.querySelector(
        `.${TC.Consts.classes.RIGHT_PANEL}, .right-panel`
      );
      const rightToolControls = rightPanel?.querySelectorAll('[data-tools-tab]');

      /* --- SITMUN BASE --- */

      /**
       * Toggle visibility of control elements.
       * @param {NodeList|Array|HTMLElement} elements - Elements to show/hide
       * @param {boolean} show - true to show, false to hide
       */
      const toggleControlsVisibility = function (elements, show) {
        if (!elements) return;
        const elementArray =
          elements instanceof NodeList
            ? Array.from(elements)
            : Array.isArray(elements)
            ? elements
            : [elements];
        elementArray.forEach(function (el) {
          if (el) {
            if (show) {
              el.classList.remove('tc-hidden');
            } else {
              el.classList.add('tc-hidden');
            }
          }
        });
      };

      /**
       * Check if any of the elements have controls rendered.
       * @param {NodeList|Array} elements - Elements to check
       * @returns {boolean} true if any element has a control
       */
      const hasAnyControl = function (elements) {
        if (!elements || elements.length === 0) return false;
        const elementArray =
          elements instanceof NodeList
            ? Array.from(elements)
            : Array.isArray(elements)
            ? elements
            : [elements];
        return elementArray.some(function (div) {
          if (!div) return false;
          // Check if div itself has tc-ctl class or has children with tc-ctl classes
          return (
            div.classList.contains('tc-ctl') ||
            div.querySelector('.tc-ctl') !== null
          );
        });
      };

      /**
       * Enable mouse drag for resizable panels.
       * Uses pointer events to move the panel body.
       * @param {HTMLElement} panel - Panel root element.
       */
      const attachPanelDrag = function (panel) {
        if (!panel) return;
        const dragTarget =
          panel.querySelector('.tc-ctl-rpanel-grp') ||
          panel.querySelector('.tc-ctl-rpanel-main');
        if (!dragTarget || dragTarget.dataset.dragInit) return;
        dragTarget.dataset.dragInit = 'true';

        const handle =
          dragTarget.querySelector('.tc-ctl-rpanel-heading') || dragTarget;

        const ensureAbsolutePosition = function () {
          if (dragTarget.dataset.dragPositioned) return;
          const mapRect = map.div.getBoundingClientRect();
          const rect = dragTarget.getBoundingClientRect();
          dragTarget.style.position = 'absolute';
          dragTarget.style.left = `${rect.left - mapRect.left}px`;
          dragTarget.style.top = `${rect.top - mapRect.top}px`;
          dragTarget.dataset.dragPositioned = 'true';
        };

        const getPosition = function () {
          const x = parseFloat(dragTarget.style.left || '0');
          const y = parseFloat(dragTarget.style.top || '0');
          return { x: isNaN(x) ? 0 : x, y: isNaN(y) ? 0 : y };
        };

        let startX = 0;
        let startY = 0;
        let originX = 0;
        let originY = 0;
        let dragging = false;

        const onPointerMove = function (event) {
          if (!dragging) return;
          const dx = event.clientX - startX;
          const dy = event.clientY - startY;
          dragTarget.style.left = `${originX + dx}px`;
          dragTarget.style.top = `${originY + dy}px`;
          event.preventDefault();
        };

        const stopDrag = function (event) {
          if (!dragging) return;
          dragging = false;
          window.removeEventListener('pointermove', onPointerMove);
          window.removeEventListener('pointerup', stopDrag);
          window.removeEventListener('pointercancel', stopDrag);
          try {
            handle.releasePointerCapture(event.pointerId);
          } catch (_err) {
            // No-op: pointer capture may already be released.
          }
        };

        handle.addEventListener('pointerdown', function (event) {
          const target = event.target;
          if (
            target &&
            (target.closest('button') ||
              target.closest('sitna-button') ||
              target.closest('input') ||
              target.closest('select') ||
              target.closest('textarea'))
          ) {
            return;
          }
          ensureAbsolutePosition();
          dragging = true;
          handle.setPointerCapture(event.pointerId);
          const pos = getPosition();
          originX = pos.x;
          originY = pos.y;
          startX = event.clientX;
          startY = event.clientY;
          window.addEventListener('pointermove', onPointerMove);
          window.addEventListener('pointerup', stopDrag);
          window.addEventListener('pointercancel', stopDrag);
          event.preventDefault();
        });
      };

      const attachResizablePanelDrag = function () {
        map.div
          .querySelectorAll('.tc-ctl-rpanel.tc-resizable, .tc-ctl-wfsquery-results')
          .forEach(function (panel) {
            attachPanelDrag(panel);
          });
      };

      const setRightPanelView = function (isCollapsed) {
        toggleControlsVisibility(rightToolControls, true);
        if (ovmap) {
          if (isCollapsed) {
            ovmap.disable();
          } else {
            ovmap.enable();
          }
        }
      };

      if (rightPanel) {
        const initialCollapsed =
          rightPanel.classList.contains(rcollapsedClass) ||
          rightPanel.classList.contains(TC.Consts.classes.COLLAPSED);
        setRightPanelView(initialCollapsed);
      }

      map.div
        .querySelectorAll(
          /* --- LEGACY --- */ `.${TC.Consts.classes.RIGHT_PANEL} > h1, .right-panel > h1`
        )
        .forEach(function (elm) {
          elm.addEventListener(SITNA.Consts.event.CLICK, function (e) {
            e.preventDefault();
            e.stopPropagation();
            const tab = e.target;
            const panel = tab.parentElement;
            const isCollapsed = panel.classList.toggle(rcollapsedClass);
            setRightPanelView(isCollapsed);
          });
        });

      map.div
        .querySelectorAll(`.${TC.Consts.classes.LEFT_PANEL} > h1`)
        .forEach(function (h1) {
          h1.addEventListener(SITNA.Consts.event.CLICK, function (e) {
            e.preventDefault();
            e.stopPropagation();
            const tab = e.target;
            const panel = tab.parentElement;
            const tabId = tab.id;
            // Get legend and tool controls elements
            const legend = panel.querySelector('.tc-ctl-legend');
            const toolControls = panel.querySelectorAll('[data-tools-tab]');
            // Get tab h1 elements
            const legendTab = panel.querySelector('#legend-tab');
            const toolsTab = panel.querySelector('#tools-tab');

            // Handle tab switching for legend-tab and tools-tab
            if (tabId === 'legend-tab' || tabId === 'tools-tab') {
              // Toggle panel collapse
              const isCollapsed = panel.classList.toggle(lcollapsedClass);

              // Update search control position based on left panel state
              const searchControl = map.getControlsByClass(TC.control.Search)[0];
              if (searchControl && searchControl.div) {
                const searchContent = searchControl.div.querySelector('.tc-ctl-search-content');
                if (searchContent) {
                  if (isCollapsed) {
                    // Left panel collapsed - remove class to use default position
                    searchContent.classList.remove('search-left-expanded');
                  } else {
                    // Left panel expanded - add class to move search right
                    searchContent.classList.add('search-left-expanded');
                  }
                }
              }

              if (!isCollapsed) {
                if (tabId === 'legend-tab') {
                  // Show legend, hide tool controls
                  toggleControlsVisibility([legend], true);
                  toggleControlsVisibility(toolControls, false);
                  // Hide tools-tab h1, show legend-tab h1
                  if (toolsTab) toolsTab.classList.add('tc-hidden');
                  if (legendTab) legendTab.classList.remove('tc-hidden');
                } else if (tabId === 'tools-tab') {
                  // Show tool controls, hide legend
                  toggleControlsVisibility(toolControls, true);
                  toggleControlsVisibility([legend], false);
                  // Hide legend-tab h1, show tools-tab h1
                  if (legendTab) legendTab.classList.add('tc-hidden');
                  if (toolsTab) toolsTab.classList.remove('tc-hidden');
                }
              } else {
                // Panel is collapsing - show tabs only if their controls exist
                if (legendTab && legend) {
                  legendTab.classList.remove('tc-hidden');
                }
                if (toolsTab && hasAnyControl(toolControls)) {
                  toolsTab.classList.remove('tc-hidden');
                }
                // Show all controls when collapsed (if they exist)
                toggleControlsVisibility([legend], true);
                toggleControlsVisibility(toolControls, true);
              }
            } else {
              // For other tabs, just toggle collapse
              const isCollapsed = panel.classList.toggle(lcollapsedClass);

              // Update search control position based on left panel state
              const searchControl = map.getControlsByClass(TC.control.Search)[0];
              if (searchControl && searchControl.div) {
                const searchContent = searchControl.div.querySelector('.tc-ctl-search-content');
                if (searchContent) {
                  if (isCollapsed) {
                    // Left panel collapsed - remove class to use default position
                    searchContent.classList.remove('search-left-expanded');
                  } else {
                    // Left panel expanded - add class to move search right
                    searchContent.classList.add('search-left-expanded');
                  }
                }
              }
            }
          });
        });

      /* --- LEGACY --- */
      const toolsPanel =
        map.div.querySelector('.' + TC.Consts.classes.TOOLS_PANEL) ||
        map.div.querySelector('#tools-panel');

      const collapseExceptions = map
        .getControlsByClass(TC.control.Search)
        .concat(map.getControlsByClass(TC.control.LanguageSelector))
        .concat(map.controls.filter((c) => c.containerControl))
        .map((c) => c.id)
        .filter((id) => toolsPanel.querySelector('#' + id));

      const toggleCollapsed = function (value) {
        const self = this;
        let element;
        if (self instanceof TC.control.WebComponentControl) {
          element = self;
        } else {
          element = self.div;
        }
        if (!collapseExceptions.includes(self.id)) {
          element.classList.toggle(SITNA.Consts.classes.COLLAPSED, value);
        }
      };

      map
        .on(SITNA.Consts.event.CONTROLHIGHLIGHT, function (e) {
          const ctl = e.control;
          toggleCollapsed.call(ctl, false);

          if (map.layout && map.layout.accordion) {
            // Hacemos que solamente un control del panel de herramientas esté desplegado cada vez
            const toolPanelControls = map.controls
              .filter((ctl) => !ctl.containerControl)
              .filter((ctl) => ctl.div && toolsPanel.contains(ctl.div));
            if (toolPanelControls.includes(ctl)) {
              toolPanelControls
                .filter((c) => c !== ctl)
                .forEach((ctl) => ctl.unhighlight());
            }
          }
        })
        .on(SITNA.Consts.event.CONTROLUNHIGHLIGHT, function (e) {
          const ctl = e.control;
          toggleCollapsed.call(ctl, true);
        });

      toolsPanel.addEventListener(SITNA.Consts.event.CLICK, function (e) {
        let tab = e.target;
        if (
          (tab.tagName === 'BUTTON' ||
            tab.tagName === 'SITNA-BUTTON' ||
            tab.tagName === 'SITNA-TOGGLE') &&
          tab.closest('div.tc-ctl.' + SITNA.Consts.classes.COLLAPSED)
        ) {
          tab = tab.parentElement;
        }
        if (tab.tagName === 'H2') {
          for (var i = 0; i < map.controls.length; i++) {
            const ctl = map.controls[i];
            if (ctl.div && ctl.div.contains(tab)) {
              if (ctl.isHighlighted()) {
                ctl.unhighlight();
              } else {
                ctl.highlight();
              }
              break;
            }
          }
        }
      });

      map.loaded(function () {
        // Initialize search control position based on left panel state
        const leftPanel = map.div.querySelector(
          `.${TC.Consts.classes.LEFT_PANEL}`
        );
        const searchControl = map.getControlsByClass(TC.control.Search)[0];
        if (leftPanel && searchControl && searchControl.div) {
          const searchContent = searchControl.div.querySelector('.tc-ctl-search-content');
          if (searchContent) {
            const isLeftPanelCollapsed =
              leftPanel.classList.contains(lcollapsedClass) ||
              leftPanel.classList.contains(TC.Consts.classes.COLLAPSED);
            if (isLeftPanelCollapsed) {
              searchContent.classList.remove('search-left-expanded');
            } else {
              searchContent.classList.add('search-left-expanded');
            }
          }
        }

        const ovmap = map.getControlsByClass('TC.control.OverviewMap')[0];
        if (ovmap && rightPanel) {
          const isCollapsed =
            rightPanel.classList.contains(rcollapsedClass) ||
            rightPanel.classList.contains(TC.Consts.classes.COLLAPSED);
          setRightPanelView(isCollapsed);
        }
        //mover el Multifeature info dentro del TOC
        const toc = map.getControlsByClass('TC.control.WorkLayerManager')[0];
        const mfi = map.getControlsByClass('TC.control.MultiFeatureInfo')[0];
        if (toc && mfi) {
          toc.div
            .querySelector('.' + toc.CLASS + '-content')
            .insertAdjacentElement('afterend', mfi.div);
          mfi.containerControl = toc;
        }

        //Aplicar clases CSS cuando se haga click en elementos definidos por configuración
        TC.Cfg.applyChanges([
          {
            map: map,
            screenCondition: '(max-width: 42em)',
            apply: {
              event: 'click',
              elements: [
                '.tc-ctl-bms-node > label',
                '.tc-ctl-meas-select sitna-tab',
                '.tc-ctl-mod-btn-select',
                '.tc-ctl-mod-btn-del-vertex'
              ],
              changes: [
                {
                  targets: '.' + TC.Consts.classes.TOOLS_PANEL,
                  classes: rcollapsedClass
                }
              ]
            }
          }
        ]);
      });

      // Observe results panel creation to attach dragging.
      attachResizablePanelDrag();
      const panelObserver = new MutationObserver(function () {
        attachResizablePanelDrag();
      });
      panelObserver.observe(map.div, { childList: true, subtree: true });

      SITNA.Consts.event.TOOLSCLOSE =
        SITNA.Consts.event.TOOLSCLOSE || 'toolsclose.tc';
      SITNA.Consts.event.TOOLSOPEN =
        SITNA.Consts.event.TOOLSOPEN || 'toolsopen.tc';

      map.on(SITNA.Consts.event.TOOLSOPEN, function (_e) {
        map.div
          .querySelector('.' + TC.Consts.classes.TOOLS_PANEL)
          .classList.remove(rcollapsedClass);
      });

      map.on(SITNA.Consts.event.TOOLSCLOSE, function (_e) {
        map.div
          .querySelector('.' + TC.Consts.classes.TOOLS_PANEL)
          .classList.add(rcollapsedClass);
      });

      if (TC.browserFeatures.touch()) {
        const addSwipe = function (direction) {
          const selector = '.tc-' + direction + '-panel';
          const className = 'tc-collapsed-' + direction;
          const options = {
            [direction]: function () {
              this.classList.add(className);
            }
          };
          map.div.querySelectorAll(selector).forEach(function (panel) {
            TC.Util.swipe(panel, options);
          });
        };
        addSwipe('right');
        addSwipe('left');
      }

      // Hide tabs if their corresponding controls are not enabled
      const leftPanel = map.div.querySelector(
        `.${TC.Consts.classes.LEFT_PANEL}`
      );
      if (leftPanel) {
        // Check for legend control - hide legend-tab if not present
        const legendControl = leftPanel.querySelector('.tc-ctl-legend');
        const legendTab = leftPanel.querySelector('#legend-tab');
        if (!legendControl && legendTab) {
          legendTab.classList.add('tc-hidden');
        }

        // Check for tool controls - hide tools-tab if none are present
        // Query for all elements marked with data-tools-tab attribute and check if SITNA has rendered controls into them
        const toolControlDivs = leftPanel.querySelectorAll('[data-tools-tab]');
        const toolsTab = leftPanel.querySelector('#tools-tab');
        const hasAnyToolControl = Array.from(toolControlDivs).some((div) => {
          // Check if SITNA has rendered a control into this div (div itself has tc-ctl class or has children with tc-ctl classes)
          return (
            div.classList.contains('tc-ctl') ||
            div.querySelector('.tc-ctl') !== null
          );
        });
        if (!hasAnyToolControl && toolsTab) {
          toolsTab.classList.add('tc-hidden');
        }

        // Add h2 click handling for expand/collapse of controls in tools tab
        leftPanel.addEventListener(SITNA.Consts.event.CLICK, function (e) {
          let tab = e.target;
          if (
            tab.tagName === 'BUTTON' &&
            tab.closest('div.tc-ctl.' + SITNA.Consts.classes.COLLAPSED)
          ) {
            tab = tab.parentElement;
          }
          if (tab.tagName === 'H2') {
            // Only handle h2 clicks when tools tab is active
            const toolsTab = leftPanel.querySelector('#tools-tab');
            const legend = leftPanel.querySelector('.tc-ctl-legend');
            const isToolsTabActive =
              toolsTab &&
              !toolsTab.classList.contains('tc-hidden') &&
              legend &&
              legend.classList.contains('tc-hidden');

            if (isToolsTabActive) {
              // Find the control that contains this h2
              for (var i = 0; i < map.controls.length; i++) {
                const ctl = map.controls[i];
                if (ctl.div && ctl.div.contains(tab)) {
                  if (ctl.isHighlighted()) {
                    ctl.unhighlight();
                  } else {
                    ctl.highlight();
                  }
                  break;
                }
              }
            }
          }
        });
      }
    });

    map._layoutDone = true;
  }
});
