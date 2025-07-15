"use strict";
(self["webpackChunkSITNA"] = self["webpackChunkSITNA"] || []).push([["TC_templates_tc-ctl-rpanel-chart_mjs"],{

/***/ "./TC/templates/tc-ctl-rpanel-chart.mjs":
/*!**********************************************!*\
  !*** ./TC/templates/tc-ctl-rpanel-chart.mjs ***!
  \**********************************************/
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

  return "    "
    + container.escapeExpression(container.lambda((depth0 != null ? lookupProperty(depth0,"msg") : depth0), depth0))
    + "\r\n";
},"3":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),(depth0 != null ? lookupProperty(depth0,"secondChart") : depth0),{"name":"if","hash":{},"fn":container.program(4, data, 0),"inverse":container.program(6, data, 0),"data":data,"loc":{"start":{"line":5,"column":4},"end":{"line":38,"column":15}}})) != null ? stack1 : "")
    + "        <div class=\"tc-chart\"></div>\r\n";
},"4":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.lambda, alias2=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "    <div class=\"tc-track-chart-elevation-minmax\">\r\n        <div class=\"tc-track-chart-minmax\">\r\n            <span>\r\n                Min,Max:&nbsp;\r\n            </span>\r\n            <div>\r\n                <span>\r\n                    "
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"min") : depth0), depth0))
    + ", "
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"max") : depth0), depth0))
    + "\r\n                </span>\r\n                <span>\r\n                    "
    + alias2(alias1(((stack1 = (depth0 != null ? lookupProperty(depth0,"secondChart") : depth0)) != null ? lookupProperty(stack1,"min") : stack1), depth0))
    + ", "
    + alias2(alias1(((stack1 = (depth0 != null ? lookupProperty(depth0,"secondChart") : depth0)) != null ? lookupProperty(stack1,"max") : stack1), depth0))
    + "&nbsp;\r\n                </span>\r\n            </div>\r\n        </div>\r\n        <div class=\"tc-track-chart-elev-gain\">\r\n            <span>\r\n                "
    + alias2(lookupProperty(helpers,"i18n").call(depth0 != null ? depth0 : (container.nullContext || {}),"geo.trk.chart.elevationGain",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":22,"column":16},"end":{"line":22,"column":54}}}))
    + ":&nbsp;\r\n            </span>\r\n            <div>\r\n                <span>\r\n                    +"
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"upHill") : depth0), depth0))
    + " m, -"
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"downHill") : depth0), depth0))
    + " m\r\n                </span>\r\n                <span>\r\n                    +"
    + alias2(alias1(((stack1 = (depth0 != null ? lookupProperty(depth0,"secondChart") : depth0)) != null ? lookupProperty(stack1,"upHill") : stack1), depth0))
    + " m, -"
    + alias2(alias1(((stack1 = (depth0 != null ? lookupProperty(depth0,"secondChart") : depth0)) != null ? lookupProperty(stack1,"downHill") : stack1), depth0))
    + " m\r\n                </span>\r\n            </div>\r\n        </div>\r\n    </div>\r\n";
},"6":function(container,depth0,helpers,partials,data) {
    var alias1=container.escapeExpression, alias2=container.lambda, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "        <span class=\"tc-track-chart-elev-gain\">\r\n            "
    + alias1(lookupProperty(helpers,"i18n").call(depth0 != null ? depth0 : (container.nullContext || {}),"geo.trk.chart.elevationGain",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":36,"column":12},"end":{"line":36,"column":50}}}))
    + ": +"
    + alias1(alias2((depth0 != null ? lookupProperty(depth0,"upHill") : depth0), depth0))
    + " m, -"
    + alias1(alias2((depth0 != null ? lookupProperty(depth0,"downHill") : depth0), depth0))
    + " m\r\n        </span>\r\n";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<div class=\"tc-track-chart\">\r\n"
    + ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),(depth0 != null ? lookupProperty(depth0,"msg") : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.program(3, data, 0),"data":data,"loc":{"start":{"line":2,"column":4},"end":{"line":40,"column":15}}})) != null ? stack1 : "")
    + "    </div>\r\n";
},"useData":true});

/***/ })

}]);
//# sourceMappingURL=../maps/chunks/TC_templates_tc-ctl-rpanel-chart_mjs.sitna.debug.js.map