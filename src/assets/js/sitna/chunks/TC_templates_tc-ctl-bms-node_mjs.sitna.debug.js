"use strict";
(self["webpackChunkSITNA"] = self["webpackChunkSITNA"] || []).push([["TC_templates_tc-ctl-bms-node_mjs"],{

/***/ "./TC/templates/tc-ctl-bms-node.mjs":
/*!******************************************!*\
  !*** ./TC/templates/tc-ctl-bms-node.mjs ***!
  \******************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({"1":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.lambda, alias2=container.escapeExpression, alias3=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<li class=\"tc-ctl-bms-node\" data-layer-name=\""
    + alias2(alias1(((stack1 = (depth0 != null ? lookupProperty(depth0,"layer") : depth0)) != null ? lookupProperty(stack1,"name") : stack1), depth0))
    + "\" data-layer-id=\""
    + alias2(alias1(((stack1 = (depth0 != null ? lookupProperty(depth0,"layer") : depth0)) != null ? lookupProperty(stack1,"id") : stack1), depth0))
    + "\" data-layer-uid=\""
    + alias2(alias1(((stack1 = (depth0 != null ? lookupProperty(depth0,"layer") : depth0)) != null ? lookupProperty(stack1,"uid") : stack1), depth0))
    + "\"><label"
    + ((stack1 = lookupProperty(helpers,"if").call(alias3,((stack1 = (depth0 != null ? lookupProperty(depth0,"layer") : depth0)) != null ? lookupProperty(stack1,"legend") : stack1),{"name":"if","hash":{},"fn":container.program(2, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":2,"column":127},"end":{"line":2,"column":211}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias3,((stack1 = (depth0 != null ? lookupProperty(depth0,"layer") : depth0)) != null ? lookupProperty(stack1,"thumbnail") : stack1),{"name":"if","hash":{},"fn":container.program(4, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":2,"column":211},"end":{"line":2,"column":293}}})) != null ? stack1 : "")
    + ">\r\n<input type=\"radio\" name=\""
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"controlId") : depth0), depth0))
    + "-bm\" value=\""
    + alias2(alias1(((stack1 = (depth0 != null ? lookupProperty(depth0,"layer") : depth0)) != null ? lookupProperty(stack1,"name") : stack1), depth0))
    + "\""
    + ((stack1 = lookupProperty(helpers,"if").call(alias3,((stack1 = (depth0 != null ? lookupProperty(depth0,"layer") : depth0)) != null ? lookupProperty(stack1,"mustReproject") : stack1),{"name":"if","hash":{},"fn":container.program(6, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":3,"column":66},"end":{"line":3,"column":121}}})) != null ? stack1 : "")
    + ">\r\n<span>"
    + alias2(alias1(((stack1 = (depth0 != null ? lookupProperty(depth0,"layer") : depth0)) != null ? lookupProperty(stack1,"title") : stack1), depth0))
    + "</span></label>\r\n<div class=\"tc-ctl-bms-info\">\r\n    <h3>"
    + alias2(alias1(((stack1 = (depth0 != null ? lookupProperty(depth0,"layer") : depth0)) != null ? lookupProperty(stack1,"title") : stack1), depth0))
    + "</h3>\r\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias3,(depth0 != null ? lookupProperty(depth0,"info") : depth0),{"name":"if","hash":{},"fn":container.program(8, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":7,"column":4},"end":{"line":19,"column":11}}})) != null ? stack1 : "")
    + "</div>\r\n</li>\r\n";
},"2":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return " style=\"background-image: url("
    + container.escapeExpression(container.lambda(((stack1 = ((stack1 = ((stack1 = (depth0 != null ? lookupProperty(depth0,"layer") : depth0)) != null ? lookupProperty(stack1,"legend") : stack1)) != null ? lookupProperty(stack1,"0") : stack1)) != null ? lookupProperty(stack1,"src") : stack1), depth0))
    + ")\"";
},"4":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return " style=\"background-image: url("
    + container.escapeExpression(container.lambda(((stack1 = (depth0 != null ? lookupProperty(depth0,"layer") : depth0)) != null ? lookupProperty(stack1,"thumbnail") : stack1), depth0))
    + ")\"";
},"6":function(container,depth0,helpers,partials,data) {
    return " class=\"tc-disabled\"";
},"8":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "        <p>"
    + container.escapeExpression(container.lambda(((stack1 = (depth0 != null ? lookupProperty(depth0,"info") : depth0)) != null ? lookupProperty(stack1,"abstract") : stack1), depth0))
    + "</p>\r\n"
    + ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),((stack1 = (depth0 != null ? lookupProperty(depth0,"info") : depth0)) != null ? lookupProperty(stack1,"metadata") : stack1),{"name":"if","hash":{},"fn":container.program(9, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":9,"column":8},"end":{"line":18,"column":15}}})) != null ? stack1 : "");
},"9":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "        <div class=\"tc-ctl-bms-metadata\">\r\n            <h4>"
    + container.escapeExpression(lookupProperty(helpers,"i18n").call(alias1,"metadata",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":11,"column":16},"end":{"line":11,"column":35}}}))
    + "</h4>\r\n            <ul>\r\n"
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,((stack1 = (depth0 != null ? lookupProperty(depth0,"info") : depth0)) != null ? lookupProperty(stack1,"metadata") : stack1),{"name":"each","hash":{},"fn":container.program(10, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":13,"column":12},"end":{"line":15,"column":21}}})) != null ? stack1 : "")
    + "        </ul>\r\n        </div>\r\n";
},"10":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.lambda, alias2=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "                <li><a href=\""
    + ((stack1 = alias1((depth0 != null ? lookupProperty(depth0,"url") : depth0), depth0)) != null ? stack1 : "")
    + "\" type=\""
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"format") : depth0), depth0))
    + "\" title=\""
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"formatDescription") : depth0), depth0))
    + "\" target=\"_blank\">"
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"formatDescription") : depth0), depth0))
    + "</a></li>\r\n";
},"12":function(container,depth0,helpers,partials,data) {
    return "<li class=\"tc-ctl-bms-node\"><label class=\"tc-loading\"></label></li>\r\n";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),(depth0 != null ? lookupProperty(depth0,"layer") : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.program(12, data, 0),"data":data,"loc":{"start":{"line":1,"column":0},"end":{"line":24,"column":7}}})) != null ? stack1 : "");
},"useData":true});

/***/ })

}]);
//# sourceMappingURL=../maps/chunks/TC_templates_tc-ctl-bms-node_mjs.sitna.debug.js.map