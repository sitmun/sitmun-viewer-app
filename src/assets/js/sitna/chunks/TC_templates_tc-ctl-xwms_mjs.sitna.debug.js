"use strict";
(self["webpackChunkSITNA"] = self["webpackChunkSITNA"] || []).push([["TC_templates_tc-ctl-xwms_mjs"],{

/***/ "./TC/templates/tc-ctl-xwms.mjs":
/*!**************************************!*\
  !*** ./TC/templates/tc-ctl-xwms.mjs ***!
  \**************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({"1":function(container,depth0,helpers,partials,data) {
    var lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<h2>"
    + container.escapeExpression(lookupProperty(helpers,"i18n").call(depth0 != null ? depth0 : (container.nullContext || {}),"addMaps",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":1,"column":17},"end":{"line":1,"column":35}}}))
    + "</h2>";
},"3":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"group") : depth0),{"name":"if","hash":{},"fn":container.program(4, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":7,"column":7},"end":{"line":9,"column":14}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,(depth0 != null ? lookupProperty(depth0,"items") : depth0),{"name":"each","hash":{},"fn":container.program(6, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":10,"column":16},"end":{"line":12,"column":25}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"group") : depth0),{"name":"if","hash":{},"fn":container.program(8, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":13,"column":7},"end":{"line":15,"column":14}}})) != null ? stack1 : "");
},"4":function(container,depth0,helpers,partials,data) {
    var lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "                <optgroup label=\""
    + container.escapeExpression(container.lambda((depth0 != null ? lookupProperty(depth0,"group") : depth0), depth0))
    + "\">\r\n";
},"6":function(container,depth0,helpers,partials,data) {
    var alias1=container.lambda, alias2=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "                    <option value=\""
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"url") : depth0), depth0))
    + "\">"
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"name") : depth0), depth0))
    + "</option>\r\n";
},"8":function(container,depth0,helpers,partials,data) {
    return "                </optgroup>\r\n";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"title") : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":1,"column":0},"end":{"line":1,"column":47}}})) != null ? stack1 : "")
    + "\r\n<div>\r\n    <div class=\"tc-group tc-ctl-xwms-cnt\">        \r\n        <select class=\"tc-combo\" title=\"WMS (Web Map Service)\">\r\n            <option value=\"\">WMS</option>\r\n"
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,(depth0 != null ? lookupProperty(depth0,"suggestions") : depth0),{"name":"each","hash":{},"fn":container.program(3, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":6,"column":12},"end":{"line":16,"column":21}}})) != null ? stack1 : "")
    + "        </select>\r\n        <input type=\"url\" class=\"tc-textbox\" placeholder=\""
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"writeAddressOrSelect",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":18,"column":58},"end":{"line":18,"column":89}}}))
    + "\" />\r\n    </div>\r\n\r\n\r\n    <div class=\"tc-group tc-group tc-ctl-xwms-cnt\" style=\"text-align:right;\">\r\n        <button type=\"button\" class=\"tc-button tc-icon-button\" title=\""
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"addService.title",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":23,"column":70},"end":{"line":23,"column":97}}}))
    + "\" name=\"agregar\">"
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"addService",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":23,"column":114},"end":{"line":23,"column":135}}}))
    + "</button>\r\n    </div>\r\n</div>\r\n";
},"useData":true});

/***/ })

}]);
//# sourceMappingURL=../maps/chunks/TC_templates_tc-ctl-xwms_mjs.sitna.debug.js.map