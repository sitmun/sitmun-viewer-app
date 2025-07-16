TC.control = TC.control || {};

if (!TC.control.FeatureInfo) {
  TC.syncLoadJS(TC.apiLocation + 'TC/control/FeatureInfo');
}

// =============================================================================
// Constructor
// =============================================================================

TC.control.FeatureInfoSilme = function () {
  const _ctl = this;
  TC.control.FeatureInfo.apply(_ctl, arguments);
};

TC.inherit(TC.control.FeatureInfoSilme, TC.control.FeatureInfo);

// =============================================================================
// Definición de métodos para esta clase
// =============================================================================

(function () {
  const ctlProto = TC.control.FeatureInfoSilme.prototype;

  // Atributos
  ctlProto.CLASS = 'tc-ctl-finfo';

  // ===========================================================================
  // Función de renderizado
  // ===========================================================================

  ctlProto.render = async function (callback) {
    const _this = this;
    const result = await TC.control.FeatureInfo.prototype.render.call(_this, callback);
    return result;
  };


  ctlProto.loadTemplates = async function () {
    const _this = this;
    await TC.control.FeatureInfo.prototype.loadTemplates.call(_this);
    _this.template[_this.CLASS] = "assets/js/patch/templates/FeatureInfoSilme.hbs";
  };

  // ===========================================================================
  // Función de registro del componente
  // ===========================================================================

  ctlProto.register = async function (map) {
    const _this = this;
    const result = await TC.control.FeatureInfo.prototype.register.call(_this, map);
    return result;
  };

})();
