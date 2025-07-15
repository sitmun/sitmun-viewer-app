"use strict";
(self["webpackChunkSITNA"] = self["webpackChunkSITNA"] || []).push([["TC_templates_tc-ctl-share_mjs"],{

/***/ "./TC/templates/tc-ctl-share.mjs":
/*!***************************************!*\
  !*** ./TC/templates/tc-ctl-share.mjs ***!
  \***************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.escapeExpression, alias3=container.lambda, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<h2>"
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"share",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":1,"column":4},"end":{"line":1,"column":20}}}))
    + "</h2>\r\n<div>\r\n    <div class=\"tc-ctl-share-icons\">\r\n        <sitna-button variant=\"minimal\" class=\"tc-ctl-share-btn-email\" text=\""
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"sendMapByEmail",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":4,"column":77},"end":{"line":4,"column":102}}}))
    + "\"></sitna-button>\r\n        <sitna-button variant=\"minimal\" class=\"tc-ctl-share-btn-qr\" text=\""
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"createQrCode",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":5,"column":74},"end":{"line":5,"column":97}}}))
    + "\"></sitna-button>\r\n        <sitna-button variant=\"minimal\" class=\"tc-ctl-share-btn-facebook\" text=\""
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"shareMapToFacebook",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":6,"column":80},"end":{"line":6,"column":109}}}))
    + "\"></sitna-button>\r\n        <sitna-button variant=\"minimal\" class=\"tc-ctl-share-btn-twitter\" text=\""
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"shareMapToTwitter",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":7,"column":79},"end":{"line":7,"column":107}}}))
    + "\"></sitna-button>\r\n        <sitna-button variant=\"minimal\" class=\"tc-ctl-share-btn-whatsapp\" text=\""
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"shareMapToWhatsapp",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":8,"column":80},"end":{"line":8,"column":109}}}))
    + "\"></sitna-button>\r\n        <sitna-button variant=\"minimal\" class=\"tc-ctl-share-btn-bookmark\" text=\""
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"addToBookmarks",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":9,"column":80},"end":{"line":9,"column":105}}}))
    + "\"></sitna-button>\r\n    </div>\r\n    <div class=\"tc-ctl-share-select\">\r\n        <sitna-tab class=\"tc-ctl-share-select-url\" text=\""
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"shareLink",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":12,"column":57},"end":{"line":12,"column":77}}}))
    + "\" title=\""
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"shareLink",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":12,"column":86},"end":{"line":12,"column":106}}}))
    + "\" selected group=\""
    + alias2(alias3((depth0 != null ? lookupProperty(depth0,"controlId") : depth0), depth0))
    + "-format\" for=\""
    + alias2(alias3((depth0 != null ? lookupProperty(depth0,"controlId") : depth0), depth0))
    + "-format-url\"></sitna-tab>\r\n        <sitna-tab class=\"tc-ctl-share-select-iframe\" text=\""
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"embedMap",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":13,"column":60},"end":{"line":13,"column":79}}}))
    + "\" title=\""
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"embedMap",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":13,"column":88},"end":{"line":13,"column":107}}}))
    + "\" group=\""
    + alias2(alias3((depth0 != null ? lookupProperty(depth0,"controlId") : depth0), depth0))
    + "-format\" for=\""
    + alias2(alias3((depth0 != null ? lookupProperty(depth0,"controlId") : depth0), depth0))
    + "-format-iframe\"></sitna-tab>\r\n    </div>\r\n    <div id=\""
    + alias2(alias3((depth0 != null ? lookupProperty(depth0,"controlId") : depth0), depth0))
    + "-format-url\" class=\"tc-ctl-share-url-box tc-group tc-url\">\r\n        <input type=\"text\" class=\"tc-textbox tc-url\" readonly data-toggle=\"tooltip\" data-placement=\"top\" title=\""
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"shareLink.tip.1",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":16,"column":112},"end":{"line":16,"column":138}}}))
    + "\" />\r\n        <button type=\"button\" class=\"tc-button hide tc-ctl-share-btn-shorten\" title=\""
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"shareLink.tip.3",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":17,"column":85},"end":{"line":17,"column":111}}}))
    + "\">"
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"shorten",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":17,"column":113},"end":{"line":17,"column":131}}}))
    + "</button>\r\n        <button type=\"button\" class=\"tc-button hide tc-ctl-share-btn-copy\" title=\""
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"shareLink.tip.2",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":18,"column":82},"end":{"line":18,"column":108}}}))
    + "\">"
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"copy",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":18,"column":110},"end":{"line":18,"column":125}}}))
    + "</button>\r\n    </div>\r\n    <div id=\""
    + alias2(alias3((depth0 != null ? lookupProperty(depth0,"controlId") : depth0), depth0))
    + "-format-iframe\" class=\"tc-ctl-share-url-box tc-group tc-iframe tc-hidden\">\r\n        <input type=\"text\" class=\"tc-textbox tc-iframe\" readonly data-toggle=\"tooltip\" data-placement=\"top\" title=\""
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"embedMap.tip.1",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":21,"column":115},"end":{"line":21,"column":140}}}))
    + "\" />\r\n        <button type=\"button\" class=\"tc-button hide\" title=\""
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"embedMap.tip.2",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":22,"column":60},"end":{"line":22,"column":85}}}))
    + "\">"
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"copy",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":22,"column":87},"end":{"line":22,"column":102}}}))
    + "</button>\r\n    </div>\r\n    <div class=\"tc-ctl-share-alert tc-alert tc-alert-warning tc-hidden\">\r\n        <p>"
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"tooManyLayersLoaded",true,{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":25,"column":11},"end":{"line":25,"column":46}}}))
    + "</p>\r\n    </div>    \r\n</div>\r\n";
},"useData":true});

/***/ })

}]);
//# sourceMappingURL=../maps/chunks/TC_templates_tc-ctl-share_mjs.sitna.debug.js.map