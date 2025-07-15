"use strict";
(self["webpackChunkSITNA"] = self["webpackChunkSITNA"] || []).push([["TC_templates_tc-ctl-edit_mjs"],{

/***/ "./TC/templates/tc-ctl-edit.mjs":
/*!**************************************!*\
  !*** ./TC/templates/tc-ctl-edit.mjs ***!
  \**************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({"1":function(container,depth0,helpers,partials,data) {
    var alias1=container.escapeExpression, alias2=container.lambda, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<sitna-tab class=\"tc-ctl-edit-btn-other\" title=\""
    + alias1(lookupProperty(helpers,"i18n").call(depth0 != null ? depth0 : (container.nullContext || {}),"otherTools",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":8,"column":82},"end":{"line":8,"column":103}}}))
    + "\" group=\""
    + alias1(alias2((depth0 != null ? lookupProperty(depth0,"controlId") : depth0), depth0))
    + "-mode\" for=\""
    + alias1(alias2((depth0 != null ? lookupProperty(depth0,"controlId") : depth0), depth0))
    + "-mode-other\"></sitna-tab>";
},"3":function(container,depth0,helpers,partials,data) {
    return " snapping";
},"5":function(container,depth0,helpers,partials,data) {
    return " stylable";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.escapeExpression, alias3=container.lambda, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<h2>"
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"featureEditing",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":1,"column":4},"end":{"line":1,"column":29}}}))
    + "</h2>\r\n<div class=\"tc-ctl-edit-tools\">\r\n    <div class=\"tc-ctl-edit-mode\">\r\n        <sitna-tab class=\"tc-ctl-edit-btn-modify\" title=\""
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"select",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":4,"column":57},"end":{"line":4,"column":74}}}))
    + "\" group=\""
    + alias2(alias3((depth0 != null ? lookupProperty(depth0,"controlId") : depth0), depth0))
    + "-mode\" for=\""
    + alias2(alias3((depth0 != null ? lookupProperty(depth0,"controlId") : depth0), depth0))
    + "-mode-modify\"></sitna-tab>\r\n        <sitna-tab class=\"tc-ctl-edit-btn-point\"  title=\""
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"newPoint",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":5,"column":57},"end":{"line":5,"column":76}}}))
    + "\" group=\""
    + alias2(alias3((depth0 != null ? lookupProperty(depth0,"controlId") : depth0), depth0))
    + "-mode\" for=\""
    + alias2(alias3((depth0 != null ? lookupProperty(depth0,"controlId") : depth0), depth0))
    + "-mode-addpoint\"></sitna-tab>\r\n        <sitna-tab class=\"tc-ctl-edit-btn-line\" title=\""
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"newLine",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":6,"column":55},"end":{"line":6,"column":73}}}))
    + "\" group=\""
    + alias2(alias3((depth0 != null ? lookupProperty(depth0,"controlId") : depth0), depth0))
    + "-mode\" for=\""
    + alias2(alias3((depth0 != null ? lookupProperty(depth0,"controlId") : depth0), depth0))
    + "-mode-addline\"></sitna-tab>\r\n        <sitna-tab class=\"tc-ctl-edit-btn-polygon\" title=\""
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"newPolygon",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":7,"column":58},"end":{"line":7,"column":79}}}))
    + "\" group=\""
    + alias2(alias3((depth0 != null ? lookupProperty(depth0,"controlId") : depth0), depth0))
    + "-mode\" for=\""
    + alias2(alias3((depth0 != null ? lookupProperty(depth0,"controlId") : depth0), depth0))
    + "-mode-addpolygon\"></sitna-tab>\r\n        "
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"otherToolsIncluded") : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":8,"column":8},"end":{"line":8,"column":182}}})) != null ? stack1 : "")
    + "\r\n    </div>\r\n    <div id=\""
    + alias2(alias3((depth0 != null ? lookupProperty(depth0,"controlId") : depth0), depth0))
    + "-mode-modify\" class=\"tc-ctl-edit-modify tc-hidden\">\r\n        <sitna-modify"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"snapping") : depth0),{"name":"if","hash":{},"fn":container.program(3, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":11,"column":21},"end":{"line":11,"column":53}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"stylable") : depth0),{"name":"if","hash":{},"fn":container.program(5, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":11,"column":53},"end":{"line":11,"column":85}}})) != null ? stack1 : "")
    + "></sitna-modify>\r\n    </div>\r\n    <div id=\""
    + alias2(alias3((depth0 != null ? lookupProperty(depth0,"controlId") : depth0), depth0))
    + "-mode-addpoint\" class=\"tc-ctl-edit-point tc-hidden\">\r\n        <sitna-draw mode=\"point\" measurer borrowed-layer"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"stylable") : depth0),{"name":"if","hash":{},"fn":container.program(5, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":14,"column":56},"end":{"line":14,"column":88}}})) != null ? stack1 : "")
    + "></sitna-draw>\r\n    </div>\r\n    <div id=\""
    + alias2(alias3((depth0 != null ? lookupProperty(depth0,"controlId") : depth0), depth0))
    + "-mode-addline\" class=\"tc-ctl-edit-line tc-hidden\">\r\n        <sitna-draw mode=\"polyline\" measurer borrowed-layer"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"stylable") : depth0),{"name":"if","hash":{},"fn":container.program(5, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":17,"column":59},"end":{"line":17,"column":91}}})) != null ? stack1 : "")
    + "></sitna-draw>\r\n    </div>\r\n    <div id=\""
    + alias2(alias3((depth0 != null ? lookupProperty(depth0,"controlId") : depth0), depth0))
    + "-mode-addpolygon\" class=\"tc-ctl-edit-polygon tc-hidden\">\r\n        <sitna-draw mode=\"polygon\" measurer borrowed-layer"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"stylable") : depth0),{"name":"if","hash":{},"fn":container.program(5, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":20,"column":58},"end":{"line":20,"column":90}}})) != null ? stack1 : "")
    + "></sitna-draw>\r\n    </div>\r\n    <div id=\""
    + alias2(alias3((depth0 != null ? lookupProperty(depth0,"controlId") : depth0), depth0))
    + "-mode-other\" class=\"tc-ctl-edit-other tc-hidden\">\r\n        <button type=\"button\" class=\"tc-button tc-ctl-edit-btn-import\">"
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"importFromOtherLayer",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":23,"column":71},"end":{"line":23,"column":102}}}))
    + "</button><button type=\"button\" class=\"tc-button tc-ctl-edit-btn-dl\">"
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"download",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":23,"column":170},"end":{"line":23,"column":189}}}))
    + "</button>\r\n    </div>\r\n    <sitna-measurement></sitna-measurement>\r\n</div>";
},"useData":true});

/***/ })

}]);
//# sourceMappingURL=../maps/chunks/TC_templates_tc-ctl-edit_mjs.sitna.debug.js.map