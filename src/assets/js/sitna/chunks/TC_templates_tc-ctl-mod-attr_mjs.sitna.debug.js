"use strict";
(self["webpackChunkSITNA"] = self["webpackChunkSITNA"] || []).push([["TC_templates_tc-ctl-mod-attr_mjs"],{

/***/ "./TC/templates/tc-ctl-mod-attr.mjs":
/*!******************************************!*\
  !*** ./TC/templates/tc-ctl-mod-attr.mjs ***!
  \******************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({"1":function(container,depth0,helpers,partials,data) {
    var alias1=container.lambda, alias2=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "                <tr>\r\n                    <th>"
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"name") : depth0), depth0))
    + "</th>\r\n                    <td>\r\n                        <input type=\"text\" class=\"tc-textbox\" name=\""
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"name") : depth0), depth0))
    + "\" value=\""
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"value") : depth0), depth0))
    + "\" />\r\n                    </td>\r\n                </tr>\r\n";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<div class=\"tc-ctl-mod-attr\">\r\n    <h3>"
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"attributeEdit",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":2,"column":8},"end":{"line":2,"column":32}}}))
    + "</h3>\r\n    <div class=\"tc-ctl-mod-attr-body\">\r\n        <table>\r\n            <tbody>\r\n"
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,(depth0 != null ? lookupProperty(depth0,"data") : depth0),{"name":"each","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":6,"column":16},"end":{"line":13,"column":25}}})) != null ? stack1 : "")
    + "            </tbody>\r\n        </table>\r\n    </div>\r\n    <div class=\"tc-ctl-mod-attr-footer\">\r\n        <button type=\"button\" class=\"tc-button tc-ctl-mod-btn-attr-ok\">"
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"ok",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":18,"column":71},"end":{"line":18,"column":84}}}))
    + "</button>\r\n        <button type=\"button\" class=\"tc-button tc-ctl-mod-btn-attr-cancel\">"
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"cancel",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":19,"column":75},"end":{"line":19,"column":92}}}))
    + "</button>\r\n    </div>\r\n</div>\r\n";
},"useData":true});

/***/ })

}]);
//# sourceMappingURL=../maps/chunks/TC_templates_tc-ctl-mod-attr_mjs.sitna.debug.js.map