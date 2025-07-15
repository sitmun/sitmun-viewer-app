"use strict";
(self["webpackChunkSITNA"] = self["webpackChunkSITNA"] || []).push([["TC_templates_tc-ctl-lcat_mjs"],{

/***/ "./TC/templates/tc-ctl-lcat.mjs":
/*!**************************************!*\
  !*** ./TC/templates/tc-ctl-lcat.mjs ***!
  \**************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({"1":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"layerTrees") : depth0),{"name":"if","hash":{},"fn":container.program(2, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":4,"column":8},"end":{"line":6,"column":15}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"layers") : depth0),{"name":"if","hash":{},"fn":container.program(2, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":7,"column":8},"end":{"line":9,"column":15}}})) != null ? stack1 : "");
},"2":function(container,depth0,helpers,partials,data) {
    var lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "    <button type=\"button\" class=\"tc-icon-btn tc-ctl-lcat-btn-search\" title=\""
    + container.escapeExpression(lookupProperty(helpers,"i18n").call(depth0 != null ? depth0 : (container.nullContext || {}),"searchLayersByText",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":5,"column":76},"end":{"line":5,"column":105}}}))
    + "\"></button>\r\n";
},"4":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "    <ul class=\"tc-ctl-lcat-branch\">\r\n"
    + ((stack1 = lookupProperty(helpers,"each").call(depth0 != null ? depth0 : (container.nullContext || {}),(depth0 != null ? lookupProperty(depth0,"layerTrees") : depth0),{"name":"each","hash":{},"fn":container.program(5, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":25,"column":8},"end":{"line":27,"column":17}}})) != null ? stack1 : "")
    + "    </ul>\r\n";
},"5":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = container.invokePartial(lookupProperty(partials,"tc-ctl-lcat-branch"),depth0,{"name":"tc-ctl-lcat-branch","data":data,"indent":"            ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"7":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),(depth0 != null ? lookupProperty(depth0,"layers") : depth0),{"name":"if","hash":{},"fn":container.program(8, data, 0),"inverse":container.program(11, data, 0),"data":data,"loc":{"start":{"line":30,"column":8},"end":{"line":40,"column":15}}})) != null ? stack1 : "");
},"8":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "            <ul class=\"tc-ctl-lcat-branch\">\r\n"
    + ((stack1 = lookupProperty(helpers,"each").call(depth0 != null ? depth0 : (container.nullContext || {}),(depth0 != null ? lookupProperty(depth0,"layers") : depth0),{"name":"each","hash":{},"fn":container.program(9, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":32,"column":16},"end":{"line":34,"column":25}}})) != null ? stack1 : "")
    + "            </ul>\r\n";
},"9":function(container,depth0,helpers,partials,data) {
    var alias1=container.lambda, alias2=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "                    <li data-layer-id=\""
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"id") : depth0), depth0))
    + "\" title=\""
    + alias2(lookupProperty(helpers,"i18n").call(depth0 != null ? depth0 : (container.nullContext || {}),"loadingLayers",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":33,"column":54},"end":{"line":33,"column":78}}}))
    + "\" class=\"tc-ctl-lcat-loading-node\"> "
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"title") : depth0), depth0))
    + "</li>\r\n";
},"11":function(container,depth0,helpers,partials,data) {
    var lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "            <div class=\"tc-ctl tc-ctl-lcat-loading\">\r\n                <span>"
    + container.escapeExpression(lookupProperty(helpers,"i18n").call(depth0 != null ? depth0 : (container.nullContext || {}),"loadingLayerTree",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":38,"column":22},"end":{"line":38,"column":49}}}))
    + "...</span>\r\n            </div>\r\n";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<h2>\r\n    "
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"availableLayers",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":2,"column":4},"end":{"line":2,"column":30}}}))
    + "\r\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"enableSearch") : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":3,"column":4},"end":{"line":10,"column":11}}})) != null ? stack1 : "")
    + "</h2>\r\n\r\n\r\n<div class=\"tc-ctl-lcat-search tc-hidden tc-collapsed\">\r\n    <div class=\"tc-group\">\r\n        <input type=\"search\" class=\"tc-ctl-lcat-input tc-textbox\" placeholder=\""
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"textToSearchInLayers",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":16,"column":79},"end":{"line":16,"column":110}}}))
    + "\">\r\n    </div>\r\n    <ul></ul>\r\n\r\n</div>\r\n\r\n<div class=\"tc-ctl-lcat-tree\">\r\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"layerTrees") : depth0),{"name":"if","hash":{},"fn":container.program(4, data, 0),"inverse":container.program(7, data, 0),"data":data,"loc":{"start":{"line":23,"column":4},"end":{"line":41,"column":11}}})) != null ? stack1 : "")
    + "</div>\r\n<div class=\"tc-ctl-lcat-info tc-hidden\">\r\n"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"tc-ctl-lcat-info"),depth0,{"name":"tc-ctl-lcat-info","data":data,"indent":"    ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "</div>";
},"usePartial":true,"useData":true});

/***/ })

}]);
//# sourceMappingURL=../maps/chunks/TC_templates_tc-ctl-lcat_mjs.sitna.debug.js.map