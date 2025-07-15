"use strict";
(self["webpackChunkSITNA"] = self["webpackChunkSITNA"] || []).push([["TC_templates_tc-ctl-ss_mjs"],{

/***/ "./TC/templates/tc-ctl-ss.mjs":
/*!************************************!*\
  !*** ./TC/templates/tc-ctl-ss.mjs ***!
  \************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({"1":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.escapeExpression, alias2=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "    <option value=\""
    + alias1(container.lambda(depth0, depth0))
    + "\""
    + ((stack1 = lookupProperty(helpers,"if").call(alias2,lookupProperty(helpers,"eq").call(alias2,depth0,(depth0 != null ? lookupProperty(depth0,"scale") : depth0),{"name":"eq","hash":{},"data":data,"loc":{"start":{"line":3,"column":31},"end":{"line":3,"column":43}}}),{"name":"if","hash":{},"fn":container.program(2, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":3,"column":25},"end":{"line":3,"column":68}}})) != null ? stack1 : "")
    + ">1:"
    + alias1(lookupProperty(helpers,"round").call(alias2,depth0,{"name":"round","hash":{},"data":data,"loc":{"start":{"line":3,"column":71},"end":{"line":3,"column":82}}}))
    + "</option>\r\n";
},"2":function(container,depth0,helpers,partials,data) {
    return " selected=\"true\"";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<div class=\"ol-scale-line ol-unselectable\"><nobr><select>\r\n"
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,(depth0 != null ? lookupProperty(depth0,"scales") : depth0),{"name":"each","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":2,"column":0},"end":{"line":4,"column":9}}})) != null ? stack1 : "")
    + "</select> <input type=\"button\" value=\""
    + alias2(container.lambda((depth0 != null ? lookupProperty(depth0,"screenSize") : depth0), depth0))
    + "''\" title=\""
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"estimatedMapSize",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":5,"column":63},"end":{"line":5,"column":90}}}))
    + "\" /></nobr></div>";
},"useData":true});

/***/ })

}]);
//# sourceMappingURL=../maps/chunks/TC_templates_tc-ctl-ss_mjs.sitna.debug.js.map