"use strict";
(self["webpackChunkSITNA"] = self["webpackChunkSITNA"] || []).push([["TC_templates_tc-ctl-elev-val_mjs"],{

/***/ "./TC/templates/tc-ctl-elev-val.mjs":
/*!******************************************!*\
  !*** ./TC/templates/tc-ctl-elev-val.mjs ***!
  \******************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({"1":function(container,depth0,helpers,partials,data) {
    var alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<tr class=\"tc-ctl-elev-pair-elev-orig\">\r\n    <th><span>"
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"ele",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":3,"column":14},"end":{"line":3,"column":28}}}))
    + " ("
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"original",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":3,"column":30},"end":{"line":3,"column":49}}}))
    + ")</span></th>\r\n    <td>"
    + alias2(container.lambda((depth0 != null ? lookupProperty(depth0,"originalValue") : depth0), depth0))
    + " m</td>\r\n</tr>\r\n";
},"3":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<tr class=\"tc-ctl-elev-pair-elev\">\r\n    <th><span>"
    + ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),(depth0 != null ? lookupProperty(depth0,"originalValue") : depth0),{"name":"if","hash":{},"fn":container.program(4, data, 0),"inverse":container.program(6, data, 0),"data":data,"loc":{"start":{"line":9,"column":14},"end":{"line":9,"column":101}}})) != null ? stack1 : "")
    + "</span></th>\r\n    <td>"
    + container.escapeExpression(container.lambda((depth0 != null ? lookupProperty(depth0,"elevationValue") : depth0), depth0))
    + " m</td>\r\n</tr>\r\n";
},"4":function(container,depth0,helpers,partials,data) {
    var alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return alias2(lookupProperty(helpers,"i18n").call(alias1,"ele",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":9,"column":35},"end":{"line":9,"column":49}}}))
    + " ("
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"mdt",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":9,"column":51},"end":{"line":9,"column":65}}}))
    + ")";
},"6":function(container,depth0,helpers,partials,data) {
    var lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return container.escapeExpression(lookupProperty(helpers,"i18n").call(depth0 != null ? depth0 : (container.nullContext || {}),"elevation",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":9,"column":74},"end":{"line":9,"column":94}}}));
},"8":function(container,depth0,helpers,partials,data) {
    var alias1=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<tr class=\"tc-ctl-elev-pair-height\">\r\n    <th><span>"
    + alias1(lookupProperty(helpers,"i18n").call(depth0 != null ? depth0 : (container.nullContext || {}),"heightOverTerrain",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":15,"column":14},"end":{"line":15,"column":42}}}))
    + "</span></th>\r\n    <td>"
    + alias1(container.lambda((depth0 != null ? lookupProperty(depth0,"heightValue") : depth0), depth0))
    + " m</td>\r\n</tr>\r\n";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"originalValue") : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":1,"column":0},"end":{"line":6,"column":7}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"elevationValue") : depth0),{"name":"if","hash":{},"fn":container.program(3, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":7,"column":0},"end":{"line":12,"column":7}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"heightValue") : depth0),{"name":"if","hash":{},"fn":container.program(8, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":13,"column":0},"end":{"line":18,"column":7}}})) != null ? stack1 : "");
},"useData":true});

/***/ })

}]);
//# sourceMappingURL=../maps/chunks/TC_templates_tc-ctl-elev-val_mjs.sitna.debug.js.map