(function() {
  console.log('[SearchSilme] Patch loading...');
  
  // Execution guard: prevent duplicate execution
  if (typeof window.__patchesLoaded === 'undefined') {
    window.__patchesLoaded = {};
  }
  if (window.__patchesLoaded.SearchSilme) {
    console.log('[SearchSilme] Patch already loaded, skipping');
    return;
  }

TC.control = TC.control || {};

if (!TC.control.Search) {
  console.log('[SearchSilme] Loading TC.control.Search...');
  TC.syncLoadJS(TC.apiLocation + 'TC/control/Search');
}

// =============================================================================
// Constructor
// =============================================================================

TC.control.SearchSilme = function () {
  console.log('[SearchSilme] Constructor called with arguments:', arguments);
  const _ctl = this;
  TC.control.Search.apply(_ctl, arguments);
};

TC.inherit(TC.control.SearchSilme, TC.control.Search);

console.log('[SearchSilme] Control class defined');

// =============================================================================
// Definición de métodos para esta clase
// =============================================================================

(function () {
  const ctlProto = TC.control.SearchSilme.prototype;

  // Atributos
  ctlProto.CLASS = 'tc-ctl-search';

  // ===========================================================================
  // Función de renderizado
  // ===========================================================================

  ctlProto.render = async function (callback) {
    const _this = this;
    const result = await TC.control.Search.prototype.render.call(_this, callback);
    return _this;
  };

  ctlProto.loadTemplates = async function () {
    const _this = this;
    await TC.control.Search.prototype.loadTemplates.call(_this);
    _this.template[_this.CLASS] = "assets/js/patch/templates/SearchSilme.hbs";
  };

  // ===========================================================================
  // Función de registro del componente
  // ===========================================================================

  ctlProto.register = async function (map) {
    const _this = this;
    const result = await TC.control.Search.prototype.register.call(_this, map);
    
    console.log('[SearchSilme] Registered control, div:', _this.div?.id);
    // Parent TC.control.Search already handles button clicks
    // No need to add custom handler since SearchSilme extends Search
    
    return result;
  };

  // ===========================================================================
  // Funciones públicas sobreescritas
  // ===========================================================================

  ctlProto.search = function (pattern, callback) {
    const _this = this;
    const map = _this.map;
    
    if (!map) {
      console.error('[SearchSilme] Map not available');
      return TC.control.Search.prototype.search.call(_this, pattern, callback);
    }
    
    const searchControls = map.getControlsByClass('TC.control.Search');
    console.log('[SearchSilme] Search controls found:', searchControls.length);
    
    if (searchControls.length < 2) {
      console.warn('[SearchSilme] Expected 2 Search controls, found:', searchControls.length, '- falling back to native behavior');
      return TC.control.Search.prototype.search.call(_this, pattern, callback);
    }
    
    // Sync search types between controls
    searchControls[1].allowedSearchTypes = searchControls[0].allowedSearchTypes;
    searchControls[1].availableSearchTypes = searchControls[0].availableSearchTypes;
    
    // Execute search on native control
    const control = searchControls[0];
    return TC.control.Search.prototype.search.call(control, pattern, callback);
  };

  ctlProto.getStringPattern = function (allowedRoles, pattern) {
    const _this = this;
    const map = _this.map;
    
    if (!map) {
      console.error('[SearchSilme] Map not available in getStringPattern');
      return TC.control.Search.prototype.getStringPattern.call(_this, allowedRoles, pattern);
    }
    
    const searchControls = map.getControlsByClass('TC.control.Search');
    if (searchControls.length >= 2) {
      searchControls[0].searchRequestsAbortController = searchControls[1].searchRequestsAbortController;
    }
    
    return TC.control.Search.prototype.getStringPattern.call(_this, allowedRoles, pattern);
  };

})();

  // Mark patch as loaded
  window.__patchesLoaded.SearchSilme = true;
  console.log('[SearchSilme] Patch loaded successfully, TC.control.SearchSilme:', typeof TC.control.SearchSilme);
})();
