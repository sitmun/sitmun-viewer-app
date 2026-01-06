
document.querySelectorAll('.tc-map').forEach(function (elm) {
    const map = TC.Map.get(elm);

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
                    var clickedElems = elem.elements instanceof Array ? elem.elements : [elem.elements];
                    map = item.map || map || TC.Map.get(document.querySelector('.tc-map'));
                    map.div.addEventListener(elem.event, TC.EventTarget.listenerBySelector(clickedElems.join(), function () {
                        if (window.matchMedia(item.screenCondition).matches) { // si es una pantalla estrecha
                            elem.changes.forEach(function (change) {
                                var targets = Array.isArray(change.targets) ? change.targets : [change.targets];
                                var classes = Array.isArray(change.classes) ? change.classes : [change.classes];

                                map.div.querySelectorAll(targets.join()).forEach(function (elm) {
                                    classes.forEach(function (cls) {
                                        elm.classList.add(cls);
                                    });
                                });
                            });
                        }
                    }));
                });
            }
        };

        // En pantalla estrecha cambiamos el método de mostrar GFI.
        if (window.matchMedia('screen and (max-width: 40em), screen and (max-height: 40em)').matches) {
            map.defaultInfoContainer = SITNA.Consts.infoContainer.RESULTS_PANEL;
        }

        map.ready(function () {
            // Colapsamos los controles de tipo web component, porque no los podemos colapsar por markup
            map.controls.forEach(c => {
                if (c instanceof HTMLElement) {
                    if (c.parentElement && c.parentElement.classList.contains(SITNA.Consts.classes.COLLAPSED)) {
                        c.classList.add(SITNA.Consts.classes.COLLAPSED);
                    }
                }
            });

            /* --- LEGACY --- */
            const ovPanel = map.div.querySelector(`.${TC.Consts.classes.OVERVIEW_MAP_PANEL},.ovmap-panel`);
            const rcollapsedClass = TC.Consts.classes.COLLAPSED_RIGHT || 'right-collapsed';
            const lcollapsedClass = TC.Consts.classes.COLLAPSED_LEFT || 'left-collapsed';

            const ovmap = map.getControlsByClass('TC.control.OverviewMap')[0];

            map.div.querySelectorAll(/* --- LEGACY --- */`.${TC.Consts.classes.RIGHT_PANEL} > h1, .right-panel > h1`).forEach(function (elm) {
                elm.addEventListener(SITNA.Consts.event.CLICK, function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    const tab = e.target;
                    const panel = tab.parentElement;
                    const isCollapsed = panel.classList.toggle(rcollapsedClass);
                    if (map && panel === ovPanel) {
                        if (ovmap) {
                            if (isCollapsed) {
                                ovmap.disable();
                            }
                            else {
                                setTimeout(function () {
                                    ovmap.enable();
                                }, 250);
                            }
                        }
                    }
                });
            });

            map.div.querySelectorAll(`.${TC.Consts.classes.LEFT_PANEL} > h1`).forEach(function (h1) {
                h1.addEventListener(SITNA.Consts.event.CLICK, function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    const tab = e.target;
                    const panel = tab.parentElement;
                    const tabId = tab.id;
                    
                    // Get legend and download elements
                    const legend = panel.querySelector('.tc-ctl-legend');
                    const download = panel.querySelector('.tc-ctl-download');
                    
                    // Get tab h1 elements
                    const legendTab = panel.querySelector('#legend-tab');
                    const toolsTab = panel.querySelector('#tools-tab');
                    
                    // Handle tab switching for legend-tab and tools-tab
                    if (tabId === 'legend-tab' || tabId === 'tools-tab') {
                        // Toggle panel collapse
                        const isCollapsed = panel.classList.toggle(lcollapsedClass);
                        
                        if (!isCollapsed) {
                            
                            if (tabId === 'legend-tab') {
                                // Show legend, hide download
                                if (legend) legend.classList.remove('tc-hidden');
                                if (download) download.classList.add('tc-hidden');
                                // Hide tools-tab h1, show legend-tab h1
                                if (toolsTab) toolsTab.classList.add('tc-hidden');
                                if (legendTab) legendTab.classList.remove('tc-hidden');
                            } else if (tabId === 'tools-tab') {
                                // Show download, hide legend
                                if (download) download.classList.remove('tc-hidden');
                                if (legend) legend.classList.add('tc-hidden');
                                // Hide legend-tab h1, show tools-tab h1
                                if (legendTab) legendTab.classList.add('tc-hidden');
                                if (toolsTab) toolsTab.classList.remove('tc-hidden');
                            }
                        } else {
                            // Panel is collapsing - show tabs only if their controls exist
                            if (legendTab && legend) {
                                legendTab.classList.remove('tc-hidden');
                            }
                            if (toolsTab && download) {
                                toolsTab.classList.remove('tc-hidden');
                            }
                            // Show both controls when collapsed (if they exist)
                            if (legend) legend.classList.remove('tc-hidden');
                            if (download) download.classList.remove('tc-hidden');
                        }
                    } else {
                        // For other tabs, just toggle collapse
                        const isCollapsed = panel.classList.toggle(lcollapsedClass);
                    }
                });
            });

            // Hide tabs if their corresponding controls are not enabled
            const leftPanel = map.div.querySelector(`.${TC.Consts.classes.LEFT_PANEL}`);
            if (leftPanel) {
                // Check for legend control - hide legend-tab if not present
                const legendControl = leftPanel.querySelector('.tc-ctl-legend');
                const legendTab = leftPanel.querySelector('#legend-tab');
                if (!legendControl && legendTab) {
                    legendTab.classList.add('tc-hidden');
                }

                // Check for tool controls - hide tools-tab if none are present
                // Currently checks for download, but can be extended for future tool controls
                const downloadControl = leftPanel.querySelector('.tc-ctl-download');
                // Future tool controls can be added here, e.g.:
                // const otherToolControl = leftPanel.querySelector('.tc-ctl-other-tool');
                
                const toolsTab = leftPanel.querySelector('#tools-tab');
                const hasAnyToolControl = downloadControl; // Add || otherToolControl for future controls
                if (!hasAnyToolControl && toolsTab) {
                    toolsTab.classList.add('tc-hidden');
                }
            }

            /* --- LEGACY --- */
            const toolsPanel = map.div.querySelector('.' + TC.Consts.classes.TOOLS_PANEL) || map.div.querySelector('#tools-panel');

            const collapseExceptions = map
                .getControlsByClass(TC.control.Search)
                .concat(map.getControlsByClass(TC.control.LanguageSelector))
                .concat(map.controls.filter(c => c.containerControl))
                .map(c => c.id)
                .filter(id => toolsPanel.querySelector('#' + id));

            const toggleCollapsed = function (value) {
                const self = this;
                let element;
                if (self instanceof TC.control.WebComponentControl) {
                    element = self;
                }
                else {
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
                        const toolPanelControls = map
                            .controls
                            .filter(ctl => !ctl.containerControl)
                            .filter(ctl => ctl.div && toolsPanel.contains(ctl.div));
                        if (toolPanelControls.includes(ctl)) {
                            toolPanelControls
                                .filter(c => c !== ctl)
                                .forEach(ctl => ctl.unhighlight());
                        }
                    }
                })
                .on(SITNA.Consts.event.CONTROLUNHIGHLIGHT, function (e) {
                    const ctl = e.control;
                    toggleCollapsed.call(ctl, true);
                });

            toolsPanel.addEventListener(SITNA.Consts.event.CLICK, function (e) {
                let tab = e.target;
                if (tab.tagName === "BUTTON" && tab.closest("div.tc-ctl." + SITNA.Consts.classes.COLLAPSED)) {
                    tab = tab.parentElement;
                }
                if (tab.tagName === ('H2')) {
                    for (var i = 0; i < map.controls.length; i++) {
                        const ctl = map.controls[i];
                        if (ctl.div && ctl.div.contains(tab)) {
                            if (ctl.isHighlighted()) {
                                ctl.unhighlight();
                            }
                            else {
                                ctl.highlight();
                            }
                            break;
                        }
                    }
                }
            });          


            map.loaded(function () {

                const ovmap = map.getControlsByClass('TC.control.OverviewMap')[0];
                if (ovmap) {
                    ovmap.loaded(function () {
                        ovmap.disable();
                    });
                }
                //mover el Multifeature info dentro del TOC
                const toc = map.getControlsByClass('TC.control.WorkLayerManager')[0];
                const mfi = map.getControlsByClass('TC.control.MultiFeatureInfo')[0];
                if (toc && mfi) {
                    toc.div.querySelector('.' + toc.CLASS + '-content').insertAdjacentElement('afterend', mfi.div);
                    mfi.containerControl = toc;
                }

                //Aplicar clases CSS cuando se haga click en elementos definidos por configuración
                TC.Cfg.applyChanges([
                    {
                        "map": map,
                        "screenCondition": "(max-width: 42em)",
                        "apply": {
                            "event": "click",
                            "elements": [
                                ".tc-ctl-bms-node > label",
                                ".tc-ctl-meas-select sitna-tab",
                                ".tc-ctl-mod-btn-select",
                                ".tc-ctl-mod-btn-del-vertex"
                            ],
                            "changes": [
                                {
                                    "targets": '.' + TC.Consts.classes.TOOLS_PANEL,
                                    "classes": rcollapsedClass
                                }
                            ]
                        }
                    }
                ]);
            });

            SITNA.Consts.event.TOOLSCLOSE = SITNA.Consts.event.TOOLSCLOSE || 'toolsclose.tc';
            SITNA.Consts.event.TOOLSOPEN = SITNA.Consts.event.TOOLSOPEN || 'toolsopen.tc';

            map.on(SITNA.Consts.event.TOOLSOPEN, function (_e) {
                map.div.querySelector('.' + TC.Consts.classes.TOOLS_PANEL).classList.remove(rcollapsedClass);
            });

            map.on(SITNA.Consts.event.TOOLSCLOSE, function (_e) {
                map.div.querySelector('.' + TC.Consts.classes.TOOLS_PANEL).classList.add(rcollapsedClass);
            });

            if (TC.browserFeatures.touch()) {
                const addSwipe = function (direction) {
                    const selector = '.tc-' + direction + '-panel';
                    const className = 'tc-collapsed-' + direction;
                    const options = { noSwipe: 'li,a' };
                    options[direction] = function () {
                        this.classList.add(className);
                    };
                    map.div.querySelectorAll(selector).forEach(function (panel) {
                        TC.Util.swipe(panel, options);
                    });
                };
                addSwipe('right');
                addSwipe('left');
            }
        });
    }
    map._layoutDone = true;
});

