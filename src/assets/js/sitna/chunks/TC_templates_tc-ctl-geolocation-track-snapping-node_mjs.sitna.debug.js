"use strict";
(self["webpackChunkSITNA"] = self["webpackChunkSITNA"] || []).push([["TC_templates_tc-ctl-geolocation-track-snapping-node_mjs"],{

/***/ "./TC/templates/tc-ctl-geolocation-track-snapping-node.mjs":
/*!*****************************************************************!*\
  !*** ./TC/templates/tc-ctl-geolocation-track-snapping-node.mjs ***!
  \*****************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({"1":function(container,depth0,helpers,partials,data) {
    var alias1=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "    <li>\r\n        <span>"
    + alias1(lookupProperty(helpers,"i18n").call(depth0 != null ? depth0 : (container.nullContext || {}),"geo.trk.snapping.name",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":4,"column":14},"end":{"line":4,"column":46}}}))
    + ":</span> "
    + alias1(container.lambda((depth0 != null ? lookupProperty(depth0,"n") : depth0), depth0))
    + "\r\n    </li>\r\n";
},"3":function(container,depth0,helpers,partials,data) {
    var lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return container.escapeExpression(lookupProperty(helpers,"i18n").call(depth0 != null ? depth0 : (container.nullContext || {}),"lon",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":7,"column":28},"end":{"line":7,"column":42}}}));
},"5":function(container,depth0,helpers,partials,data) {
    return "X";
},"7":function(container,depth0,helpers,partials,data) {
    var lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return container.escapeExpression(lookupProperty(helpers,"i18n").call(depth0 != null ? depth0 : (container.nullContext || {}),"lat",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":8,"column":28},"end":{"line":8,"column":42}}}));
},"9":function(container,depth0,helpers,partials,data) {
    return "Y";
},"11":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"unless").call(alias1,lookupProperty(helpers,"eq").call(alias1,(depth0 != null ? lookupProperty(depth0,"z") : depth0),0,{"name":"eq","hash":{},"data":data,"loc":{"start":{"line":10,"column":14},"end":{"line":10,"column":22}}}),{"name":"unless","hash":{},"fn":container.program(12, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":10,"column":4},"end":{"line":12,"column":15}}})) != null ? stack1 : "");
},"12":function(container,depth0,helpers,partials,data) {
    var lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "    <li> <span>Z:</span> <span class=\"tc-original\"> "
    + container.escapeExpression(container.lambda((depth0 != null ? lookupProperty(depth0,"z") : depth0), depth0))
    + " </span></li>\r\n";
},"14":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"unless").call(alias1,lookupProperty(helpers,"eq").call(alias1,(depth0 != null ? lookupProperty(depth0,"mdtz") : depth0),0,{"name":"eq","hash":{},"data":data,"loc":{"start":{"line":15,"column":14},"end":{"line":15,"column":25}}}),{"name":"unless","hash":{},"fn":container.program(15, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":15,"column":4},"end":{"line":17,"column":15}}})) != null ? stack1 : "");
},"15":function(container,depth0,helpers,partials,data) {
    var lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "    <li> <span>Z:</span> <span class=\"tc-mdt\"> "
    + container.escapeExpression(container.lambda((depth0 != null ? lookupProperty(depth0,"mdtz") : depth0), depth0))
    + " </span> </li>\r\n";
},"17":function(container,depth0,helpers,partials,data) {
    var lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "    <li> "
    + container.escapeExpression(container.lambda((depth0 != null ? lookupProperty(depth0,"m") : depth0), depth0))
    + " </li>\r\n";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.lambda, alias3=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<ul>\r\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"n") : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":2,"column":4},"end":{"line":6,"column":11}}})) != null ? stack1 : "")
    + "    <li> <span>"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"isGeo") : depth0),{"name":"if","hash":{},"fn":container.program(3, data, 0),"inverse":container.program(5, data, 0),"data":data,"loc":{"start":{"line":7,"column":15},"end":{"line":7,"column":58}}})) != null ? stack1 : "")
    + ":</span> "
    + alias3(alias2((depth0 != null ? lookupProperty(depth0,"x") : depth0), depth0))
    + "</li>\r\n    <li> <span>"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"isGeo") : depth0),{"name":"if","hash":{},"fn":container.program(7, data, 0),"inverse":container.program(9, data, 0),"data":data,"loc":{"start":{"line":8,"column":15},"end":{"line":8,"column":58}}})) != null ? stack1 : "")
    + ":</span> "
    + alias3(alias2((depth0 != null ? lookupProperty(depth0,"y") : depth0), depth0))
    + " </li>\r\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"z") : depth0),{"name":"if","hash":{},"fn":container.program(11, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":9,"column":4},"end":{"line":13,"column":11}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"mdtz") : depth0),{"name":"if","hash":{},"fn":container.program(14, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":14,"column":4},"end":{"line":18,"column":11}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"m") : depth0),{"name":"if","hash":{},"fn":container.program(17, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":19,"column":4},"end":{"line":21,"column":11}}})) != null ? stack1 : "")
    + "</ul>";
},"useData":true});

/***/ })

}]);
//# sourceMappingURL=../maps/chunks/TC_templates_tc-ctl-geolocation-track-snapping-node_mjs.sitna.debug.js.map