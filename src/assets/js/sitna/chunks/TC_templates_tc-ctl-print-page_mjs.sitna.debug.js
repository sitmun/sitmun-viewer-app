"use strict";
(self["webpackChunkSITNA"] = self["webpackChunkSITNA"] || []).push([["TC_templates_tc-ctl-print-page_mjs"],{

/***/ "./TC/templates/tc-ctl-print-page.mjs":
/*!********************************************!*\
  !*** ./TC/templates/tc-ctl-print-page.mjs ***!
  \********************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.lambda, alias2=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<!DOCTYPE html>\r\n<html xmlns=\"http://www.w3.org/1999/xhtml\">\r\n<head>\r\n    <title>"
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"title") : depth0), depth0))
    + "</title>\r\n    <link rel=\"stylesheet\" href=\""
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"cssUrl") : depth0), depth0))
    + "\" />\r\n</head>\r\n<body onload=\"print()\" class=\"tc-ctl-print-page\">\r\n    <h1>"
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"title") : depth0), depth0))
    + "</h1>\r\n    "
    + ((stack1 = alias1((depth0 != null ? lookupProperty(depth0,"content") : depth0), depth0)) != null ? stack1 : "")
    + "\r\n</body>\r\n</html>\r\n";
},"useData":true});

/***/ })

}]);
//# sourceMappingURL=../maps/chunks/TC_templates_tc-ctl-print-page_mjs.sitna.debug.js.map