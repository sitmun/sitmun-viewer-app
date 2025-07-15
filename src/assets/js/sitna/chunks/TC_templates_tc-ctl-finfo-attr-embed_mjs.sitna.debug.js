"use strict";
(self["webpackChunkSITNA"] = self["webpackChunkSITNA"] || []).push([["TC_templates_tc-ctl-finfo-attr-embed_mjs"],{

/***/ "./TC/templates/tc-ctl-finfo-attr-embed.mjs":
/*!**************************************************!*\
  !*** ./TC/templates/tc-ctl-finfo-attr-embed.mjs ***!
  \**************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({"1":function(container,depth0,helpers,partials,data) {
    return "max-height:none";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<div><a href=\""
    + alias2(lookupProperty(helpers,"removeSpecialAttributeTag").call(alias1,(depth0 != null ? lookupProperty(depth0,"value") : depth0),{"name":"removeSpecialAttributeTag","hash":{},"data":data,"loc":{"start":{"line":1,"column":14},"end":{"line":1,"column":49}}}))
    + "\" class=\"tc-embed-attr\" target=\"_blank\" title=\""
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"linkInNewWindow",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":1,"column":96},"end":{"line":1,"column":122}}}))
    + "\">"
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"openInNewTab",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":1,"column":124},"end":{"line":1,"column":147}}}))
    + "</a></div>\r\n<iframe src=\""
    + alias2(lookupProperty(helpers,"removeSpecialAttributeTag").call(alias1,(depth0 != null ? lookupProperty(depth0,"value") : depth0),{"name":"removeSpecialAttributeTag","hash":{},"data":data,"loc":{"start":{"line":2,"column":13},"end":{"line":2,"column":48}}}))
    + "\" class=\"tc-embed-attr\" style=\"width:"
    + alias2(lookupProperty(helpers,"getTagWidth").call(alias1,(depth0 != null ? lookupProperty(depth0,"name") : depth0),(depth0 != null ? lookupProperty(depth0,"value") : depth0),{"name":"getTagWidth","hash":{},"data":data,"loc":{"start":{"line":2,"column":85},"end":{"line":2,"column":111}}}))
    + ";height:"
    + alias2(lookupProperty(helpers,"getTagHeight").call(alias1,(depth0 != null ? lookupProperty(depth0,"name") : depth0),(depth0 != null ? lookupProperty(depth0,"value") : depth0),{"name":"getTagHeight","hash":{},"data":data,"loc":{"start":{"line":2,"column":119},"end":{"line":2,"column":146}}}))
    + ";"
    + ((stack1 = lookupProperty(helpers,"unless").call(alias1,lookupProperty(helpers,"eq").call(alias1,lookupProperty(helpers,"getTagHeight").call(alias1,(depth0 != null ? lookupProperty(depth0,"name") : depth0),(depth0 != null ? lookupProperty(depth0,"value") : depth0),{"name":"getTagHeight","hash":{},"data":data,"loc":{"start":{"line":2,"column":161},"end":{"line":2,"column":186}}}),"auto",{"name":"eq","hash":{},"data":data,"loc":{"start":{"line":2,"column":157},"end":{"line":2,"column":194}}}),{"name":"unless","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":2,"column":147},"end":{"line":2,"column":222}}})) != null ? stack1 : "")
    + ";\" allow=\"autoplay; fullscreen; picture-in-picture\" allowfullscreen></iframe>";
},"useData":true});

/***/ })

}]);
//# sourceMappingURL=../maps/chunks/TC_templates_tc-ctl-finfo-attr-embed_mjs.sitna.debug.js.map