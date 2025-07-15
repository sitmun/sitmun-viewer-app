"use strict";
(self["webpackChunkSITNA"] = self["webpackChunkSITNA"] || []).push([["TC_templates_tc-ctl-toc-node_mjs"],{

/***/ "./TC/templates/tc-ctl-toc-node.mjs":
/*!******************************************!*\
  !*** ./TC/templates/tc-ctl-toc-node.mjs ***!
  \******************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({"1":function(container,depth0,helpers,partials,data) {
    return " class=\"tc-ctl-toc-node\" ";
},"3":function(container,depth0,helpers,partials,data) {
    return " class=\"tc-ctl-toc-node tc-ctl-toc-leaf\" ";
},"5":function(container,depth0,helpers,partials,data) {
    return "<button type=\"button\" class=\"tc-ctl-toc-collapse-btn\"></button>";
},"7":function(container,depth0,helpers,partials,data) {
    return " tc-hidden";
},"9":function(container,depth0,helpers,partials,data) {
    return " checked";
},"11":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = container.invokePartial(lookupProperty(partials,"tc-ctl-toc-node"),depth0,{"name":"tc-ctl-toc-node","data":data,"indent":"        ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.lambda, alias3=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<li "
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"children") : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.program(3, data, 0),"data":data,"loc":{"start":{"line":1,"column":4},"end":{"line":1,"column":101}}})) != null ? stack1 : "")
    + " data-layer-name=\""
    + alias3(alias2((depth0 != null ? lookupProperty(depth0,"name") : depth0), depth0))
    + "\" data-layer-uid=\""
    + alias3(alias2((depth0 != null ? lookupProperty(depth0,"uid") : depth0), depth0))
    + "\">\r\n    "
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"children") : depth0),{"name":"if","hash":{},"fn":container.program(5, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":2,"column":4},"end":{"line":2,"column":90}}})) != null ? stack1 : "")
    + "\r\n    <input type=\"checkbox\" class=\"tc-toggle"
    + ((stack1 = lookupProperty(helpers,"unless").call(alias1,(depth0 != null ? lookupProperty(depth0,"name") : depth0),{"name":"unless","hash":{},"fn":container.program(7, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":3,"column":43},"end":{"line":3,"column":80}}})) != null ? stack1 : "")
    + "\" name=\"toc\" value=\""
    + alias3(alias2((depth0 != null ? lookupProperty(depth0,"name") : depth0), depth0))
    + "\" "
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"isVisible") : depth0),{"name":"if","hash":{},"fn":container.program(9, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":3,"column":110},"end":{"line":3,"column":142}}})) != null ? stack1 : "")
    + " /><span>"
    + alias3(alias2((depth0 != null ? lookupProperty(depth0,"title") : depth0), depth0))
    + "</span>\r\n    <ul class=\"tc-ctl-toc-branch\">\r\n"
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,(depth0 != null ? lookupProperty(depth0,"children") : depth0),{"name":"each","hash":{},"fn":container.program(11, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":5,"column":8},"end":{"line":7,"column":17}}})) != null ? stack1 : "")
    + "    </ul>\r\n</li>";
},"usePartial":true,"useData":true});

/***/ })

}]);
//# sourceMappingURL=../maps/chunks/TC_templates_tc-ctl-toc-node_mjs.sitna.debug.js.map