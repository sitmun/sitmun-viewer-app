"use strict";
(self["webpackChunkSITNA"] = self["webpackChunkSITNA"] || []).push([["TC_templates_tc-ctl-lcat-info_mjs"],{

/***/ "./TC/templates/tc-ctl-lcat-info.mjs":
/*!*******************************************!*\
  !*** ./TC/templates/tc-ctl-lcat-info.mjs ***!
  \*******************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({"1":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<div class=\"tc-ctl-lcat-abstract\">\r\n    <h4>"
    + container.escapeExpression(lookupProperty(helpers,"i18n").call(depth0 != null ? depth0 : (container.nullContext || {}),"abstract",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":6,"column":8},"end":{"line":6,"column":27}}}))
    + "</h4>\r\n    <div><pre>"
    + ((stack1 = container.lambda((depth0 != null ? lookupProperty(depth0,"abstract") : depth0), depth0)) != null ? stack1 : "")
    + "</pre></div>\r\n</div>\r\n";
},"3":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<div class=\"tc-ctl-lcat-metadata\">\r\n    <h4>"
    + container.escapeExpression(lookupProperty(helpers,"i18n").call(alias1,"metadata",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":12,"column":8},"end":{"line":12,"column":27}}}))
    + "</h4>\r\n    <ul>\r\n"
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,(depth0 != null ? lookupProperty(depth0,"metadata") : depth0),{"name":"each","hash":{},"fn":container.program(4, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":14,"column":8},"end":{"line":16,"column":17}}})) != null ? stack1 : "")
    + "    </ul>\r\n</div>\r\n";
},"4":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.lambda, alias2=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "        <li><a href=\""
    + ((stack1 = alias1((depth0 != null ? lookupProperty(depth0,"url") : depth0), depth0)) != null ? stack1 : "")
    + "\" type=\""
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"format") : depth0), depth0))
    + "\" title=\""
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"formatDescription") : depth0), depth0))
    + "\" target=\"_blank\">"
    + ((stack1 = alias1((depth0 != null ? lookupProperty(depth0,"formatDescription") : depth0), depth0)) != null ? stack1 : "")
    + "</a></li>\r\n";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<a class=\"tc-ctl-lcat-info-close\"></a>\r\n<h2>"
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"layerInfo",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":2,"column":4},"end":{"line":2,"column":24}}}))
    + "</h2>\r\n<h3 class=\"tc-ctl-lcat-title\">"
    + alias2(container.lambda((depth0 != null ? lookupProperty(depth0,"title") : depth0), depth0))
    + "</h3>\r\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"abstract") : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":4,"column":0},"end":{"line":9,"column":7}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"metadata") : depth0),{"name":"if","hash":{},"fn":container.program(3, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":10,"column":0},"end":{"line":19,"column":7}}})) != null ? stack1 : "");
},"useData":true});

/***/ })

}]);
//# sourceMappingURL=../maps/chunks/TC_templates_tc-ctl-lcat-info_mjs.sitna.debug.js.map