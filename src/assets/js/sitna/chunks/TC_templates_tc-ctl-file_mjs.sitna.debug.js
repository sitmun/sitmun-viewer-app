"use strict";
(self["webpackChunkSITNA"] = self["webpackChunkSITNA"] || []).push([["TC_templates_tc-ctl-file_mjs"],{

/***/ "./TC/templates/tc-ctl-file.mjs":
/*!**************************************!*\
  !*** ./TC/templates/tc-ctl-file.mjs ***!
  \**************************************/
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

  return ((stack1 = lookupProperty(helpers,"unless").call(depth0 != null ? depth0 : (container.nullContext || {}),(data && lookupProperty(data,"first")),{"name":"unless","hash":{},"fn":container.program(2, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":5,"column":163},"end":{"line":5,"column":193}}})) != null ? stack1 : "")
    + "."
    + container.escapeExpression(container.lambda(depth0, depth0));
},"2":function(container,depth0,helpers,partials,data) {
    return ",";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<h2>"
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"openFile",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":1,"column":4},"end":{"line":1,"column":23}}}))
    + "</h2>\r\n<div>\r\n    <p>"
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"fileImport.instructions",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":3,"column":7},"end":{"line":3,"column":41}}}))
    + "</p>\r\n    <div class=\"tc-ctl-file-open\">\r\n        <label class=\"tc-button tc-ctl-file-open-label tc-icon-button\"><input type=\"file\" class=\"tc-ctl-file-open-ipt tc-button\" multiple accept=\""
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,(depth0 != null ? lookupProperty(depth0,"formats") : depth0),{"name":"each","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":5,"column":146},"end":{"line":5,"column":211}}})) != null ? stack1 : "")
    + "\" />"
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"openFile",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":5,"column":215},"end":{"line":5,"column":234}}}))
    + "</label>\r\n    </div>\r\n    <ul class=\"tc-ctl-file-recent tc-list\"></ul>\r\n</div>\r\n";
},"useData":true});

/***/ })

}]);
//# sourceMappingURL=../maps/chunks/TC_templates_tc-ctl-file_mjs.sitna.debug.js.map