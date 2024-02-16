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

  TC.control.SearchSilme.prototype.render = function (callback) {
    const result = TC.control.Search.prototype.render.call(this, callback);
  };

  TC.control.SearchSilme.prototype.search = function (pattern, callback) {
    map.getControlsByClass('TC.control.Search')[1].allowedSearchTypes = map.getControlsByClass('TC.control.Search')[0].allowedSearchTypes;
    map.getControlsByClass('TC.control.Search')[1].availableSearchTypes = map.getControlsByClass('TC.control.Search')[0].availableSearchTypes;
    const control = map.getControlsByClass('TC.control.Search')[0];
    const result = TC.control.Search.prototype.search.call(control, pattern, callback);
  }

  TC.control.SearchSilme.prototype.getStringPattern = function (allowedRoles, pattern) {
    map.getControlsByClass('TC.control.Search')[0].searchRequestsAbortController = map.getControlsByClass('TC.control.Search')[1].searchRequestsAbortController;
    const result = TC.control.Search.prototype.getStringPattern.call(this, allowedRoles, pattern);
  }
})();
