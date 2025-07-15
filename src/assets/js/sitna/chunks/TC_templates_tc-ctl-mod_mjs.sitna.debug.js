"use strict";
(self["webpackChunkSITNA"] = self["webpackChunkSITNA"] || []).push([["TC_templates_tc-ctl-mod_mjs"],{

/***/ "./TC/templates/tc-ctl-mod.mjs":
/*!*************************************!*\
  !*** ./TC/templates/tc-ctl-mod.mjs ***!
  \*************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({"1":function(container,depth0,helpers,partials,data) {
    return " tc-hidden";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.escapeExpression, alias3=container.lambda, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<div class=\"tc-ctl-mod-btn\">\r\n    <button type=\"button\" class=\"tc-ctl-btn tc-ctl-mod-btn-select\" disabled title=\""
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"select",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":2,"column":83},"end":{"line":2,"column":100}}}))
    + "\">"
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"select",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":2,"column":102},"end":{"line":2,"column":119}}}))
    + "</button><button type=\"button\" class=\"tc-ctl-btn tc-ctl-mod-btn-delete\" disabled title=\""
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"deleteSelectedFeatures",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":2,"column":207},"end":{"line":2,"column":240}}}))
    + "\">\r\n        "
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"deleteSelectedFeatures",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":3,"column":8},"end":{"line":3,"column":41}}}))
    + "\r\n    </button><button type=\"button\" class=\"tc-ctl-btn tc-ctl-mod-btn-del-vertex\" disabled title=\""
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"deleteVertices",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":4,"column":96},"end":{"line":4,"column":121}}}))
    + "\">\r\n        "
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"deleteVertices",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":5,"column":8},"end":{"line":5,"column":33}}}))
    + "\r\n    </button><button type=\"button\" class=\"tc-ctl-btn tc-ctl-mod-btn-join\" disabled title=\""
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"joinGeometries.tooltip",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":6,"column":90},"end":{"line":6,"column":123}}}))
    + "\">\r\n        "
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"joinGeometries",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":7,"column":8},"end":{"line":7,"column":33}}}))
    + "\r\n    </button><button type=\"button\" class=\"tc-ctl-btn tc-ctl-mod-btn-split\" disabled title=\""
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"splitGeometry",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":8,"column":91},"end":{"line":8,"column":115}}}))
    + "\">\r\n        "
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"splitGeometry",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":9,"column":8},"end":{"line":9,"column":32}}}))
    + "\r\n    </button><button type=\"button\" class=\"tc-ctl-btn tc-ctl-mod-btn-attr\" disabled title=\""
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"editAttributes",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":10,"column":90},"end":{"line":10,"column":115}}}))
    + "\">\r\n        "
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"editAttributes",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":11,"column":8},"end":{"line":11,"column":33}}}))
    + "\r\n    </button><button type=\"button\" class=\"tc-ctl-btn tc-ctl-mod-btn-text\" contenteditable=\"true\" disabled title=\""
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"addText",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":12,"column":113},"end":{"line":12,"column":131}}}))
    + "\">\r\n        "
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"addText",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":13,"column":8},"end":{"line":13,"column":26}}}))
    + "\r\n    </button>\r\n</div>\r\n<div class=\"tc-ctl-mod-style"
    + ((stack1 = lookupProperty(helpers,"unless").call(alias1,(depth0 != null ? lookupProperty(depth0,"stylable") : depth0),{"name":"unless","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":16,"column":28},"end":{"line":16,"column":69}}})) != null ? stack1 : "")
    + "\">\r\n    <sitna-feature-styler></sitna-feature-styler>\r\n</div>\r\n<div class=\"tc-ctl-mod-style-label tc-hidden\">\r\n    <input type=\"text\" class=\"tc-ctl-mod-txt tc-textbox\" placeholder=\""
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"writeTextForFeature",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":20,"column":70},"end":{"line":20,"column":100}}}))
    + "\" style=\"font-size:"
    + alias2(alias3((depth0 != null ? lookupProperty(depth0,"fontSize") : depth0), depth0))
    + "pt;font-color:"
    + alias2(alias3((depth0 != null ? lookupProperty(depth0,"fontColor") : depth0), depth0))
    + ";text-shadow: 0 0 "
    + alias2(alias3((depth0 != null ? lookupProperty(depth0,"labelOutlineWidth") : depth0), depth0))
    + "px "
    + alias2(alias3((depth0 != null ? lookupProperty(depth0,"labelOutlineColor") : depth0), depth0))
    + ";\" />\r\n    "
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"textColor",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":21,"column":4},"end":{"line":21,"column":24}}}))
    + "\r\n    <input type=\"color\" class=\"tc-ctl-mod-fnt-c\" value=\""
    + alias2(alias3((depth0 != null ? lookupProperty(depth0,"fontColor") : depth0), depth0))
    + "\" />\r\n    "
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"fontSize",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":23,"column":4},"end":{"line":23,"column":23}}}))
    + "\r\n    <input type=\"number\" class=\"tc-ctl-mod-fnt-s tc-textbox\" value=\""
    + alias2(alias3((depth0 != null ? lookupProperty(depth0,"fontSize") : depth0), depth0))
    + "\" min=\"7\" max=\"20\" />\r\n</div>\r\n<div class=\"tc-ctl-mod-attr tc-hidden\"></div>\r\n";
},"useData":true});

/***/ })

}]);
//# sourceMappingURL=../maps/chunks/TC_templates_tc-ctl-mod_mjs.sitna.debug.js.map