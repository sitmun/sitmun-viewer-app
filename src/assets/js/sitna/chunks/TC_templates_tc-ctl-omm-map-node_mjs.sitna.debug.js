"use strict";
(self["webpackChunkSITNA"] = self["webpackChunkSITNA"] || []).push([["TC_templates_tc-ctl-omm-map-node_mjs"],{

/***/ "./TC/templates/tc-ctl-omm-map-node.mjs":
/*!**********************************************!*\
  !*** ./TC/templates/tc-ctl-omm-map-node.mjs ***!
  \**********************************************/
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

  return "<li data-extent=\""
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"extent") : depth0), depth0))
    + "\">\r\n    <span><a href=\""
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"url") : depth0), depth0))
    + "\" title=\""
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"name") : depth0), depth0))
    + "\">"
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"name") : depth0), depth0))
    + "</a></span>\r\n    <input class=\"tc-textbox tc-hidden\" type=\"text\" value=\""
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"name") : depth0), depth0))
    + "\" />\r\n    <button type=\"button\" class=\"tc-icon-btn tc-btn-save tc-hidden\" title=\""
    + alias2(lookupProperty(helpers,"i18n").call(alias3,"save",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":4,"column":75},"end":{"line":4,"column":90}}}))
    + "\"></button>\r\n    <button type=\"button\" class=\"tc-icon-btn tc-btn-cancel tc-hidden\" title=\""
    + alias2(lookupProperty(helpers,"i18n").call(alias3,"cancel",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":5,"column":77},"end":{"line":5,"column":94}}}))
    + "\"></button>\r\n    <button type=\"button\" class=\"tc-icon-btn tc-btn-edit\" title=\""
    + alias2(lookupProperty(helpers,"i18n").call(alias3,"editMapName",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":6,"column":65},"end":{"line":6,"column":87}}}))
    + "\">"
    + alias2(lookupProperty(helpers,"i18n").call(alias3,"editMapName",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":6,"column":89},"end":{"line":6,"column":111}}}))
    + "</button>\r\n    <button type=\"button\" class=\"tc-toggle tc-btn-view\" title=\""
    + alias2(lookupProperty(helpers,"i18n").call(alias3,"viewMapExtent",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":7,"column":63},"end":{"line":7,"column":87}}}))
    + "\">"
    + alias2(lookupProperty(helpers,"i18n").call(alias3,"viewMapExtent",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":7,"column":89},"end":{"line":7,"column":113}}}))
    + "</button>\r\n    <button type=\"button\" class=\"tc-icon-btn tc-btn-delete\" title=\""
    + alias2(lookupProperty(helpers,"i18n").call(alias3,"deleteMap",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":8,"column":67},"end":{"line":8,"column":87}}}))
    + "\">"
    + alias2(lookupProperty(helpers,"i18n").call(alias3,"deleteMap",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":8,"column":89},"end":{"line":8,"column":109}}}))
    + "</button>\r\n</li>\r\n";
},"useData":true});

/***/ })

}]);
//# sourceMappingURL=../maps/chunks/TC_templates_tc-ctl-omm-map-node_mjs.sitna.debug.js.map