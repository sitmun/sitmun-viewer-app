"use strict";
(self["webpackChunkSITNA"] = self["webpackChunkSITNA"] || []).push([["TC_templates_tc-ctl-meas_mjs"],{

/***/ "./TC/templates/tc-ctl-meas.mjs":
/*!**************************************!*\
  !*** ./TC/templates/tc-ctl-meas.mjs ***!
  \**************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({"1":function(container,depth0,helpers,partials,data) {
    return " single-sketch";
},"3":function(container,depth0,helpers,partials,data) {
    return " stylable";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.escapeExpression, alias3=container.lambda, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<h2>"
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"measure",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":1,"column":4},"end":{"line":1,"column":22}}}))
    + "</h2>\r\n<div class=\"tc-ctl-meas-select\">\r\n    <sitna-tab class=\"tc-ctl-meas-select-mode-polyline\" text=\""
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"length",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":3,"column":62},"end":{"line":3,"column":79}}}))
    + "\" group=\""
    + alias2(alias3((depth0 != null ? lookupProperty(depth0,"controlId") : depth0), depth0))
    + "-mode\" for=\""
    + alias2(alias3((depth0 != null ? lookupProperty(depth0,"controlId") : depth0), depth0))
    + "-mode-polyline\"></sitna-tab>\r\n    <sitna-tab class=\"tc-ctl-meas-select-mode-polygon\" text=\""
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"areaAndPerimeter",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":4,"column":61},"end":{"line":4,"column":88}}}))
    + "\" group=\""
    + alias2(alias3((depth0 != null ? lookupProperty(depth0,"controlId") : depth0), depth0))
    + "-mode\" for=\""
    + alias2(alias3((depth0 != null ? lookupProperty(depth0,"controlId") : depth0), depth0))
    + "-mode-polygon\"></sitna-tab>\r\n</div>\r\n<div id=\""
    + alias2(alias3((depth0 != null ? lookupProperty(depth0,"controlId") : depth0), depth0))
    + "-mode-polyline\" class=\"tc-ctl-meas-mode tc-ctl-meas-len tc-hidden\">\r\n    <sitna-draw mode=\"polyline\" measurer borrowed-layer"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"singleSketch") : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":7,"column":55},"end":{"line":7,"column":96}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"stylable") : depth0),{"name":"if","hash":{},"fn":container.program(3, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":7,"column":96},"end":{"line":7,"column":128}}})) != null ? stack1 : "")
    + "></sitna-draw>\r\n    <sitna-measurement mode=\"polyline\"></sitna-measurement>\r\n</div>\r\n<div id=\""
    + alias2(alias3((depth0 != null ? lookupProperty(depth0,"controlId") : depth0), depth0))
    + "-mode-polygon\" class=\"tc-ctl-meas-mode tc-ctl-meas-area tc-hidden\">\r\n    <sitna-draw mode=\"polygon\" measurer borrowed-layer"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"singleSketch") : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":11,"column":54},"end":{"line":11,"column":95}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"stylable") : depth0),{"name":"if","hash":{},"fn":container.program(3, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":11,"column":95},"end":{"line":11,"column":127}}})) != null ? stack1 : "")
    + "></sitna-draw>\r\n    <sitna-measurement mode=\"polygon\"></sitna-measurement>\r\n</div>";
},"useData":true});

/***/ })

}]);
//# sourceMappingURL=../maps/chunks/TC_templates_tc-ctl-meas_mjs.sitna.debug.js.map