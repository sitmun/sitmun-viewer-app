"use strict";
(self["webpackChunkSITNA"] = self["webpackChunkSITNA"] || []).push([["TC_templates_tc-ctl-prnmap_mjs"],{

/***/ "./TC/templates/tc-ctl-prnmap.mjs":
/*!****************************************!*\
  !*** ./TC/templates/tc-ctl-prnmap.mjs ***!
  \****************************************/
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

  return "<h2>"
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"print",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":1,"column":4},"end":{"line":1,"column":20}}}))
    + "</h2>\r\n<div>\r\n    <div class=\"tc-ctl-prnmap-div\">\r\n        <div class=\"tc-group tc-ctl-prnmap-cnt\">\r\n            <label>"
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"title",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":5,"column":19},"end":{"line":5,"column":35}}}))
    + ":</label><input type=\"text\" class=\"tc-ctl-prnmap-title tc-textbox\" maxlength=\"30\" placeholder=\""
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"mapTitle",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":5,"column":130},"end":{"line":5,"column":149}}}))
    + "\" />\r\n        </div>\r\n        <div class=\"tc-group tc-ctl-prnmap-cnt\">\r\n            <label>"
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"layout",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":8,"column":19},"end":{"line":8,"column":36}}}))
    + ":</label><select id=\"print-design\" class=\"tc-combo\">\r\n                <option value=\"landscape\">"
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"landscape",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":9,"column":42},"end":{"line":9,"column":62}}}))
    + "</option>\r\n                <option value=\"portrait\">"
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"portrait",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":10,"column":41},"end":{"line":10,"column":60}}}))
    + "</option>\r\n            </select>\r\n        </div>\r\n        <div class=\"tc-group tc-ctl-prnmap-cnt\">\r\n            <label>"
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"size",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":14,"column":19},"end":{"line":14,"column":34}}}))
    + ":</label><select id=\"print-size\" class=\"tc-combo\">\r\n                <option value=\"a4\">A4</option>\r\n                <option value=\"a3\">A3</option>\r\n            </select>\r\n        </div>\r\n        <div class=\"tc-group tc-ctl-prnmap-cnt tc-ctl-prnmap-cnt-btn\">\r\n            <label class=\"tc-ctl-prnmap-image-qr-label\" title=\""
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"createQrCodeToImage",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":20,"column":63},"end":{"line":20,"column":93}}}))
    + "\">\r\n                <input class=\"tc-toggle tc-ctl-prnmap-image-qr\" type=\"checkbox\" checked />\r\n                "
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"appendQRCode",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":22,"column":16},"end":{"line":22,"column":39}}}))
    + "\r\n            </label>\r\n            <button type=\"button\" class=\"tc-ctl-prnmap-btn tc-button tc-icon-button\" title=\""
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"printMap",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":24,"column":92},"end":{"line":24,"column":111}}}))
    + "\">"
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"print",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":24,"column":113},"end":{"line":24,"column":129}}}))
    + "</button>\r\n        </div>\r\n        <div class=\"tc-group tc-ctl-prnmap-cnt\">\r\n            <div class=\"tc-ctl-prnmap-alert tc-alert tc-alert-warning tc-hidden\">\r\n                <p>"
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"qrAdvice",true,{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":28,"column":19},"end":{"line":28,"column":43}}}))
    + "</p>\r\n            </div>\r\n        </div>\r\n    </div>\r\n</div>";
},"useData":true});

/***/ })

}]);
//# sourceMappingURL=../maps/chunks/TC_templates_tc-ctl-prnmap_mjs.sitna.debug.js.map