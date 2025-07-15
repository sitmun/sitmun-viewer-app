"use strict";
(self["webpackChunkSITNA"] = self["webpackChunkSITNA"] || []).push([["TC_templates_tc-ctl-finfo-attr-video_mjs"],{

/***/ "./TC/templates/tc-ctl-finfo-attr-video.mjs":
/*!**************************************************!*\
  !*** ./TC/templates/tc-ctl-finfo-attr-video.mjs ***!
  \**************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({"1":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "    <iframe src=\"https://www.youtube.com/embed/"
    + alias2(lookupProperty(helpers,"getYoutubeId").call(alias1,lookupProperty(helpers,"removeSpecialAttributeTag").call(alias1,(depth0 != null ? lookupProperty(depth0,"value") : depth0),{"name":"removeSpecialAttributeTag","hash":{},"data":data,"loc":{"start":{"line":2,"column":62},"end":{"line":2,"column":95}}}),{"name":"getYoutubeId","hash":{},"data":data,"loc":{"start":{"line":2,"column":47},"end":{"line":2,"column":97}}}))
    + "\" class=\"tc-video-attr\" style=\"width:"
    + alias2(lookupProperty(helpers,"getTagWidth").call(alias1,(depth0 != null ? lookupProperty(depth0,"name") : depth0),(depth0 != null ? lookupProperty(depth0,"value") : depth0),{"name":"getTagWidth","hash":{},"data":data,"loc":{"start":{"line":2,"column":134},"end":{"line":2,"column":160}}}))
    + ";height:"
    + alias2(lookupProperty(helpers,"getTagHeight").call(alias1,(depth0 != null ? lookupProperty(depth0,"name") : depth0),(depth0 != null ? lookupProperty(depth0,"value") : depth0),{"name":"getTagHeight","hash":{},"data":data,"loc":{"start":{"line":2,"column":168},"end":{"line":2,"column":195}}}))
    + ";"
    + ((stack1 = lookupProperty(helpers,"unless").call(alias1,lookupProperty(helpers,"eq").call(alias1,lookupProperty(helpers,"getTagHeight").call(alias1,(depth0 != null ? lookupProperty(depth0,"name") : depth0),(depth0 != null ? lookupProperty(depth0,"value") : depth0),{"name":"getTagHeight","hash":{},"data":data,"loc":{"start":{"line":2,"column":210},"end":{"line":2,"column":235}}}),"auto",{"name":"eq","hash":{},"data":data,"loc":{"start":{"line":2,"column":206},"end":{"line":2,"column":243}}}),{"name":"unless","hash":{},"fn":container.program(2, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":2,"column":196},"end":{"line":2,"column":272}}})) != null ? stack1 : "")
    + "\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture\" allowfullscreen></iframe>\r\n";
},"2":function(container,depth0,helpers,partials,data) {
    return "max-height:none;";
},"4":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "    <video src=\""
    + alias2(lookupProperty(helpers,"removeSpecialAttributeTag").call(alias1,(depth0 != null ? lookupProperty(depth0,"value") : depth0),{"name":"removeSpecialAttributeTag","hash":{},"data":data,"loc":{"start":{"line":4,"column":16},"end":{"line":4,"column":51}}}))
    + "\" class=\"tc-video-attr\" style=\"width:"
    + alias2(lookupProperty(helpers,"getTagWidth").call(alias1,(depth0 != null ? lookupProperty(depth0,"name") : depth0),(depth0 != null ? lookupProperty(depth0,"value") : depth0),{"name":"getTagWidth","hash":{},"data":data,"loc":{"start":{"line":4,"column":88},"end":{"line":4,"column":114}}}))
    + ";height:"
    + alias2(lookupProperty(helpers,"getTagHeight").call(alias1,(depth0 != null ? lookupProperty(depth0,"name") : depth0),(depth0 != null ? lookupProperty(depth0,"value") : depth0),{"name":"getTagHeight","hash":{},"data":data,"loc":{"start":{"line":4,"column":122},"end":{"line":4,"column":149}}}))
    + ";"
    + ((stack1 = lookupProperty(helpers,"unless").call(alias1,lookupProperty(helpers,"eq").call(alias1,lookupProperty(helpers,"getTagHeight").call(alias1,(depth0 != null ? lookupProperty(depth0,"name") : depth0),(depth0 != null ? lookupProperty(depth0,"value") : depth0),{"name":"getTagHeight","hash":{},"data":data,"loc":{"start":{"line":4,"column":164},"end":{"line":4,"column":189}}}),"auto",{"name":"eq","hash":{},"data":data,"loc":{"start":{"line":4,"column":160},"end":{"line":4,"column":197}}}),{"name":"unless","hash":{},"fn":container.program(2, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":4,"column":150},"end":{"line":4,"column":226}}})) != null ? stack1 : "")
    + "\" controls crossorigin=\"anonymous\" playsinline=\"true\" title=\"\">"
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"videoFormatNotCompatible",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":4,"column":289},"end":{"line":4,"column":324}}}))
    + "</video>\r\n";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(helpers,"getYoutubeId").call(alias1,lookupProperty(helpers,"removeSpecialAttributeTag").call(alias1,(depth0 != null ? lookupProperty(depth0,"value") : depth0),{"name":"removeSpecialAttributeTag","hash":{},"data":data,"loc":{"start":{"line":1,"column":20},"end":{"line":1,"column":53}}}),{"name":"getYoutubeId","hash":{},"data":data,"loc":{"start":{"line":1,"column":6},"end":{"line":1,"column":54}}}),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.program(4, data, 0),"data":data,"loc":{"start":{"line":1,"column":0},"end":{"line":5,"column":7}}})) != null ? stack1 : "");
},"useData":true});

/***/ })

}]);
//# sourceMappingURL=../maps/chunks/TC_templates_tc-ctl-finfo-attr-video_mjs.sitna.debug.js.map