"use strict";
(self["webpackChunkSITNA"] = self["webpackChunkSITNA"] || []).push([["TC_templates_tc-ctl-download_mjs"],{

/***/ "./TC/templates/tc-ctl-download.mjs":
/*!******************************************!*\
  !*** ./TC/templates/tc-ctl-download.mjs ***!
  \******************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({"1":function(container,depth0,helpers,partials,data) {
    return " deselectable";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.escapeExpression, alias3=container.lambda, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<h2>"
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"download",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":1,"column":4},"end":{"line":1,"column":23}}}))
    + " </h2>\r\n<div class=\"tc-ctl-tctr tc-ctl-tctr-select\">\r\n    <sitna-tab text=\""
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"dl.export.map",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":3,"column":21},"end":{"line":3,"column":45}}}))
    + "\" group=\""
    + alias2(alias3((depth0 != null ? lookupProperty(depth0,"controlId") : depth0), depth0))
    + "-type\" "
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"deselectableTabs") : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":3,"column":74},"end":{"line":3,"column":118}}})) != null ? stack1 : "")
    + "for=\""
    + alias2(alias3((depth0 != null ? lookupProperty(depth0,"controlId") : depth0), depth0))
    + "-type-image\"></sitna-tab>\r\n    <sitna-tab text=\""
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"dl.export.vector",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":4,"column":21},"end":{"line":4,"column":48}}}))
    + "\" group=\""
    + alias2(alias3((depth0 != null ? lookupProperty(depth0,"controlId") : depth0), depth0))
    + "-type\" "
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"deselectableTabs") : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":4,"column":77},"end":{"line":4,"column":121}}})) != null ? stack1 : "")
    + "for=\""
    + alias2(alias3((depth0 != null ? lookupProperty(depth0,"controlId") : depth0), depth0))
    + "-type-vector\"></sitna-tab>\r\n</div>\r\n<div id=\""
    + alias2(alias3((depth0 != null ? lookupProperty(depth0,"controlId") : depth0), depth0))
    + "-type-image\" class=\"tc-ctl-tctr-elm tc-ctl-tctr-elm-image tc-group tc-ctl-download-cnt tc-ctl-download-image\">\r\n    <div>\r\n        <label>"
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"format",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":8,"column":15},"end":{"line":8,"column":32}}}))
    + ":</label><select class=\"tc-combo\">\r\n            <option value=\"image/png\">PNG</option>\r\n            <option value=\"image/jpeg\">JPEG</option>\r\n        </select>\r\n        <div class=\"tc-ctl-download-div\">\r\n            <label class=\"tc-ctl-download-image-qr-label\" title=\""
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"createQrCodeToImage",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":13,"column":65},"end":{"line":13,"column":95}}}))
    + "\">\r\n                <input class=\"tc-toggle tc-ctl-download-image-qr\" type=\"checkbox\" checked />\r\n                "
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"appendQRCode",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":15,"column":16},"end":{"line":15,"column":39}}}))
    + "\r\n            </label>\r\n            <label class=\"tc-ctl-download-image-wld-label\" title=\""
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"appendWorldFile.explanation",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":17,"column":66},"end":{"line":17,"column":104}}}))
    + "\">\r\n                <input class=\"tc-toggle tc-ctl-download-image-wld\" type=\"checkbox\" />\r\n                "
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"appendWorldFile",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":19,"column":16},"end":{"line":19,"column":42}}}))
    + "\r\n            </label>\r\n        </div>\r\n\r\n        <div class=\"tc-group tc-group tc-ctl-download-cnt\" style=\"text-align:right;\">\r\n            <button type=\"button\" class=\"tc-ctl-download-btn tc-button tc-icon-button\" title=\""
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"downloadImageFromCurrentMap",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":24,"column":94},"end":{"line":24,"column":132}}}))
    + "\" name=\"descargar\">"
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"download",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":24,"column":151},"end":{"line":24,"column":170}}}))
    + "</button>\r\n        </div>\r\n        <div class=\"tc-ctl-download-alert tc-alert tc-alert-warning tc-hidden\">\r\n            <p>"
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"qrAdvice",true,{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":27,"column":15},"end":{"line":27,"column":39}}}))
    + "</p>\r\n        </div>\r\n    </div>\r\n</div>\r\n<div id=\""
    + alias2(alias3((depth0 != null ? lookupProperty(depth0,"controlId") : depth0), depth0))
    + "-type-vector\" class=\"tc-ctl-tctr-elm tc-ctl-tctr-elm-data tc-group tc-ctl-download-cnt\">\r\n    <div>\r\n        <label>"
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"format",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":33,"column":15},"end":{"line":33,"column":32}}}))
    + ":</label><select class=\"tc-combo\">\r\n            <option value=\"GML32\">GML</option>\r\n            <option value=\"application/json\">GeoJSON</option>\r\n            <option value=\"application/vnd.google-earth.kml+xml\">KML (Google Earth)</option>\r\n            <option value=\"shape-zip\">Shapefile (ESRI)</option>\r\n        </select>\r\n\r\n        <div class=\"tc-group tc-group tc-ctl-download-cnt\" style=\"text-align:right;\">\r\n            <sitna-button variant=\"minimal\" icon=\"help\" class=\"tc-ctl-download-help\" text=\""
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"showDownloadHelp",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":41,"column":91},"end":{"line":41,"column":118}}}))
    + "\"></sitna-button>\r\n            <button type=\"button\" class=\"tc-ctl-download-btn tc-button tc-icon-button\" title=\""
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"downloadLayersFromCurrentExtent",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":42,"column":94},"end":{"line":42,"column":136}}}))
    + "\" name=\"descargar\">"
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"download",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":42,"column":155},"end":{"line":42,"column":174}}}))
    + "</button>\r\n        </div>\r\n\r\n        <div class=\"tc-alert tc-alert-warning tc-hidden\">\r\n            <p id=\"zoom-msg-"
    + alias2(alias3((depth0 != null ? lookupProperty(depth0,"controlId") : depth0), depth0))
    + "\"><strong>"
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"tooManyFeatures",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":46,"column":51},"end":{"line":46,"column":77}}}))
    + ": </strong>"
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"tooManyFeatures.instructions",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":46,"column":88},"end":{"line":46,"column":127}}}))
    + "</p>\r\n            <p id=\"layers-msg-"
    + alias2(alias3((depth0 != null ? lookupProperty(depth0,"controlId") : depth0), depth0))
    + "\"><strong>"
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"noLayersLoaded",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":47,"column":53},"end":{"line":47,"column":78}}}))
    + ": </strong>"
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"noLayersLoaded.instructions",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":47,"column":89},"end":{"line":47,"column":127}}}))
    + "</p>\r\n            <p id=\"url-msg-"
    + alias2(alias3((depth0 != null ? lookupProperty(depth0,"controlId") : depth0), depth0))
    + "\"><strong>"
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"tooManySelectedLayers",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":48,"column":50},"end":{"line":48,"column":82}}}))
    + ": </strong>"
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"tooManySelectedLayers.instructions",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":48,"column":93},"end":{"line":48,"column":138}}}))
    + "</p>\r\n            <p id=\"noFeatures-msg-"
    + alias2(alias3((depth0 != null ? lookupProperty(depth0,"controlId") : depth0), depth0))
    + "\"><strong>"
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"noData",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":49,"column":57},"end":{"line":49,"column":74}}}))
    + ": </strong>"
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"noData.instructions",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":49,"column":85},"end":{"line":49,"column":115}}}))
    + "</p>\r\n            <p id=\"novalid-msg-"
    + alias2(alias3((depth0 != null ? lookupProperty(depth0,"controlId") : depth0), depth0))
    + "\"><strong>"
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"noValidService",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":50,"column":54},"end":{"line":50,"column":79}}}))
    + ": </strong>"
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"noValidService.instructions",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":50,"column":90},"end":{"line":50,"column":128}}}))
    + "</p>\r\n        </div>\r\n    </div>\r\n</div>\r\n\r\n";
},"useData":true});

/***/ })

}]);
//# sourceMappingURL=../maps/chunks/TC_templates_tc-ctl-download_mjs.sitna.debug.js.map