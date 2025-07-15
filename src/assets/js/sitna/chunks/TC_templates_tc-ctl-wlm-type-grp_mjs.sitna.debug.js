"use strict";
(self["webpackChunkSITNA"] = self["webpackChunkSITNA"] || []).push([["TC_templates_tc-ctl-wlm-type-grp_mjs"],{

/***/ "./TC/templates/tc-ctl-wlm-type-grp.mjs":
/*!**********************************************!*\
  !*** ./TC/templates/tc-ctl-wlm-type-grp.mjs ***!
  \**********************************************/
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

  return ((stack1 = container.invokePartial(lookupProperty(partials,"tc-ctl-wlm-type-grp-node"),depth0,{"name":"tc-ctl-wlm-type-grp-node","data":data,"indent":"    ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<div>"
    + container.escapeExpression(lookupProperty(helpers,"i18n").call(alias1,"groupLayerThatContains",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":1,"column":5},"end":{"line":1,"column":38}}}))
    + ":</div>\r\n<ul>\r\n"
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,(depth0 != null ? lookupProperty(depth0,"Layer") : depth0),{"name":"each","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":3,"column":4},"end":{"line":5,"column":13}}})) != null ? stack1 : "")
    + "</ul>";
},"usePartial":true,"useData":true});

/***/ })

}]);
//# sourceMappingURL=../maps/chunks/TC_templates_tc-ctl-wlm-type-grp_mjs.sitna.debug.js.map