"use strict";
(self["webpackChunkSITNA"] = self["webpackChunkSITNA"] || []).push([["TC_templates_tc-ctl-omm-dialog_mjs"],{

/***/ "./TC/templates/tc-ctl-omm-dialog.mjs":
/*!********************************************!*\
  !*** ./TC/templates/tc-ctl-omm-dialog.mjs ***!
  \********************************************/
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

  return "<div class=\"tc-ctl-omm-dialog tc-modal\">\r\n    <div class=\"tc-modal-background tc-modal-close\"></div>\r\n    <div class=\"tc-modal-window\">\r\n        <div class=\"tc-modal-header\">\r\n            <h3>"
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"newOfflineMap",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":5,"column":16},"end":{"line":5,"column":40}}}))
    + "</h3>\r\n            <div class=\"tc-modal-close\"></div>\r\n        </div>\r\n        <div class=\"tc-modal-body\">\r\n            <input type=\"text\" class=\"tc-ctl-omm-txt-name\" placeholder=\""
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"nameRequired",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":9,"column":72},"end":{"line":9,"column":95}}}))
    + "\" required />\r\n            <div class=\"tc-ctl-omm-bl-panel\">\r\n                <h4>"
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"availableOfflineMaps",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":11,"column":20},"end":{"line":11,"column":51}}}))
    + "</h4>\r\n                <p class=\"tc-ctl-omm-bl-panel-txt\">"
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"selectAtLeastOne",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":12,"column":51},"end":{"line":12,"column":78}}}))
    + "</p>\r\n                <ul class=\"tc-ctl-omm-bl-list\"></ul>\r\n            </div>\r\n            <div class=\"tc-ctl-omm-res-panel tc-hidden\">\r\n                <h4>"
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"maxRes",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":16,"column":20},"end":{"line":16,"column":37}}}))
    + "</h4>\r\n                <div class=\"tc-ctl-omm-res\"></div>\r\n                <input type=\"range\" class=\"tc-ctl-omm-rng-maxres\" disabled value=\"0\" title=\""
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"maxRes",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":18,"column":92},"end":{"line":18,"column":109}}}))
    + "\">\r\n            </div>\r\n            <div class=\"tc-ctl-omm-tile-count tc-hidden\"></div>\r\n        </div>\r\n        <div class=\"tc-modal-footer\">\r\n            <button type=\"button\" class=\"tc-button tc-modal-close tc-ctl-omm-btn-ok\" disabled>"
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"ok",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":23,"column":94},"end":{"line":23,"column":107}}}))
    + "</button>\r\n            <button type=\"button\" class=\"tc-button tc-modal-close tc-ctl-omm-btn-cancel\">"
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"cancel",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":24,"column":89},"end":{"line":24,"column":106}}}))
    + "</button>\r\n        </div>\r\n    </div>\r\n</div>\r\n";
},"useData":true});

/***/ })

}]);
//# sourceMappingURL=../maps/chunks/TC_templates_tc-ctl-omm-dialog_mjs.sitna.debug.js.map