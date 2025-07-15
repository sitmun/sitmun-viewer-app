"use strict";
(self["webpackChunkSITNA"] = self["webpackChunkSITNA"] || []).push([["TC_templates_tc-ctl-wfsquery-dialog_mjs"],{

/***/ "./TC/templates/tc-ctl-wfsquery-dialog.mjs":
/*!*************************************************!*\
  !*** ./TC/templates/tc-ctl-wfsquery-dialog.mjs ***!
  \*************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({"1":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "                <div>\r\n                    <select class=\"tc-combo\" name=\"availableLayers\">\r\n                        <option value=\"\">"
    + container.escapeExpression(lookupProperty(helpers,"i18n").call(alias1,"query.chooseALayerCombo",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":13,"column":41},"end":{"line":13,"column":75}}}))
    + "</option>\r\n"
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,(depth0 != null ? lookupProperty(depth0,"layers") : depth0),{"name":"each","hash":{},"fn":container.program(2, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":14,"column":24},"end":{"line":16,"column":33}}})) != null ? stack1 : "")
    + "                    </select>\r\n                </div>            \r\n";
},"2":function(container,depth0,helpers,partials,data) {
    var alias1=container.lambda, alias2=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "                        <option value=\""
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"name") : depth0), depth0))
    + "\">"
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"title") : depth0), depth0))
    + "</option>\r\n";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.escapeExpression, alias2=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<div class=\"tc-ctl-wfsquery-dialog tc-modal\">\r\n    <div class=\"tc-modal-background tc-modal-close\"></div>\r\n    <div class=\"tc-modal-window tc-ctl-wfsquery-modal-window\" >\r\n        <div class=\"tc-modal-header\">\r\n            <h3>"
    + alias1(container.lambda((depth0 != null ? lookupProperty(depth0,"layerName") : depth0), depth0))
    + "</h3>\r\n            <div title=\""
    + alias1(lookupProperty(helpers,"i18n").call(alias2,"query.tooltipCloseDialogBtn",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":6,"column":24},"end":{"line":6,"column":62}}}))
    + "\" class=\"tc-modal-close\"></div>\r\n        </div>\r\n        <div class=\"tc-modal-body\">\r\n            \r\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias2,lookupProperty(helpers,"gt").call(alias2,((stack1 = (depth0 != null ? lookupProperty(depth0,"layers") : depth0)) != null ? lookupProperty(stack1,"length") : stack1),1,{"name":"gt","hash":{},"data":data,"loc":{"start":{"line":10,"column":18},"end":{"line":10,"column":38}}}),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":10,"column":12},"end":{"line":19,"column":19}}})) != null ? stack1 : "")
    + "                <div class=\"tc-modal-form\">\r\n                </div>\r\n                <div class=\"tc-ctl-wfsquery-message tc-hidden\"></div>                 \r\n            </div>\r\n        <div class=\"tc-modal-footer\">\r\n            <button type=\"button\" title=\""
    + alias1(lookupProperty(helpers,"i18n").call(alias2,"query.tooltipSendQueryBtn",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":25,"column":41},"end":{"line":25,"column":77}}}))
    + "\" class=\"tc-button tc-ctl-wlm-btn-launch\">"
    + alias1(lookupProperty(helpers,"i18n").call(alias2,"query.sendQueryBtnText",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":25,"column":119},"end":{"line":25,"column":152}}}))
    + "</button>\r\n            <button type=\"button\" title=\""
    + alias1(lookupProperty(helpers,"i18n").call(alias2,"query.cancelQueryTooltip",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":26,"column":41},"end":{"line":26,"column":76}}}))
    + "\" class=\"tc-button tc-modal-close\">"
    + alias1(lookupProperty(helpers,"i18n").call(alias2,"query.cancelQueryButton",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":26,"column":111},"end":{"line":26,"column":145}}}))
    + "</button>\r\n        </div>\r\n    </div>\r\n</div>";
},"useData":true});

/***/ })

}]);
//# sourceMappingURL=../maps/chunks/TC_templates_tc-ctl-wfsquery-dialog_mjs.sitna.debug.js.map