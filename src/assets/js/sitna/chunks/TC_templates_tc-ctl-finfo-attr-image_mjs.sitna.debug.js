"use strict";
(self["webpackChunkSITNA"] = self["webpackChunkSITNA"] || []).push([["TC_templates_tc-ctl-finfo-attr-image_mjs"],{

/***/ "./TC/templates/tc-ctl-finfo-attr-image.mjs":
/*!**************************************************!*\
  !*** ./TC/templates/tc-ctl-finfo-attr-image.mjs ***!
  \**************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({"1":function(container,depth0,helpers,partials,data) {
    return "max-height:none;";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<img src=\""
    + alias2(lookupProperty(helpers,"removeSpecialAttributeTag").call(alias1,(depth0 != null ? lookupProperty(depth0,"value") : depth0),{"name":"removeSpecialAttributeTag","hash":{},"data":data,"loc":{"start":{"line":1,"column":10},"end":{"line":1,"column":45}}}))
    + "\" class=\"tc-img-attr\" style=\"width:"
    + alias2(lookupProperty(helpers,"getTagWidth").call(alias1,(depth0 != null ? lookupProperty(depth0,"name") : depth0),(depth0 != null ? lookupProperty(depth0,"value") : depth0),{"name":"getTagWidth","hash":{},"data":data,"loc":{"start":{"line":1,"column":80},"end":{"line":1,"column":106}}}))
    + ";height:"
    + alias2(lookupProperty(helpers,"getTagHeight").call(alias1,(depth0 != null ? lookupProperty(depth0,"name") : depth0),(depth0 != null ? lookupProperty(depth0,"value") : depth0),{"name":"getTagHeight","hash":{},"data":data,"loc":{"start":{"line":1,"column":114},"end":{"line":1,"column":141}}}))
    + ";"
    + ((stack1 = lookupProperty(helpers,"unless").call(alias1,lookupProperty(helpers,"eq").call(alias1,lookupProperty(helpers,"getTagHeight").call(alias1,(depth0 != null ? lookupProperty(depth0,"name") : depth0),(depth0 != null ? lookupProperty(depth0,"value") : depth0),{"name":"getTagHeight","hash":{},"data":data,"loc":{"start":{"line":1,"column":156},"end":{"line":1,"column":181}}}),"auto",{"name":"eq","hash":{},"data":data,"loc":{"start":{"line":1,"column":152},"end":{"line":1,"column":189}}}),{"name":"unless","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":1,"column":142},"end":{"line":1,"column":218}}})) != null ? stack1 : "")
    + "\" title=\""
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"viewEnlargedImage",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":1,"column":227},"end":{"line":1,"column":255}}}))
    + "\" />";
},"useData":true});

/***/ })

}]);
//# sourceMappingURL=../maps/chunks/TC_templates_tc-ctl-finfo-attr-image_mjs.sitna.debug.js.map