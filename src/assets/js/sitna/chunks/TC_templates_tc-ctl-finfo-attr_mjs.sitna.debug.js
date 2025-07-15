"use strict";
(self["webpackChunkSITNA"] = self["webpackChunkSITNA"] || []).push([["TC_templates_tc-ctl-finfo-attr_mjs"],{

/***/ "./TC/templates/tc-ctl-finfo-attr.mjs":
/*!********************************************!*\
  !*** ./TC/templates/tc-ctl-finfo-attr.mjs ***!
  \********************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({"1":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"each").call(depth0 != null ? depth0 : (container.nullContext || {}),(depth0 != null ? lookupProperty(depth0,"attributes") : depth0),{"name":"each","hash":{},"fn":container.program(2, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":2,"column":4},"end":{"line":6,"column":13}}})) != null ? stack1 : "");
},"2":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(helpers,"getHeader").call(alias1,(depth0 != null ? lookupProperty(depth0,"name") : depth0),{"name":"getHeader","hash":{},"data":data,"loc":{"start":{"line":3,"column":14},"end":{"line":3,"column":30}}}),{"name":"if","hash":{},"fn":container.program(3, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":3,"column":8},"end":{"line":5,"column":15}}})) != null ? stack1 : "");
},"3":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<"
    + alias2(lookupProperty(helpers,"getHeader").call(alias1,(depth0 != null ? lookupProperty(depth0,"name") : depth0),{"name":"getHeader","hash":{},"data":data,"loc":{"start":{"line":4,"column":1},"end":{"line":4,"column":19}}}))
    + ">"
    + ((stack1 = container.lambda((depth0 != null ? lookupProperty(depth0,"value") : depth0), depth0)) != null ? stack1 : "")
    + "</"
    + alias2(lookupProperty(helpers,"getHeader").call(alias1,(depth0 != null ? lookupProperty(depth0,"name") : depth0),{"name":"getHeader","hash":{},"data":data,"loc":{"start":{"line":4,"column":33},"end":{"line":4,"column":51}}}))
    + ">\r\n";
},"5":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"unless").call(alias1,lookupProperty(helpers,"getHeader").call(alias1,(depth0 != null ? lookupProperty(depth0,"name") : depth0),{"name":"getHeader","hash":{},"data":data,"loc":{"start":{"line":11,"column":14},"end":{"line":11,"column":30}}}),{"name":"unless","hash":{},"fn":container.program(6, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":11,"column":4},"end":{"line":67,"column":15}}})) != null ? stack1 : "");
},"6":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(helpers,"isVideoAttribute").call(alias1,(depth0 != null ? lookupProperty(depth0,"name") : depth0),(depth0 != null ? lookupProperty(depth0,"value") : depth0),{"name":"isVideoAttribute","hash":{},"data":data,"loc":{"start":{"line":12,"column":14},"end":{"line":12,"column":43}}}),{"name":"if","hash":{},"fn":container.program(7, data, 0),"inverse":container.program(9, data, 0),"data":data,"loc":{"start":{"line":12,"column":8},"end":{"line":66,"column":15}}})) != null ? stack1 : "");
},"7":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "        <tr>\r\n            <th class=\"tc-ctl-finfo-attr\" colspan=\"2\">"
    + container.escapeExpression(lookupProperty(helpers,"removeSpecialAttributeTag").call(depth0 != null ? depth0 : (container.nullContext || {}),(depth0 != null ? lookupProperty(depth0,"name") : depth0),{"name":"removeSpecialAttributeTag","hash":{},"data":data,"loc":{"start":{"line":14,"column":54},"end":{"line":14,"column":88}}}))
    + "</th>\r\n        </tr>\r\n        <tr>\r\n            <td class=\"tc-ctl-finfo-val tc-video-attr\" colspan=\"2\">\r\n"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"tc-ctl-finfo-attr-video"),depth0,{"name":"tc-ctl-finfo-attr-video","hash":{"value":(depth0 != null ? lookupProperty(depth0,"value") : depth0),"name":(depth0 != null ? lookupProperty(depth0,"name") : depth0)},"data":data,"indent":"                ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "            </td>\r\n        </tr>                                                            \r\n";
},"9":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(helpers,"isImageAttribute").call(alias1,(depth0 != null ? lookupProperty(depth0,"name") : depth0),(depth0 != null ? lookupProperty(depth0,"value") : depth0),{"name":"isImageAttribute","hash":{},"data":data,"loc":{"start":{"line":22,"column":18},"end":{"line":22,"column":47}}}),{"name":"if","hash":{},"fn":container.program(10, data, 0),"inverse":container.program(12, data, 0),"data":data,"loc":{"start":{"line":22,"column":12},"end":{"line":65,"column":19}}})) != null ? stack1 : "");
},"10":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "        <tr>\r\n            <th class=\"tc-ctl-finfo-attr\" colspan=\"2\">"
    + container.escapeExpression(lookupProperty(helpers,"removeSpecialAttributeTag").call(depth0 != null ? depth0 : (container.nullContext || {}),(depth0 != null ? lookupProperty(depth0,"name") : depth0),{"name":"removeSpecialAttributeTag","hash":{},"data":data,"loc":{"start":{"line":24,"column":54},"end":{"line":24,"column":88}}}))
    + "</th>\r\n        </tr>\r\n        <tr>\r\n            <td class=\"tc-ctl-finfo-val tc-img-attr\" colspan=\"2\">\r\n"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"tc-ctl-finfo-attr-image"),depth0,{"name":"tc-ctl-finfo-attr-image","hash":{"value":(depth0 != null ? lookupProperty(depth0,"value") : depth0),"name":(depth0 != null ? lookupProperty(depth0,"name") : depth0)},"data":data,"indent":"                ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "            </td>\r\n        </tr>                                                            \r\n";
},"12":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(helpers,"isAudioAttribute").call(alias1,(depth0 != null ? lookupProperty(depth0,"name") : depth0),(depth0 != null ? lookupProperty(depth0,"value") : depth0),{"name":"isAudioAttribute","hash":{},"data":data,"loc":{"start":{"line":32,"column":22},"end":{"line":32,"column":51}}}),{"name":"if","hash":{},"fn":container.program(13, data, 0),"inverse":container.program(15, data, 0),"data":data,"loc":{"start":{"line":32,"column":16},"end":{"line":64,"column":23}}})) != null ? stack1 : "");
},"13":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "        <tr>\r\n            <th class=\"tc-ctl-finfo-attr\" colspan=\"2\">"
    + container.escapeExpression(lookupProperty(helpers,"removeSpecialAttributeTag").call(depth0 != null ? depth0 : (container.nullContext || {}),(depth0 != null ? lookupProperty(depth0,"name") : depth0),{"name":"removeSpecialAttributeTag","hash":{},"data":data,"loc":{"start":{"line":34,"column":54},"end":{"line":34,"column":88}}}))
    + "</th>\r\n        </tr>\r\n        <tr>\r\n            <td class=\"tc-ctl-finfo-val tc-audio-attr\" colspan=\"2\">\r\n"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"tc-ctl-finfo-attr-audio"),depth0,{"name":"tc-ctl-finfo-attr-audio","hash":{"value":(depth0 != null ? lookupProperty(depth0,"value") : depth0),"name":(depth0 != null ? lookupProperty(depth0,"name") : depth0)},"data":data,"indent":"                    ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "            </td>\r\n        </tr>                                                            \r\n";
},"15":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(helpers,"isEmbedAttribute").call(alias1,(depth0 != null ? lookupProperty(depth0,"name") : depth0),(depth0 != null ? lookupProperty(depth0,"value") : depth0),{"name":"isEmbedAttribute","hash":{},"data":data,"loc":{"start":{"line":42,"column":26},"end":{"line":42,"column":55}}}),{"name":"if","hash":{},"fn":container.program(16, data, 0),"inverse":container.program(18, data, 0),"data":data,"loc":{"start":{"line":42,"column":20},"end":{"line":63,"column":27}}})) != null ? stack1 : "");
},"16":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "        <tr>\r\n            <th class=\"tc-ctl-finfo-attr\" colspan=\"2\">"
    + container.escapeExpression(lookupProperty(helpers,"removeSpecialAttributeTag").call(depth0 != null ? depth0 : (container.nullContext || {}),(depth0 != null ? lookupProperty(depth0,"name") : depth0),{"name":"removeSpecialAttributeTag","hash":{},"data":data,"loc":{"start":{"line":44,"column":54},"end":{"line":44,"column":88}}}))
    + "</th>\r\n        </tr>\r\n        <tr>\r\n            <td class=\"tc-ctl-finfo-val tc-embed-attr\" colspan=\"2\">\r\n"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"tc-ctl-finfo-attr-embed"),depth0,{"name":"tc-ctl-finfo-attr-embed","hash":{"value":(depth0 != null ? lookupProperty(depth0,"value") : depth0),"name":(depth0 != null ? lookupProperty(depth0,"name") : depth0)},"data":data,"indent":"                        ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "            </td>\r\n        </tr>                                                            \r\n";
},"18":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(helpers,"hasDisplayName").call(alias1,(depth0 != null ? lookupProperty(depth0,"value") : depth0),{"name":"hasDisplayName","hash":{},"data":data,"loc":{"start":{"line":52,"column":22},"end":{"line":52,"column":44}}}),{"name":"if","hash":{},"fn":container.program(19, data, 0),"inverse":container.program(21, data, 0),"data":data,"loc":{"start":{"line":52,"column":16},"end":{"line":62,"column":31}}})) != null ? stack1 : "");
},"19":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.lambda, alias2=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "        <tr>\r\n            <th class=\"tc-ctl-finfo-attr\">"
    + alias2(alias1(((stack1 = (depth0 != null ? lookupProperty(depth0,"value") : depth0)) != null ? lookupProperty(stack1,"displayName") : stack1), depth0))
    + "</th>\r\n            <td class=\"tc-ctl-finfo-val\">"
    + alias2(alias1(((stack1 = (depth0 != null ? lookupProperty(depth0,"value") : depth0)) != null ? lookupProperty(stack1,"value") : stack1), depth0))
    + "</td>\r\n        </tr>                                                                   \r\n";
},"21":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "        <tr>\r\n            <th class=\"tc-ctl-finfo-attr\">"
    + container.escapeExpression(container.lambda((depth0 != null ? lookupProperty(depth0,"name") : depth0), depth0))
    + "</th>\r\n            <td class=\"tc-ctl-finfo-val\">"
    + ((stack1 = lookupProperty(helpers,"unless").call(alias1,lookupProperty(helpers,"eq").call(alias1,(depth0 != null ? lookupProperty(depth0,"value") : depth0),null,{"name":"eq","hash":{},"data":data,"loc":{"start":{"line":60,"column":51},"end":{"line":60,"column":66}}}),{"name":"unless","hash":{},"fn":container.program(22, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":60,"column":41},"end":{"line":60,"column":111}}})) != null ? stack1 : "")
    + "</td>                                                               \r\n        </tr>\r\n";
},"22":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = container.invokePartial(lookupProperty(partials,"tc-ctl-finfo-object"),(depth0 != null ? lookupProperty(depth0,"value") : depth0),{"name":"tc-ctl-finfo-object","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"singleFeature") : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":1,"column":0},"end":{"line":7,"column":7}}})) != null ? stack1 : "")
    + "<table class=\"tc-attr\">\r\n    <tbody>\r\n"
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,(depth0 != null ? lookupProperty(depth0,"attributes") : depth0),{"name":"each","hash":{},"fn":container.program(5, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":10,"column":0},"end":{"line":68,"column":9}}})) != null ? stack1 : "")
    + "    </tbody>\r\n</table>";
},"usePartial":true,"useData":true});

/***/ })

}]);
//# sourceMappingURL=../maps/chunks/TC_templates_tc-ctl-finfo-attr_mjs.sitna.debug.js.map