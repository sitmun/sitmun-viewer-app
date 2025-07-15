"use strict";
(self["webpackChunkSITNA"] = self["webpackChunkSITNA"] || []).push([["TC_templates_tc-ctl-legend_mjs"],{

/***/ "./TC/templates/tc-ctl-legend.mjs":
/*!****************************************!*\
  !*** ./TC/templates/tc-ctl-legend.mjs ***!
  \****************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({"1":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = container.invokePartial(lookupProperty(partials,"tc-ctl-legend-node"),depth0,{"name":"tc-ctl-legend-node","data":data,"indent":"        ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"3":function(container,depth0,helpers,partials,data) {
    var lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "        <li class=\"tc-ctl-legend-empty\">"
    + container.escapeExpression(lookupProperty(helpers,"i18n").call(depth0 != null ? depth0 : (container.nullContext || {}),"noData",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":7,"column":40},"end":{"line":7,"column":57}}}))
    + "</li>\r\n";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<h2>"
    + container.escapeExpression(lookupProperty(helpers,"i18n").call(alias1,"legend",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":1,"column":4},"end":{"line":1,"column":21}}}))
    + "</h2>\r\n<div class=\"tc-ctl-legend-tree\">\r\n    <ul class=\"tc-ctl-legend-branch\">\r\n"
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,(depth0 != null ? lookupProperty(depth0,"workLayers") : depth0),{"name":"each","hash":{},"fn":container.program(1, data, 0),"inverse":container.program(3, data, 0),"data":data,"loc":{"start":{"line":4,"column":8},"end":{"line":8,"column":17}}})) != null ? stack1 : "")
    + "    </ul>\r\n</div>";
},"usePartial":true,"useData":true});

/***/ })

}]);
//# sourceMappingURL=../maps/chunks/TC_templates_tc-ctl-legend_mjs.sitna.debug.js.map