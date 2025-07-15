"use strict";
(self["webpackChunkSITNA"] = self["webpackChunkSITNA"] || []).push([["TC_templates_tc-ctl-share-dialog_mjs"],{

/***/ "./TC/templates/tc-ctl-share-dialog.mjs":
/*!**********************************************!*\
  !*** ./TC/templates/tc-ctl-share-dialog.mjs ***!
  \**********************************************/
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

  return "<div class=\"tc-ctl-share-qr-dialog tc-modal\">\r\n    <div class=\"tc-modal-background tc-modal-close\"></div>\r\n    <div class=\"tc-modal-window\">\r\n        <div class=\"tc-modal-header\">\r\n            <h3>"
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"qrCode",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":5,"column":16},"end":{"line":5,"column":33}}}))
    + "</h3>\r\n            <div class=\"tc-modal-close\"></div>\r\n        </div>\r\n        <div class=\"tc-modal-body\">\r\n            <div class=\"tc-ctl-share-qrcode\"></div>      \r\n            <div class=\"tc-ctl-share-qr-alert tc-alert tc-alert-warning tc-hidden\">\r\n                <p>"
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"qrAdvice",true,{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":11,"column":19},"end":{"line":11,"column":43}}}))
    + "</p>\r\n            </div>\r\n        </div>\r\n        <div class=\"tc-modal-footer\">\r\n            <button type=\"button\" class=\"tc-button tc-modal-close\">"
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"close",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":15,"column":67},"end":{"line":15,"column":83}}}))
    + "</button>\r\n        </div>\r\n    </div>\r\n</div>\r\n";
},"useData":true});

/***/ })

}]);
//# sourceMappingURL=../maps/chunks/TC_templates_tc-ctl-share-dialog_mjs.sitna.debug.js.map