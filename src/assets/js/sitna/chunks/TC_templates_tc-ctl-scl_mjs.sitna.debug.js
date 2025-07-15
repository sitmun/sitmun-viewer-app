"use strict";
(self["webpackChunkSITNA"] = self["webpackChunkSITNA"] || []).push([["TC_templates_tc-ctl-scl_mjs"],{

/***/ "./TC/templates/tc-ctl-scl.mjs":
/*!*************************************!*\
  !*** ./TC/templates/tc-ctl-scl.mjs ***!
  \*************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<div class=\"ol-scale-line ol-unselectable\"><span>1:"
    + alias2(lookupProperty(helpers,"round").call(alias1,(depth0 != null ? lookupProperty(depth0,"scale") : depth0),{"name":"round","hash":{},"data":data,"loc":{"start":{"line":1,"column":51},"end":{"line":1,"column":66}}}))
    + "</span> <input type=\"button\" value=\""
    + alias2(container.lambda((depth0 != null ? lookupProperty(depth0,"screenSize") : depth0), depth0))
    + "''\" title=\""
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"estimatedMapSize",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":1,"column":127},"end":{"line":1,"column":154}}}))
    + "\" /></div>";
},"useData":true});

/***/ })

}]);
//# sourceMappingURL=../maps/chunks/TC_templates_tc-ctl-scl_mjs.sitna.debug.js.map