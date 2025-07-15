"use strict";
(self["webpackChunkSITNA"] = self["webpackChunkSITNA"] || []).push([["TC_templates_tc-ctl-dmm_mjs"],{

/***/ "./TC/templates/tc-ctl-dmm.mjs":
/*!*************************************!*\
  !*** ./TC/templates/tc-ctl-dmm.mjs ***!
  \*************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({"1":function(container,depth0,helpers,partials,data) {
    return " single-sketch";
},"3":function(container,depth0,helpers,partials,data) {
    return " stylable";
},"5":function(container,depth0,helpers,partials,data) {
    return " extensible-sketch";
},"7":function(container,depth0,helpers,partials,data) {
    return " enabled-profile";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.escapeExpression, alias3=container.lambda, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<h2>"
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"drawAndMeasure",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":1,"column":4},"end":{"line":1,"column":29}}}))
    + "</h2>\r\n<div class=\"tc-ctl-meas-select\">\r\n    <sitna-tab class=\"tc-ctl-meas-select-mode-point\" text=\""
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"points",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":3,"column":59},"end":{"line":3,"column":76}}}))
    + "\" group=\""
    + alias2(alias3((depth0 != null ? lookupProperty(depth0,"controlId") : depth0), depth0))
    + "-mode\" for=\""
    + alias2(alias3((depth0 != null ? lookupProperty(depth0,"controlId") : depth0), depth0))
    + "-mode-point\"></sitna-tab>\r\n    <sitna-tab class=\"tc-ctl-meas-select-mode-polyline\" text=\""
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"lines",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":4,"column":62},"end":{"line":4,"column":78}}}))
    + "\" group=\""
    + alias2(alias3((depth0 != null ? lookupProperty(depth0,"controlId") : depth0), depth0))
    + "-mode\" for=\""
    + alias2(alias3((depth0 != null ? lookupProperty(depth0,"controlId") : depth0), depth0))
    + "-mode-polyline\"></sitna-tab>\r\n    <sitna-tab class=\"tc-ctl-meas-select-mode-polygon\" text=\""
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"polygons",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":5,"column":61},"end":{"line":5,"column":80}}}))
    + "\" group=\""
    + alias2(alias3((depth0 != null ? lookupProperty(depth0,"controlId") : depth0), depth0))
    + "-mode\" for=\""
    + alias2(alias3((depth0 != null ? lookupProperty(depth0,"controlId") : depth0), depth0))
    + "-mode-polygon\"></sitna-tab>\r\n</div>\r\n<div id=\""
    + alias2(alias3((depth0 != null ? lookupProperty(depth0,"controlId") : depth0), depth0))
    + "-mode-point\" class=\"tc-ctl-meas-mode tc-ctl-meas-pt tc-hidden\">\r\n    <sitna-draw mode=\"point\" measurer borrowed-layer"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"singleSketch") : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":8,"column":52},"end":{"line":8,"column":93}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"stylable") : depth0),{"name":"if","hash":{},"fn":container.program(3, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":8,"column":93},"end":{"line":8,"column":125}}})) != null ? stack1 : "")
    + "></sitna-draw>\r\n    <sitna-measurement mode=\"point\"></sitna-measurement>\r\n</div>\r\n<div id=\""
    + alias2(alias3((depth0 != null ? lookupProperty(depth0,"controlId") : depth0), depth0))
    + "-mode-polyline\" class=\"tc-ctl-meas-mode tc-ctl-meas-len tc-hidden\">\r\n    <sitna-draw mode=\"polyline\" measurer borrowed-layer"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"singleSketch") : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":12,"column":55},"end":{"line":12,"column":96}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"extensibleSketch") : depth0),{"name":"if","hash":{},"fn":container.program(5, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":12,"column":96},"end":{"line":12,"column":145}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"stylable") : depth0),{"name":"if","hash":{},"fn":container.program(3, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":12,"column":145},"end":{"line":12,"column":177}}})) != null ? stack1 : "")
    + "></sitna-draw>\r\n    <sitna-measurement mode=\"polyline\""
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"displayElevation") : depth0),{"name":"if","hash":{},"fn":container.program(7, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":13,"column":38},"end":{"line":13,"column":85}}})) != null ? stack1 : "")
    + "></sitna-measurement>\r\n</div>\r\n<div id=\""
    + alias2(alias3((depth0 != null ? lookupProperty(depth0,"controlId") : depth0), depth0))
    + "-mode-polygon\" class=\"tc-ctl-meas-mode tc-ctl-meas-area tc-hidden\">\r\n    <sitna-draw mode=\"polygon\" measurer borrowed-layer"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"singleSketch") : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":16,"column":54},"end":{"line":16,"column":95}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"stylable") : depth0),{"name":"if","hash":{},"fn":container.program(3, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":16,"column":95},"end":{"line":16,"column":127}}})) != null ? stack1 : "")
    + "></sitna-draw>\r\n    <sitna-measurement mode=\"polygon\"></sitna-measurement>\r\n</div>\r\n<div class=\"tc-ctl-dmm-tool\">\r\n    <div class=\"tc-ctl-dmm-mod\">\r\n        <sitna-modify></sitna-modify>\r\n    </div>\r\n    <div class=\"tc-ctl-dmm-cmd\">\r\n        <button type=\"button\" class=\"tc-ctl-dmm-btn-hide tc-ctl-btn tc-active\" disabled title=\""
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"hideSketch",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":24,"column":95},"end":{"line":24,"column":116}}}))
    + "\">"
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"hideSketch",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":24,"column":118},"end":{"line":24,"column":139}}}))
    + "</button>\r\n        <button type=\"button\" class=\"tc-ctl-dmm-btn-dl tc-ctl-btn\" disabled title=\""
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"download",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":25,"column":83},"end":{"line":25,"column":102}}}))
    + "\">"
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"download",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":25,"column":104},"end":{"line":25,"column":123}}}))
    + "...</button>\r\n        <button type=\"button\" class=\"tc-ctl-dmm-btn-clr tc-ctl-btn\" disabled title=\""
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"deleteAll",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":26,"column":84},"end":{"line":26,"column":104}}}))
    + "\">"
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"deleteAll",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":26,"column":106},"end":{"line":26,"column":126}}}))
    + "</button>\r\n    </div>\r\n</div>\r\n";
},"useData":true});

/***/ })

}]);
//# sourceMappingURL=../maps/chunks/TC_templates_tc-ctl-dmm_mjs.sitna.debug.js.map