"use strict";
(self["webpackChunkSITNA"] = self["webpackChunkSITNA"] || []).push([["TC_templates_tc-ctl-fedit_mjs"],{

/***/ "./TC/templates/tc-ctl-fedit.mjs":
/*!***************************************!*\
  !*** ./TC/templates/tc-ctl-fedit.mjs ***!
  \***************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({"1":function(container,depth0,helpers,partials,data) {
    return " stylable";
},"3":function(container,depth0,helpers,partials,data) {
    return " snapping";
},"5":function(container,depth0,helpers,partials,data) {
    var lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "        <sitna-button text=\""
    + container.escapeExpression(lookupProperty(helpers,"i18n").call(depth0 != null ? depth0 : (container.nullContext || {}),"saveAs",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":8,"column":28},"end":{"line":8,"column":45}}}))
    + "\" class=\"tc-ctl-fedit-btn-saveas\"></sitna-button>\r\n";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.escapeExpression, alias2=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<div class=\"tc-ctl-fedit-panel\">\r\n    <div class=\"tc-ctl-fedit-edit\">\r\n        <sitna-edit id=\""
    + alias1(container.lambda((depth0 != null ? lookupProperty(depth0,"editControlId") : depth0), depth0))
    + "\""
    + ((stack1 = lookupProperty(helpers,"if").call(alias2,(depth0 != null ? lookupProperty(depth0,"stylable") : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":3,"column":42},"end":{"line":3,"column":74}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias2,(depth0 != null ? lookupProperty(depth0,"snapping") : depth0),{"name":"if","hash":{},"fn":container.program(3, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":3,"column":74},"end":{"line":3,"column":106}}})) != null ? stack1 : "")
    + " no-other-tools></sitna-edit>\r\n    </div>\r\n    <div class=\"tc-ctl-fedit-actions\">\r\n        <sitna-button text=\""
    + alias1(lookupProperty(helpers,"i18n").call(alias2,"save",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":6,"column":28},"end":{"line":6,"column":43}}}))
    + "\" class=\"tc-ctl-fedit-btn-save\"></sitna-button>\r\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias2,(depth0 != null ? lookupProperty(depth0,"includeSaveAs") : depth0),{"name":"if","hash":{},"fn":container.program(5, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":7,"column":8},"end":{"line":9,"column":15}}})) != null ? stack1 : "")
    + "    </div>\r\n</div>";
},"useData":true});

/***/ })

}]);
//# sourceMappingURL=../maps/chunks/TC_templates_tc-ctl-fedit_mjs.sitna.debug.js.map