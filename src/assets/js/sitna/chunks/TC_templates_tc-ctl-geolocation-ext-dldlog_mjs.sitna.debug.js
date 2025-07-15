"use strict";
(self["webpackChunkSITNA"] = self["webpackChunkSITNA"] || []).push([["TC_templates_tc-ctl-geolocation-ext-dldlog_mjs"],{

/***/ "./TC/templates/tc-ctl-geolocation-ext-dldlog.mjs":
/*!********************************************************!*\
  !*** ./TC/templates/tc-ctl-geolocation-ext-dldlog.mjs ***!
  \********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var alias1=container.lambda, alias2=container.escapeExpression, alias3=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<div class=\"tc-ctl-geolocation-ext-dldlog tc-hidden\">\r\n    <label>\r\n        <input type=\"radio\" name=\""
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"controlId") : depth0), depth0))
    + "-dldlog-source\" value=\"track\" checked />\r\n        <span>"
    + alias2(lookupProperty(helpers,"i18n").call(alias3,"geo.profile.fromTrack.plural",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":4,"column":14},"end":{"line":4,"column":53}}}))
    + "</span>\r\n    </label>\r\n    <label>\r\n        <input type=\"radio\" name=\""
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"controlId") : depth0), depth0))
    + "-dldlog-source\" value=\"mdt\" />\r\n        <span title=\""
    + alias2(lookupProperty(helpers,"i18n").call(alias3,"mdt.title",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":8,"column":21},"end":{"line":8,"column":41}}}))
    + "\">"
    + alias2(lookupProperty(helpers,"i18n").call(alias3,"mdt",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":8,"column":43},"end":{"line":8,"column":57}}}))
    + "</span>\r\n    </label>\r\n</div>\r\n";
},"useData":true});

/***/ })

}]);
//# sourceMappingURL=../maps/chunks/TC_templates_tc-ctl-geolocation-ext-dldlog_mjs.sitna.debug.js.map