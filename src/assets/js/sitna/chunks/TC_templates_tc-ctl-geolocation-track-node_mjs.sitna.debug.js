"use strict";
(self["webpackChunkSITNA"] = self["webpackChunkSITNA"] || []).push([["TC_templates_tc-ctl-geolocation-track-node_mjs"],{

/***/ "./TC/templates/tc-ctl-geolocation-track-node.mjs":
/*!********************************************************!*\
  !*** ./TC/templates/tc-ctl-geolocation-track-node.mjs ***!
  \********************************************************/
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

  return "<li data-id=\""
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"id") : depth0), depth0))
    + "\" data-uid=\""
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"uid") : depth0), depth0))
    + "\">\r\n    <div class=\"tc-ctl-geolocation-tools-always\">\r\n        <sitna-button variant=\"link\" text=\""
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"name") : depth0), depth0))
    + "\"></sitna-button>\r\n        <input class=\"tc-textbox tc-hidden\" type=\"text\" value=\""
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"name") : depth0), depth0))
    + "\" />\r\n\r\n        <button type=\"button\" class=\"tc-btn-save tc-hidden\" title=\""
    + alias2(lookupProperty(helpers,"i18n").call(alias3,"save",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":6,"column":67},"end":{"line":6,"column":83}}}))
    + "\"></button>\r\n        <button type=\"button\" class=\"tc-btn-cancel tc-hidden\" title=\""
    + alias2(lookupProperty(helpers,"i18n").call(alias3,"tr.lst.cancel",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":7,"column":69},"end":{"line":7,"column":94}}}))
    + "\"></button>\r\n        <button type=\"button\" class=\"tc-btn-edit\" title=\""
    + alias2(lookupProperty(helpers,"i18n").call(alias3,"tr.lst.edit",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":8,"column":57},"end":{"line":8,"column":80}}}))
    + "\"></button>\r\n        <button type=\"button\" class=\"tc-btn-share\" title=\""
    + alias2(lookupProperty(helpers,"i18n").call(alias3,"tr.lst.share",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":9,"column":58},"end":{"line":9,"column":82}}}))
    + "\"></button>\r\n        <button type=\"button\" class=\"tc-btn-export\" title=\""
    + alias2(lookupProperty(helpers,"i18n").call(alias3,"tr.lst.download",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":10,"column":59},"end":{"line":10,"column":86}}}))
    + "\"></button>\r\n        <button type=\"button\" class=\"tc-btn-delete\" title=\""
    + alias2(lookupProperty(helpers,"i18n").call(alias3,"tr.lst.delete",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":11,"column":59},"end":{"line":11,"column":84}}}))
    + "\"></button>\r\n    </div>\r\n    <div class=\"tc-ctl-geolocation-tools-active\">\r\n        <div class=\"tc-ctl-geolocation-tools-sim\">\r\n            <button type=\"button\" class=\"tc-btn-stop\" title=\""
    + alias2(lookupProperty(helpers,"i18n").call(alias3,"tr.lst.stop",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":15,"column":61},"end":{"line":15,"column":84}}}))
    + "\"></button>\r\n            <button type=\"button\" class=\"tc-btn-pause tc-play\" title=\""
    + alias2(lookupProperty(helpers,"i18n").call(alias3,"tr.lst.start",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":16,"column":70},"end":{"line":16,"column":94}}}))
    + "\"></button>\r\n            <button type=\"button\" class=\"tc-btn-backward\" title=\""
    + alias2(lookupProperty(helpers,"i18n").call(alias3,"tr.lst.backward",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":17,"column":65},"end":{"line":17,"column":92}}}))
    + "\"></button>\r\n            <label class=\"tc-spn-speed\" title=\""
    + alias2(lookupProperty(helpers,"i18n").call(alias3,"tr.lst.velocity",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":18,"column":47},"end":{"line":18,"column":74}}}))
    + "\"></label>\r\n            <button type=\"button\" class=\"tc-btn-forward\" title=\""
    + alias2(lookupProperty(helpers,"i18n").call(alias3,"tr.lst.forward",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":19,"column":64},"end":{"line":19,"column":90}}}))
    + "\"></button>\r\n        </div>\r\n        <sitna-toggle class=\"tc-chk-track-visibility\" checked text=\""
    + alias2(lookupProperty(helpers,"i18n").call(alias3,"tr.lst.view",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":21,"column":68},"end":{"line":21,"column":91}}}))
    + "\" checked-icon-text=\"&#xe910;\" unchecked-icon-text=\"&#xe911;\"></sitna-toggle>\r\n    </div>\r\n</li>\r\n";
},"useData":true});

/***/ })

}]);
//# sourceMappingURL=../maps/chunks/TC_templates_tc-ctl-geolocation-track-node_mjs.sitna.debug.js.map