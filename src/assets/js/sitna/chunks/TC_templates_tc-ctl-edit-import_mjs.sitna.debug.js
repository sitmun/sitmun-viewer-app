"use strict";
(self["webpackChunkSITNA"] = self["webpackChunkSITNA"] || []).push([["TC_templates_tc-ctl-edit-import_mjs"],{

/***/ "./TC/templates/tc-ctl-edit-import.mjs":
/*!*********************************************!*\
  !*** ./TC/templates/tc-ctl-edit-import.mjs ***!
  \*********************************************/
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

  return "\r\n"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"tc-ctl-edit-import-layer"),depth0,{"name":"tc-ctl-edit-import-layer","data":data,"indent":"                ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "            ";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<div class=\"tc-ctl-edit-import\">\r\n    <div class=\"tc-ctl-edit-import-list\">\r\n        <ul class=\"tc-layers\">"
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,(depth0 != null ? lookupProperty(depth0,"layers") : depth0),{"name":"each","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":3,"column":30},"end":{"line":5,"column":21}}})) != null ? stack1 : "")
    + "</ul>\r\n        <p class=\"tc-ctl-edit-import-empty-note\">"
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"thereAreNoCompatibleFeatures",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":6,"column":49},"end":{"line":6,"column":88}}}))
    + "</p>\r\n    </div>\r\n    <div class=\"tc-ctl-edit-import-foot\">\r\n        <button type=\"button\" class=\"tc-button tc-ctl-edit-import-btn-ok\">"
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"ok",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":9,"column":74},"end":{"line":9,"column":87}}}))
    + "</button>\r\n    </div>\r\n</div>\r\n";
},"usePartial":true,"useData":true});

/***/ })

}]);
//# sourceMappingURL=../maps/chunks/TC_templates_tc-ctl-edit-import_mjs.sitna.debug.js.map