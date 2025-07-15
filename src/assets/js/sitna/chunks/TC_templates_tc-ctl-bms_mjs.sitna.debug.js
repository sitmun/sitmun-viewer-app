"use strict";
(self["webpackChunkSITNA"] = self["webpackChunkSITNA"] || []).push([["TC_templates_tc-ctl-bms_mjs"],{

/***/ "./TC/templates/tc-ctl-bms.mjs":
/*!*************************************!*\
  !*** ./TC/templates/tc-ctl-bms.mjs ***!
  \*************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({"1":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = container.invokePartial(lookupProperty(partials,"tc-ctl-bms-node"),depth0,{"name":"tc-ctl-bms-node","hash":{"controlId":(depths[1] != null ? lookupProperty(depths[1],"controlId") : depths[1])},"data":data,"indent":"        ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"3":function(container,depth0,helpers,partials,data) {
    var alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "        <li class=\"tc-ctl-bms-node\"><label class=\"tc-ctl-bms-more-node\" title=\""
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"moreBackgroundMaps",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":8,"column":79},"end":{"line":8,"column":108}}}))
    + "\"><input type=\"radio\" name=\""
    + alias2(container.lambda((depth0 != null ? lookupProperty(depth0,"controlId") : depth0), depth0))
    + "-bm\" value=\"moreLayers\"><span></span></label>\r\n        <div class=\"tc-ctl-bms-info\">\r\n            <h3>"
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"moreBackgroundMaps",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":10,"column":16},"end":{"line":10,"column":45}}}))
    + "</h3>\r\n        </div></li>\r\n";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<h2>"
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"backgroundMaps",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":1,"column":4},"end":{"line":1,"column":29}}}))
    + " <button type=\"button\" class=\"tc-icon-btn tc-ctl-bms-btn-view tc-details\" title=\""
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"showDetailsView",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":1,"column":110},"end":{"line":1,"column":136}}}))
    + "\"></button></h2>\r\n<div class=\"tc-ctl-bms-tree tc-grid\">\r\n    <ul class=\"tc-ctl-bms-branch\">\r\n"
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,(depth0 != null ? lookupProperty(depth0,"baseLayers") : depth0),{"name":"each","hash":{},"fn":container.program(1, data, 0, blockParams, depths),"inverse":container.noop,"data":data,"loc":{"start":{"line":4,"column":8},"end":{"line":6,"column":17}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"dialogMore") : depth0),{"name":"if","hash":{},"fn":container.program(3, data, 0, blockParams, depths),"inverse":container.noop,"data":data,"loc":{"start":{"line":7,"column":8},"end":{"line":12,"column":15}}})) != null ? stack1 : "")
    + "    </ul>\r\n</div>";
},"usePartial":true,"useData":true,"useDepths":true});

/***/ })

}]);
//# sourceMappingURL=../maps/chunks/TC_templates_tc-ctl-bms_mjs.sitna.debug.js.map