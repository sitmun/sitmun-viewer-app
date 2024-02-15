TC.control = TC.control || {};

if (!TC.control.FeatureInfo) {
  TC.syncLoadJS(TC.apiLocation + 'TC/control/FeatureInfo');
}

(function () {
  TC.control.FeatureInfoSilme = function () {
    var _ctl = this;

    TC.control.FeatureInfo.apply(_ctl, arguments);
  };

  TC.inherit(TC.control.FeatureInfoSilme, TC.control.FeatureInfo);

  TC.control.FeatureInfoSilme.prototype.register = function (map) {
    const self = this;

    self.template[self.CLASS] = "assets/js/patch/templates/FeatureInfoSilme.hbs";

    const result = TC.control.FeatureInfo.prototype.register.call(self, map);

    return result;
  };
})();
