TC.control = TC.control || {};

if (!TC.control.Search) {
  TC.syncLoadJS(TC.apiLocation + 'TC/control/Search');
}

// =============================================================================
// Constructor
// =============================================================================

TC.control.SearchSilme = function () {
  const _ctl = this;
  TC.control.Search.apply(_ctl, arguments);
};

TC.inherit(TC.control.SearchSilme, TC.control.Search);

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
    return result;
  };

  // ===========================================================================
  // Funciones públicas sobreescritas
  // ===========================================================================

  ctlProto.search = function (pattern, callback) {
    map.getControlsByClass('TC.control.Search')[1].allowedSearchTypes = map.getControlsByClass('TC.control.Search')[0].allowedSearchTypes;
    map.getControlsByClass('TC.control.Search')[1].availableSearchTypes = map.getControlsByClass('TC.control.Search')[0].availableSearchTypes;
    const control = map.getControlsByClass('TC.control.Search')[0];
    const result = TC.control.Search.prototype.search.call(control, pattern, callback);
  };

  ctlProto.getStringPattern = function (allowedRoles, pattern) {
    map.getControlsByClass('TC.control.Search')[0].searchRequestsAbortController = map.getControlsByClass('TC.control.Search')[1].searchRequestsAbortController;
    const result = TC.control.Search.prototype.getStringPattern.call(this, allowedRoles, pattern);
  };

})();
