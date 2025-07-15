"use strict";
(self["webpackChunkSITNA"] = self["webpackChunkSITNA"] || []).push([["TC_templates_tc-ctl-wlm-elm_mjs"],{

/***/ "./TC/templates/tc-ctl-wlm-elm.mjs":
/*!*****************************************!*\
  !*** ./TC/templates/tc-ctl-wlm-elm.mjs ***!
  \*****************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({"1":function(container,depth0,helpers,partials,data) {
    var lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return container.escapeExpression(container.lambda((depth0 != null ? lookupProperty(depth0,"title") : depth0), depth0));
},"3":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"unless").call(alias1,(data && lookupProperty(data,"first")),{"name":"unless","hash":{},"fn":container.program(4, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":3,"column":89},"end":{"line":3,"column":126}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,depth0,{"name":"each","hash":{},"fn":container.program(6, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":3,"column":126},"end":{"line":3,"column":196}}})) != null ? stack1 : "");
},"4":function(container,depth0,helpers,partials,data) {
    return " &bull; ";
},"6":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"unless").call(depth0 != null ? depth0 : (container.nullContext || {}),(data && lookupProperty(data,"first")),{"name":"unless","hash":{},"fn":container.program(7, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":3,"column":140},"end":{"line":3,"column":179}}})) != null ? stack1 : "")
    + container.escapeExpression(container.lambda(depth0, depth0));
},"7":function(container,depth0,helpers,partials,data) {
    return " &rsaquo; ";
},"9":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<span>"
    + ((stack1 = lookupProperty(helpers,"each").call(depth0 != null ? depth0 : (container.nullContext || {}),depth0,{"name":"each","hash":{},"fn":container.program(6, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":3,"column":244},"end":{"line":3,"column":314}}})) != null ? stack1 : "")
    + "</span>";
},"11":function(container,depth0,helpers,partials,data) {
    var lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<sitna-toggle class=\"tc-ctl-wlm-cb-info\" text=\""
    + container.escapeExpression(lookupProperty(helpers,"i18n").call(depth0 != null ? depth0 : (container.nullContext || {}),"infoFromThisLayer",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":6,"column":109},"end":{"line":6,"column":137}}}))
    + "\" checked-icon-text=\"&#xe923;\" unchecked-icon-text=\"&#xe923;\"></sitna-toggle>";
},"13":function(container,depth0,helpers,partials,data) {
    return " checked ";
},"15":function(container,depth0,helpers,partials,data) {
    var lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<sitna-button variant=\"minimal\" icon-text=\"&#xe917;\" class=\"tc-ctl-wlm-btn-zoom\" text=\""
    + container.escapeExpression(lookupProperty(helpers,"i18n").call(depth0 != null ? depth0 : (container.nullContext || {}),"zoomToLayerExtent",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":8,"column":151},"end":{"line":8,"column":179}}}))
    + "\"></sitna-button>";
},"17":function(container,depth0,helpers,partials,data) {
    return " disabled";
},"19":function(container,depth0,helpers,partials,data) {
    var lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "text=\""
    + container.escapeExpression(lookupProperty(helpers,"i18n").call(depth0 != null ? depth0 : (container.nullContext || {}),"removeLayerFromMap",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":9,"column":180},"end":{"line":9,"column":209}}}))
    + "\" ";
},"21":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "            <div class=\"tc-ctl-wlm-abstract\">\r\n                <h4>"
    + container.escapeExpression(lookupProperty(helpers,"i18n").call(alias1,"abstract",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":17,"column":20},"end":{"line":17,"column":39}}}))
    + "</h4>\r\n"
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,(depth0 != null ? lookupProperty(depth0,"abstract") : depth0),{"name":"each","hash":{},"fn":container.program(22, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":18,"column":16},"end":{"line":20,"column":25}}})) != null ? stack1 : "")
    + "            </div>\r\n";
},"22":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "                <div><pre>"
    + ((stack1 = container.lambda(depth0, depth0)) != null ? stack1 : "")
    + "</pre></div>\r\n";
},"24":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "            <ul class=\"tc-ctl-wlm-custom-legend\">\r\n                "
    + ((stack1 = container.lambda((depth0 != null ? lookupProperty(depth0,"customLegend") : depth0), depth0)) != null ? stack1 : "")
    + "\r\n            </ul>\r\n";
},"26":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),((stack1 = (depth0 != null ? lookupProperty(depth0,"legend") : depth0)) != null ? lookupProperty(stack1,"length") : stack1),{"name":"if","hash":{},"fn":container.program(27, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":28,"column":16},"end":{"line":37,"column":23}}})) != null ? stack1 : "");
},"27":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.escapeExpression, alias2=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "                <div class=\"tc-ctl-wlm-legend\" data-layer-name=\""
    + alias1(container.lambda((depth0 != null ? lookupProperty(depth0,"layerNames") : depth0), depth0))
    + "\">\r\n                    <h4>"
    + alias1(lookupProperty(helpers,"i18n").call(alias2,"content",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":30,"column":24},"end":{"line":30,"column":42}}}))
    + ":</h4>\r\n"
    + ((stack1 = lookupProperty(helpers,"each").call(alias2,(depth0 != null ? lookupProperty(depth0,"legend") : depth0),{"name":"each","hash":{},"fn":container.program(28, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":31,"column":20},"end":{"line":35,"column":29}}})) != null ? stack1 : "")
    + "                </div>\r\n";
},"28":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"each").call(depth0 != null ? depth0 : (container.nullContext || {}),depth0,{"name":"each","hash":{},"fn":container.program(29, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":32,"column":24},"end":{"line":34,"column":33}}})) != null ? stack1 : "");
},"29":function(container,depth0,helpers,partials,data) {
    var alias1=container.lambda, alias2=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "                    <div><p>"
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"title") : depth0), depth0))
    + "</p><img data-img=\""
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"src") : depth0), depth0))
    + "\" /></div>\r\n";
},"31":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "            <div class=\"tc-ctl-wlm-metadata\">\r\n                <h4>"
    + container.escapeExpression(lookupProperty(helpers,"i18n").call(alias1,"metadata",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":41,"column":20},"end":{"line":41,"column":39}}}))
    + ":</h4>\r\n                <ul>\r\n"
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,(depth0 != null ? lookupProperty(depth0,"metadata") : depth0),{"name":"each","hash":{},"fn":container.program(32, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":43,"column":20},"end":{"line":51,"column":29}}})) != null ? stack1 : "")
    + "                </ul>\r\n            </div>\r\n";
},"32":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "                    <li>\r\n                        <ul>\r\n"
    + ((stack1 = lookupProperty(helpers,"each").call(depth0 != null ? depth0 : (container.nullContext || {}),depth0,{"name":"each","hash":{},"fn":container.program(33, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":46,"column":24},"end":{"line":48,"column":33}}})) != null ? stack1 : "")
    + "                        </ul>\r\n                    </li>\r\n";
},"33":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.lambda, alias2=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "                            <li><a href=\""
    + ((stack1 = alias1((depth0 != null ? lookupProperty(depth0,"url") : depth0), depth0)) != null ? stack1 : "")
    + "\" type=\""
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"format") : depth0), depth0))
    + "\" title=\""
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"formatDescription") : depth0), depth0))
    + "\" target=\"_blank\">"
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"formatDescription") : depth0), depth0))
    + "</a></li>\r\n";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.lambda, alias2=container.escapeExpression, alias3=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<li class=\"tc-ctl-wlm-elm\" tabindex=\"-1\">\r\n    <div title=\""
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"title") : depth0), depth0))
    + "\" class=\"tc-ctl-wlm-lyr\">"
    + ((stack1 = lookupProperty(helpers,"if").call(alias3,(depth0 != null ? lookupProperty(depth0,"path") : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":2,"column":50},"end":{"line":2,"column":78}}})) != null ? stack1 : "")
    + "</div>\r\n    <div class=\"tc-ctl-wlm-type\"></div><div class=\"tc-ctl-wlm-path\" title=\""
    + ((stack1 = lookupProperty(helpers,"each").call(alias3,(depth0 != null ? lookupProperty(depth0,"path") : depth0),{"name":"each","hash":{},"fn":container.program(3, data, 0),"inverse":container.program(1, data, 0),"data":data,"loc":{"start":{"line":3,"column":75},"end":{"line":3,"column":222}}})) != null ? stack1 : "")
    + "\">"
    + ((stack1 = lookupProperty(helpers,"each").call(alias3,(depth0 != null ? lookupProperty(depth0,"path") : depth0),{"name":"each","hash":{},"fn":container.program(9, data, 0),"inverse":container.program(1, data, 0),"data":data,"loc":{"start":{"line":3,"column":224},"end":{"line":3,"column":347}}})) != null ? stack1 : "")
    + "</div>\r\n                                       <div class=\"tc-ctl-wlm-input\">\r\n                                           <div class=\"tc-ctl-wlm-tools\">\r\n                                               "
    + ((stack1 = lookupProperty(helpers,"if").call(alias3,(depth0 != null ? lookupProperty(depth0,"hasInfo") : depth0),{"name":"if","hash":{},"fn":container.program(11, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":6,"column":47},"end":{"line":6,"column":221}}})) != null ? stack1 : "")
    + "\r\n                                               <sitna-toggle class=\"tc-ctl-wlm-cb-visibility\" "
    + ((stack1 = lookupProperty(helpers,"unless").call(alias3,(depth0 != null ? lookupProperty(depth0,"hide") : depth0),{"name":"unless","hash":{},"fn":container.program(13, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":7,"column":94},"end":{"line":7,"column":130}}})) != null ? stack1 : "")
    + " text=\""
    + alias2(lookupProperty(helpers,"i18n").call(alias3,"visibilityOfThisLayer",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":7,"column":137},"end":{"line":7,"column":169}}}))
    + "\" checked-icon-text=\"&#xe910;\" unchecked-icon-text=\"&#xe911;\"></sitna-toggle>\r\n                                               "
    + ((stack1 = lookupProperty(helpers,"if").call(alias3,(depth0 != null ? lookupProperty(depth0,"hasExtent") : depth0),{"name":"if","hash":{},"fn":container.program(15, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":8,"column":47},"end":{"line":8,"column":203}}})) != null ? stack1 : "")
    + "\r\n                                               <sitna-button variant=\"minimal\" icon=\"delete\" class=\"tc-ctl-wlm-btn-del tc-item-tool-last\" "
    + ((stack1 = lookupProperty(helpers,"if").call(alias3,(depth0 != null ? lookupProperty(depth0,"unremovable") : depth0),{"name":"if","hash":{},"fn":container.program(17, data, 0),"inverse":container.program(19, data, 0),"data":data,"loc":{"start":{"line":9,"column":138},"end":{"line":9,"column":218}}})) != null ? stack1 : "")
    + "></sitna-button>\r\n                                               <sitna-button variant=\"minimal\" icon-text=\"&#x2022&#x2022&#x2022\" class=\"tc-ctl-wlm-btn-more\" text=\""
    + alias2(lookupProperty(helpers,"i18n").call(alias3,"otherTools",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":10,"column":147},"end":{"line":10,"column":168}}}))
    + "\"></sitna-button>\r\n                                           </div>\r\n                                           <input type=\"range\" value=\""
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"opacity") : depth0), depth0))
    + "\" title=\""
    + alias2(lookupProperty(helpers,"i18n").call(alias3,"transparencyOfThisLayer",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":12,"column":90},"end":{"line":12,"column":124}}}))
    + "\" />\r\n                                       </div>\r\n        <div class=\"tc-ctl-wlm-info tc-hidden\">\r\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias3,((stack1 = (depth0 != null ? lookupProperty(depth0,"abstract") : depth0)) != null ? lookupProperty(stack1,"length") : stack1),{"name":"if","hash":{},"fn":container.program(21, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":15,"column":12},"end":{"line":22,"column":19}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias3,(depth0 != null ? lookupProperty(depth0,"customLegend") : depth0),{"name":"if","hash":{},"fn":container.program(24, data, 0),"inverse":container.program(26, data, 0),"data":data,"loc":{"start":{"line":23,"column":12},"end":{"line":38,"column":19}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias3,((stack1 = (depth0 != null ? lookupProperty(depth0,"metadata") : depth0)) != null ? lookupProperty(stack1,"length") : stack1),{"name":"if","hash":{},"fn":container.program(31, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":39,"column":12},"end":{"line":54,"column":19}}})) != null ? stack1 : "")
    + "        </div>\r\n    <div class=\"tc-ctl-wlm-dd\" title=\""
    + alias2(lookupProperty(helpers,"i18n").call(alias3,"dragToReorder",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":56,"column":38},"end":{"line":56,"column":62}}}))
    + "\"></div>\r\n</li>";
},"useData":true});

/***/ })

}]);
//# sourceMappingURL=../maps/chunks/TC_templates_tc-ctl-wlm-elm_mjs.sitna.debug.js.map