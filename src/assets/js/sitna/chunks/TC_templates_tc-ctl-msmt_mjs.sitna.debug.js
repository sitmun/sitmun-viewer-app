"use strict";
(self["webpackChunkSITNA"] = self["webpackChunkSITNA"] || []).push([["TC_templates_tc-ctl-msmt_mjs"],{

/***/ "./TC/templates/tc-ctl-msmt.mjs":
/*!**************************************!*\
  !*** ./TC/templates/tc-ctl-msmt.mjs ***!
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

  return "    <div class=\"tc-ctl-msmt-txt\">\r\n        "
    + container.escapeExpression(lookupProperty(helpers,"i18n").call(depth0 != null ? depth0 : (container.nullContext || {}),"search.list.coordinates",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":4,"column":8},"end":{"line":4,"column":42}}}))
    + " \r\n        <span class=\"tc-ctl-msmt-val-coord\">\r\n            <span class=\"tc-ctl-msmt-txt-elm\">\r\n                <span class=\"tc-ctl-msmt-val-coord-1-t\"></span> <span class=\"tc-ctl-msmt-val-coord-1-v\"></span>\r\n                <span class=\"tc-ctl-msmt-val-coord-2-t\"></span> <span class=\"tc-ctl-msmt-val-coord-2-v\"></span> <span class=\"tc-ctl-msmt-val-coord-ele-t\"></span> <span class=\"tc-ctl-msmt-val-coord-ele-v\"></span>\r\n            </span>\r\n        </span>\r\n    </div>\r\n";
},"3":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),(depth0 != null ? lookupProperty(depth0,"polyline") : depth0),{"name":"if","hash":{},"fn":container.program(4, data, 0),"inverse":container.program(7, data, 0),"data":data,"loc":{"start":{"line":13,"column":4},"end":{"line":26,"column":11}}})) != null ? stack1 : "");
},"4":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "    <div class=\"tc-ctl-msmt-txt\">\r\n        <span class=\"tc-ctl-msmt-txt-elm\">"
    + container.escapeExpression(lookupProperty(helpers,"i18n").call(alias1,"2dLength",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":15,"column":42},"end":{"line":15,"column":61}}}))
    + ": <span class=\"tc-ctl-msmt-val-len\"></span></span>\r\n    </div>\r\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"enabledProfile") : depth0),{"name":"if","hash":{},"fn":container.program(5, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":17,"column":8},"end":{"line":19,"column":15}}})) != null ? stack1 : "");
},"5":function(container,depth0,helpers,partials,data) {
    var lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "    <sitna-toggle checked class=\"tc-ctl-msmt-prof-btn\" text=\""
    + container.escapeExpression(lookupProperty(helpers,"i18n").call(depth0 != null ? depth0 : (container.nullContext || {}),"deactivateElevationProfile",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":18,"column":61},"end":{"line":18,"column":98}}}))
    + "\" checked-icon-text=\"&#xe920;\" unchecked-icon-text=\"&#xe920;\"></sitna-toggle>\r\n";
},"7":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),(depth0 != null ? lookupProperty(depth0,"polygon") : depth0),{"name":"if","hash":{},"fn":container.program(8, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":21,"column":8},"end":{"line":25,"column":15}}})) != null ? stack1 : "");
},"8":function(container,depth0,helpers,partials,data) {
    var alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "    <div class=\"tc-ctl-msmt-txt\">\r\n        <span class=\"tc-ctl-msmt-txt-elm\">"
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"area",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":23,"column":42},"end":{"line":23,"column":57}}}))
    + ": <span class=\"tc-ctl-msmt-val-area\"></span>,</span> <span class=\"tc-ctl-msmt-txt-elm\">"
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"2dPerimeter",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":23,"column":144},"end":{"line":23,"column":166}}}))
    + ": <span class=\"tc-ctl-msmt-val-peri\"></span></span>\r\n    </div>\r\n";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<div class=\"tc-ctl-msmt-box\">\r\n"
    + ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),(depth0 != null ? lookupProperty(depth0,"point") : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.program(3, data, 0),"data":data,"loc":{"start":{"line":2,"column":0},"end":{"line":27,"column":7}}})) != null ? stack1 : "")
    + "</div>";
},"useData":true});

/***/ })

}]);
//# sourceMappingURL=../maps/chunks/TC_templates_tc-ctl-msmt_mjs.sitna.debug.js.map