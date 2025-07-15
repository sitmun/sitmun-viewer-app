"use strict";
(self["webpackChunkSITNA"] = self["webpackChunkSITNA"] || []).push([["TC_templates_tc-ctl-coords_mjs"],{

/***/ "./TC/templates/tc-ctl-coords.mjs":
/*!****************************************!*\
  !*** ./TC/templates/tc-ctl-coords.mjs ***!
  \****************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({"1":function(container,depth0,helpers,partials,data) {
    return " class=\"tc-active\"";
},"3":function(container,depth0,helpers,partials,data) {
    var alias1=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<button type=\"button\" class=\"tc-ctl-coords-crs\" title=\""
    + alias1(lookupProperty(helpers,"i18n").call(depth0 != null ? depth0 : (container.nullContext || {}),"changeCRS",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":1,"column":209},"end":{"line":1,"column":229}}}))
    + "\">"
    + alias1(container.lambda((depth0 != null ? lookupProperty(depth0,"crs") : depth0), depth0))
    + "</button>";
},"5":function(container,depth0,helpers,partials,data) {
    return " tc-hidden";
},"7":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),(depth0 != null ? lookupProperty(depth0,"showGeo") : depth0),{"name":"if","hash":{},"fn":container.program(8, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":15,"column":4},"end":{"line":22,"column":11}}})) != null ? stack1 : "");
},"8":function(container,depth0,helpers,partials,data) {
    var alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.escapeExpression, alias3=container.lambda, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<div class=\"tc-ctl-coords-alt\">\r\n    <div class=\"tc-ctl-coords-latlon\">\r\n        "
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"lat",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":18,"column":8},"end":{"line":18,"column":22}}}))
    + ": <span class=\"tc-ctl-coords-lat\">"
    + alias2(alias3((depth0 != null ? lookupProperty(depth0,"lat") : depth0), depth0))
    + "</span> \r\n        "
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"lon",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":19,"column":8},"end":{"line":19,"column":22}}}))
    + ": <span class=\"tc-ctl-coords-lon\">"
    + alias2(alias3((depth0 != null ? lookupProperty(depth0,"lon") : depth0), depth0))
    + "</span> \r\n    </div>\r\n</div>\r\n";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.escapeExpression, alias3=container.lambda, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<div title=\""
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"crs",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":1,"column":12},"end":{"line":1,"column":26}}}))
    + "\""
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"allowReprojection") : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":1,"column":27},"end":{"line":1,"column":77}}})) != null ? stack1 : "")
    + ">CRS: <span class=\"tc-ctl-coords-crs\">"
    + alias2(alias3((depth0 != null ? lookupProperty(depth0,"crs") : depth0), depth0))
    + "</span>"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"allowReprojection") : depth0),{"name":"if","hash":{},"fn":container.program(3, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":1,"column":129},"end":{"line":1,"column":254}}})) != null ? stack1 : "")
    + "</div>\r\n<div class=\"tc-ctl-coords-main\">\r\n    <div class=\"tc-ctl-coords-latlon"
    + ((stack1 = lookupProperty(helpers,"unless").call(alias1,(depth0 != null ? lookupProperty(depth0,"isGeo") : depth0),{"name":"unless","hash":{},"fn":container.program(5, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":3,"column":36},"end":{"line":3,"column":74}}})) != null ? stack1 : "")
    + "\">\r\n        "
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"lat",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":4,"column":8},"end":{"line":4,"column":22}}}))
    + ": <span class=\"tc-ctl-coords-lat\">"
    + alias2(alias3((depth0 != null ? lookupProperty(depth0,"lat") : depth0), depth0))
    + "</span> \r\n        "
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"lon",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":5,"column":8},"end":{"line":5,"column":22}}}))
    + ": <span class=\"tc-ctl-coords-lon\">"
    + alias2(alias3((depth0 != null ? lookupProperty(depth0,"lon") : depth0), depth0))
    + "</span> \r\n        <div class=\"tc-ctl-coords-elev-container"
    + ((stack1 = lookupProperty(helpers,"unless").call(alias1,(depth0 != null ? lookupProperty(depth0,"ele") : depth0),{"name":"unless","hash":{},"fn":container.program(5, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":6,"column":48},"end":{"line":6,"column":84}}})) != null ? stack1 : "")
    + "\">"
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"ele",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":6,"column":86},"end":{"line":6,"column":100}}}))
    + ": <span class=\"tc-ctl-coords-elevation\">"
    + alias2(alias3((depth0 != null ? lookupProperty(depth0,"ele") : depth0), depth0))
    + "</span></div>\r\n    </div>\r\n    <div class=\"tc-ctl-coords-xy"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"isGeo") : depth0),{"name":"if","hash":{},"fn":container.program(5, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":8,"column":32},"end":{"line":8,"column":62}}})) != null ? stack1 : "")
    + "\">\r\n        x: <span class=\"tc-ctl-coords-x\">"
    + alias2(alias3((depth0 != null ? lookupProperty(depth0,"x") : depth0), depth0))
    + "</span> \r\n        y: <span class=\"tc-ctl-coords-y\">"
    + alias2(alias3((depth0 != null ? lookupProperty(depth0,"y") : depth0), depth0))
    + "</span> \r\n        <div class=\"tc-ctl-coords-elev-container"
    + ((stack1 = lookupProperty(helpers,"unless").call(alias1,(depth0 != null ? lookupProperty(depth0,"ele") : depth0),{"name":"unless","hash":{},"fn":container.program(5, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":11,"column":48},"end":{"line":11,"column":84}}})) != null ? stack1 : "")
    + "\">z: <span class=\"tc-ctl-coords-elevation\">"
    + alias2(alias3((depth0 != null ? lookupProperty(depth0,"ele") : depth0), depth0))
    + "</span></div>\r\n    </div>\r\n</div>\r\n"
    + ((stack1 = lookupProperty(helpers,"unless").call(alias1,(depth0 != null ? lookupProperty(depth0,"isGeo") : depth0),{"name":"unless","hash":{},"fn":container.program(7, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":14,"column":0},"end":{"line":23,"column":11}}})) != null ? stack1 : "")
    + "<sitna-button variant=\"minimal\" icon=\"close\"></sitna-button>";
},"useData":true});

/***/ })

}]);
//# sourceMappingURL=../maps/chunks/TC_templates_tc-ctl-coords_mjs.sitna.debug.js.map