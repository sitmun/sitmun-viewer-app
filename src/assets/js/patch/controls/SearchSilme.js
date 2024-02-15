TC.control = TC.control || {};

if (!TC.control.Search) {
  TC.syncLoadJS(TC.apiLocation + 'TC/control/Search');
}

(function () {
  TC.control.SearchSilme = function () {
    var _ctl = this;

    TC.control.Search.apply(_ctl, arguments);
  };

  TC.inherit(TC.control.SearchSilme, TC.control.Search);

  TC.control.SearchSilme.prototype.register = function (map) {
    const self = this;

    self.template[self.CLASS] = "assets/js/patch/templates/SearchSilme.hbs";

    const result = TC.Control.prototype.register.call(self, map);

    return result;
  };
})();
