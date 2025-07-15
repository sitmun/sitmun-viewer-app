"use strict";
(self["webpackChunkSITNA"] = self["webpackChunkSITNA"] || []).push([["TC_templates_tc-ctl-finfo-dialog_mjs"],{

/***/ "./TC/templates/tc-ctl-finfo-dialog.mjs":
/*!**********************************************!*\
  !*** ./TC/templates/tc-ctl-finfo-dialog.mjs ***!
  \**********************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({"1":function(container,depth0,helpers,partials,data) {
    var lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<img src=\""
    + container.escapeExpression(container.lambda((depth0 != null ? lookupProperty(depth0,"src") : depth0), depth0))
    + "\" />";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<div class=\"tc-ctl-finfo-dialog tc-ctl-finfo-img-dialog tc-modal tc-hidden\">\r\n    <div class=\"tc-modal-background tc-modal-close\"></div>\r\n    <div class=\"tc-modal-img\">"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"src") : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":3,"column":30},"end":{"line":3,"column":69}}})) != null ? stack1 : "")
    + "</div>\r\n</div>\r\n<div class=\"tc-ctl-finfo-dialog tc-ctl-finfo-share-dialog tc-modal tc-hidden\">\r\n    <div class=\"tc-modal-background tc-modal-close\"></div>\r\n    <div class=\"tc-modal-window\">\r\n        <div class=\"tc-modal-header\">\r\n            <h3>"
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"shareQuery",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":9,"column":16},"end":{"line":9,"column":37}}}))
    + "</h3>\r\n            <div class=\"tc-modal-close\"></div>\r\n        </div>\r\n        <div class=\"tc-modal-body\">\r\n            <div class=\"tc-ctl-finfo-share-dialog-ctl\"></div>\r\n        </div>\r\n        <div class=\"tc-modal-footer\">\r\n            <button type=\"button\" class=\"tc-button tc-modal-close\">"
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"close",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":16,"column":67},"end":{"line":16,"column":83}}}))
    + "</button>\r\n        </div>\r\n    </div>\r\n</div>\r\n";
},"useData":true});

/***/ })

}]);
//# sourceMappingURL=../maps/chunks/TC_templates_tc-ctl-finfo-dialog_mjs.sitna.debug.js.map