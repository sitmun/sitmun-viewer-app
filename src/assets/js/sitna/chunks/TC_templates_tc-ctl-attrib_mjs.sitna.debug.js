"use strict";
(self["webpackChunkSITNA"] = self["webpackChunkSITNA"] || []).push([["TC_templates_tc-ctl-attrib_mjs"],{

/***/ "./TC/templates/tc-ctl-attrib.mjs":
/*!****************************************!*\
  !*** ./TC/templates/tc-ctl-attrib.mjs ***!
  \****************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({"1":function(container,depth0,helpers,partials,data) {
    return ".es-ES";
},"3":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return " - "
    + container.escapeExpression(lookupProperty(helpers,"i18n").call(alias1,"data",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":6,"column":23},"end":{"line":6,"column":38}}}))
    + ":\r\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,((stack1 = (depth0 != null ? lookupProperty(depth0,"mainData") : depth0)) != null ? lookupProperty(stack1,"site") : stack1),{"name":"if","hash":{},"fn":container.program(4, data, 0),"inverse":container.program(6, data, 0),"data":data,"loc":{"start":{"line":7,"column":8},"end":{"line":13,"column":15}}})) != null ? stack1 : "");
},"4":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.lambda, alias2=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "            <span> <a href=\""
    + alias2(alias1(((stack1 = (depth0 != null ? lookupProperty(depth0,"mainData") : depth0)) != null ? lookupProperty(stack1,"site") : stack1), depth0))
    + "\" target=\"_blank\">"
    + alias2(alias1(((stack1 = (depth0 != null ? lookupProperty(depth0,"mainData") : depth0)) != null ? lookupProperty(stack1,"name") : stack1), depth0))
    + "</a></span>\r\n";
},"6":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),((stack1 = (depth0 != null ? lookupProperty(depth0,"mainData") : depth0)) != null ? lookupProperty(stack1,"name") : stack1),{"name":"if","hash":{},"fn":container.program(7, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":10,"column":12},"end":{"line":12,"column":19}}})) != null ? stack1 : "");
},"7":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "                <span> "
    + container.escapeExpression(container.lambda(((stack1 = (depth0 != null ? lookupProperty(depth0,"mainData") : depth0)) != null ? lookupProperty(stack1,"name") : stack1), depth0))
    + "</span>\r\n";
},"9":function(container,depth0,helpers,partials,data) {
    var lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return " - <span class=\"tc-ctl-attrib-cmd\">"
    + container.escapeExpression(lookupProperty(helpers,"i18n").call(depth0 != null ? depth0 : (container.nullContext || {}),"others",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":15,"column":56},"end":{"line":15,"column":73}}}))
    + "...</span>";
},"11":function(container,depth0,helpers,partials,data) {
    return " tc-collapsed";
},"13":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"unless").call(alias1,(data && lookupProperty(data,"first")),{"name":"unless","hash":{},"fn":container.program(14, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":17,"column":20},"end":{"line":17,"column":51}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"site") : depth0),{"name":"if","hash":{},"fn":container.program(16, data, 0),"inverse":container.program(18, data, 0),"data":data,"loc":{"start":{"line":17,"column":51},"end":{"line":17,"column":159}}})) != null ? stack1 : "");
},"14":function(container,depth0,helpers,partials,data) {
    return ", ";
},"16":function(container,depth0,helpers,partials,data) {
    var alias1=container.lambda, alias2=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<span><a href=\""
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"site") : depth0), depth0))
    + "\" target=\"_blank\">"
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"name") : depth0), depth0))
    + "</a></span>";
},"18":function(container,depth0,helpers,partials,data) {
    var lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<span>"
    + container.escapeExpression(container.lambda((depth0 != null ? lookupProperty(depth0,"name") : depth0), depth0))
    + "</span>";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<div>\r\n    <span>"
    + ((stack1 = container.lambda((depth0 != null ? lookupProperty(depth0,"api") : depth0), depth0)) != null ? stack1 : "")
    + "</span>\r\n    <span><a href=\"https://github.com/sitna/api-sitna/blob/master/README"
    + ((stack1 = lookupProperty(helpers,"unless").call(alias1,lookupProperty(helpers,"eq").call(alias1,(depth0 != null ? lookupProperty(depth0,"lang") : depth0),"en-US",{"name":"eq","hash":{},"data":data,"loc":{"start":{"line":3,"column":82},"end":{"line":3,"column":99}}}),{"name":"unless","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":3,"column":72},"end":{"line":3,"column":118}}})) != null ? stack1 : "")
    + ".md\" class=\"tc-github\" title=\""
    + container.escapeExpression(lookupProperty(helpers,"i18n").call(alias1,"attributionGithubTooltip",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":3,"column":148},"end":{"line":3,"column":183}}}))
    + "\" target=\"_blank\">\r\n    API SITNA\r\n</a></span>\r\n    "
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"mainData") : depth0),{"name":"if","hash":{},"fn":container.program(3, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":6,"column":4},"end":{"line":14,"column":11}}})) != null ? stack1 : "")
    + "    "
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"otherData") : depth0),{"name":"if","hash":{},"fn":container.program(9, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":15,"column":4},"end":{"line":15,"column":90}}})) != null ? stack1 : "")
    + "\r\n    <div class=\"tc-ctl-attrib-other"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"isCollapsed") : depth0),{"name":"if","hash":{},"fn":container.program(11, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":16,"column":35},"end":{"line":16,"column":74}}})) != null ? stack1 : "")
    + "\">\r\n	"
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,(depth0 != null ? lookupProperty(depth0,"otherData") : depth0),{"name":"each","hash":{},"fn":container.program(13, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":17,"column":1},"end":{"line":17,"column":168}}})) != null ? stack1 : "")
    + "\r\n    </div>\r\n</div>";
},"useData":true});

/***/ })

}]);
//# sourceMappingURL=../maps/chunks/TC_templates_tc-ctl-attrib_mjs.sitna.debug.js.map