"use strict";
(self["webpackChunkSITNA"] = self["webpackChunkSITNA"] || []).push([["TC_templates_tc-ctl-finfo_mjs"],{

/***/ "./TC/templates/tc-ctl-finfo.mjs":
/*!***************************************!*\
  !*** ./TC/templates/tc-ctl-finfo.mjs ***!
  \***************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({"1":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.escapeExpression, alias3=container.lambda, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "    <span class=\"tc-ctl-finfo-coords-pair tc-ctl-finfo-coords-lat\">"
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"lat",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":4,"column":67},"end":{"line":4,"column":81}}}))
    + ": <span class=\"tc-ctl-finfo-coords-val\">"
    + alias2(alias3(((stack1 = (depth0 != null ? lookupProperty(depth0,"coords") : depth0)) != null ? lookupProperty(stack1,"1") : stack1), depth0))
    + "</span></span>\r\n    <span class=\"tc-ctl-finfo-coords-pair tc-ctl-finfo-coords-lon\">"
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"lon",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":5,"column":67},"end":{"line":5,"column":81}}}))
    + ": <span class=\"tc-ctl-finfo-coords-val\">"
    + alias2(alias3(((stack1 = (depth0 != null ? lookupProperty(depth0,"coords") : depth0)) != null ? lookupProperty(stack1,"0") : stack1), depth0))
    + "</span></span>\r\n";
},"3":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.lambda, alias2=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "    <span class=\"tc-ctl-finfo-coords-pair tc-ctl-finfo-coords-x\">x: <span class=\"tc-ctl-finfo-coords-val\">"
    + alias2(alias1(((stack1 = (depth0 != null ? lookupProperty(depth0,"coords") : depth0)) != null ? lookupProperty(stack1,"0") : stack1), depth0))
    + "</span></span>\r\n    <span class=\"tc-ctl-finfo-coords-pair tc-ctl-finfo-coords-x\">y: <span class=\"tc-ctl-finfo-coords-val\">"
    + alias2(alias1(((stack1 = (depth0 != null ? lookupProperty(depth0,"coords") : depth0)) != null ? lookupProperty(stack1,"1") : stack1), depth0))
    + "</span></span>\r\n";
},"5":function(container,depth0,helpers,partials,data) {
    var alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<span class=\"tc-ctl-finfo-coords-pair tc-ctl-finfo-elev\" title=\""
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"elevation",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":10,"column":92},"end":{"line":10,"column":112}}}))
    + "\">"
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"ele",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":10,"column":114},"end":{"line":10,"column":128}}}))
    + ": <span class=\"tc-ctl-finfo-coords-val\"></span></span><span class=\"tc-ctl-finfo-coords-pair tc-ctl-finfo-height\" title=\""
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"heightOverTerrain",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":10,"column":248},"end":{"line":10,"column":276}}}))
    + "\">"
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"height",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":10,"column":278},"end":{"line":10,"column":295}}}))
    + ": <span class=\"tc-ctl-finfo-coords-val\"></span></span>";
},"7":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(helpers,"gt").call(alias1,(depth0 != null ? lookupProperty(depth0,"featureCount") : depth0),1,{"name":"gt","hash":{},"data":data,"loc":{"start":{"line":12,"column":58},"end":{"line":12,"column":77}}}),{"name":"if","hash":{},"fn":container.program(8, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":12,"column":52},"end":{"line":12,"column":110}}})) != null ? stack1 : "")
    + " ";
},"8":function(container,depth0,helpers,partials,data) {
    return " tc-ctl-finfo-multilayer";
},"10":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "        <li>\r\n            <h3>\r\n                <span title=\""
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"title") : depth0),{"name":"if","hash":{},"fn":container.program(11, data, 0, blockParams, depths),"inverse":container.program(13, data, 0, blockParams, depths),"data":data,"loc":{"start":{"line":17,"column":29},"end":{"line":17,"column":139}}})) != null ? stack1 : "")
    + "\">\r\n                    "
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"title") : depth0),{"name":"if","hash":{},"fn":container.program(11, data, 0, blockParams, depths),"inverse":container.program(13, data, 0, blockParams, depths),"data":data,"loc":{"start":{"line":18,"column":20},"end":{"line":18,"column":130}}})) != null ? stack1 : "")
    + "\r\n                </span>\r\n            </h3>\r\n            <div class=\"tc-ctl-finfo-service-content\">\r\n"
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,(depth0 != null ? lookupProperty(depth0,"hasLimits") : depth0),{"name":"each","hash":{},"fn":container.program(18, data, 0, blockParams, depths),"inverse":container.program(20, data, 0, blockParams, depths),"data":data,"loc":{"start":{"line":22,"column":16},"end":{"line":69,"column":25}}})) != null ? stack1 : "")
    + "            </div>\r\n        </li>\r\n";
},"11":function(container,depth0,helpers,partials,data) {
    var lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return container.escapeExpression(container.lambda((depth0 != null ? lookupProperty(depth0,"title") : depth0), depth0));
},"13":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),((stack1 = ((stack1 = (depth0 != null ? lookupProperty(depth0,"layers") : depth0)) != null ? lookupProperty(stack1,"0") : stack1)) != null ? lookupProperty(stack1,"title") : stack1),{"name":"if","hash":{},"fn":container.program(14, data, 0),"inverse":container.program(16, data, 0),"data":data,"loc":{"start":{"line":17,"column":59},"end":{"line":17,"column":132}}})) != null ? stack1 : "");
},"14":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return container.escapeExpression(container.lambda(((stack1 = ((stack1 = (depth0 != null ? lookupProperty(depth0,"layers") : depth0)) != null ? lookupProperty(stack1,"0") : stack1)) != null ? lookupProperty(stack1,"title") : stack1), depth0));
},"16":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return container.escapeExpression(container.lambda(((stack1 = (depth0 != null ? lookupProperty(depth0,"layer") : depth0)) != null ? lookupProperty(stack1,"name") : stack1), depth0));
},"18":function(container,depth0,helpers,partials,data) {
    var lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "                <span class=\"tc-ctl-finfo-errors\">"
    + container.escapeExpression(container.lambda((depth0 != null ? lookupProperty(depth0,"hasLimits") : depth0), depth0))
    + "</span>\r\n";
},"20":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "                    <ul class=\"tc-ctl-finfo-layers\">\r\n"
    + ((stack1 = lookupProperty(helpers,"each").call(depth0 != null ? depth0 : (container.nullContext || {}),(depth0 != null ? lookupProperty(depth0,"layers") : depth0),{"name":"each","hash":{},"fn":container.program(21, data, 0, blockParams, depths),"inverse":container.program(45, data, 0, blockParams, depths),"data":data,"loc":{"start":{"line":26,"column":24},"end":{"line":67,"column":33}}})) != null ? stack1 : "")
    + "                    </ul>\r\n";
},"21":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "                        <li>\r\n                            <h4"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depths[2] != null ? lookupProperty(depths[2],"featureCount") : depths[2]),{"name":"if","hash":{},"fn":container.program(22, data, 0, blockParams, depths),"inverse":container.noop,"data":data,"loc":{"start":{"line":28,"column":31},"end":{"line":28,"column":138}}})) != null ? stack1 : "")
    + " title=\""
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,(depth0 != null ? lookupProperty(depth0,"path") : depth0),{"name":"each","hash":{},"fn":container.program(25, data, 0, blockParams, depths),"inverse":container.noop,"data":data,"loc":{"start":{"line":28,"column":146},"end":{"line":28,"column":216}}})) != null ? stack1 : "")
    + "\">\r\n                                <span class=\"tc-ctl-finfo-layer-n\">"
    + container.escapeExpression(container.lambda(((stack1 = (depth0 != null ? lookupProperty(depth0,"features") : depth0)) != null ? lookupProperty(stack1,"length") : stack1), depth0))
    + "</span> "
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,(depth0 != null ? lookupProperty(depth0,"path") : depth0),{"name":"each","hash":{},"fn":container.program(25, data, 0, blockParams, depths),"inverse":container.noop,"data":data,"loc":{"start":{"line":29,"column":94},"end":{"line":29,"column":164}}})) != null ? stack1 : "")
    + "</h4>\r\n                                <div class=\"tc-ctl-finfo-layer-content\">\r\n                                    <ul class=\"tc-ctl-finfo-features\">\r\n"
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,(depth0 != null ? lookupProperty(depth0,"features") : depth0),{"name":"each","hash":{},"fn":container.program(28, data, 0, blockParams, depths),"inverse":container.program(43, data, 0, blockParams, depths),"data":data,"loc":{"start":{"line":32,"column":40},"end":{"line":61,"column":49}}})) != null ? stack1 : "")
    + "                                    </ul>\r\n                                </div>\r\n</li>\r\n";
},"22":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(helpers,"gt").call(alias1,(depths[2] != null ? lookupProperty(depths[2],"featureCount") : depths[2]),1,{"name":"gt","hash":{},"data":data,"loc":{"start":{"line":28,"column":63},"end":{"line":28,"column":88}}}),{"name":"if","hash":{},"fn":container.program(23, data, 0, blockParams, depths),"inverse":container.noop,"data":data,"loc":{"start":{"line":28,"column":57},"end":{"line":28,"column":130}}})) != null ? stack1 : "")
    + " ";
},"23":function(container,depth0,helpers,partials,data) {
    return " class=\"tc-ctl-finfo-multilayer\" ";
},"25":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"unless").call(depth0 != null ? depth0 : (container.nullContext || {}),(data && lookupProperty(data,"first")),{"name":"unless","hash":{},"fn":container.program(26, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":28,"column":160},"end":{"line":28,"column":199}}})) != null ? stack1 : "")
    + container.escapeExpression(container.lambda(depth0, depth0));
},"26":function(container,depth0,helpers,partials,data) {
    return " &rsaquo; ";
},"28":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "                                        <li>\r\n"
    + ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),(depth0 != null ? lookupProperty(depth0,"rawContent") : depth0),{"name":"if","hash":{},"fn":container.program(29, data, 0),"inverse":container.program(38, data, 0),"data":data,"loc":{"start":{"line":34,"column":44},"end":{"line":57,"column":51}}})) != null ? stack1 : "")
    + "                                        </li>\r\n";
},"29":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "                                            <h5>"
    + container.escapeExpression(lookupProperty(helpers,"i18n").call(alias1,"feature",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":35,"column":48},"end":{"line":35,"column":66}}}))
    + "</h5>\r\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(helpers,"eq").call(alias1,(depth0 != null ? lookupProperty(depth0,"rawFormat") : depth0),"text/html",{"name":"eq","hash":{},"data":data,"loc":{"start":{"line":36,"column":50},"end":{"line":36,"column":76}}}),{"name":"if","hash":{},"fn":container.program(30, data, 0),"inverse":container.program(36, data, 0),"data":data,"loc":{"start":{"line":36,"column":44},"end":{"line":49,"column":51}}})) != null ? stack1 : "");
},"30":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),(depth0 != null ? lookupProperty(depth0,"expandUrl") : depth0),{"name":"if","hash":{},"fn":container.program(31, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":37,"column":44},"end":{"line":46,"column":51}}})) != null ? stack1 : "");
},"31":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"unless").call(alias1,lookupProperty(helpers,"eq").call(alias1,(depth0 != null ? lookupProperty(depth0,"expandUrl") : depth0),"",{"name":"eq","hash":{},"data":data,"loc":{"start":{"line":38,"column":54},"end":{"line":38,"column":71}}}),{"name":"unless","hash":{},"fn":container.program(32, data, 0),"inverse":container.program(34, data, 0),"data":data,"loc":{"start":{"line":38,"column":44},"end":{"line":45,"column":55}}})) != null ? stack1 : "");
},"32":function(container,depth0,helpers,partials,data) {
    var alias1=container.lambda, alias2=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "                                            <div class=\"tc-ctl-finfo-features-iframe-cnt\">\r\n                                                <iframe src=\""
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"rawUrl") : depth0), depth0))
    + "\"></iframe>\r\n                                                <a class=\"tc-ctl-finfo-open\" onclick=\"window.open('"
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"expandUrl") : depth0), depth0))
    + "', '_blank')\" title=\""
    + alias2(lookupProperty(helpers,"i18n").call(depth0 != null ? depth0 : (container.nullContext || {}),"expand",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":41,"column":133},"end":{"line":41,"column":150}}}))
    + "\"></a>\r\n                                            </div>\r\n";
},"34":function(container,depth0,helpers,partials,data) {
    var lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "                                            <iframe src=\""
    + container.escapeExpression(container.lambda((depth0 != null ? lookupProperty(depth0,"rawUrl") : depth0), depth0))
    + "\"></iframe>\r\n";
},"36":function(container,depth0,helpers,partials,data) {
    var lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "                                            <pre>"
    + container.escapeExpression(container.lambda((depth0 != null ? lookupProperty(depth0,"rawContent") : depth0), depth0))
    + "</pre>\r\n";
},"38":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),(depth0 != null ? lookupProperty(depth0,"error") : depth0),{"name":"if","hash":{},"fn":container.program(39, data, 0),"inverse":container.program(41, data, 0),"data":data,"loc":{"start":{"line":51,"column":44},"end":{"line":56,"column":51}}})) != null ? stack1 : "");
},"39":function(container,depth0,helpers,partials,data) {
    var alias1=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "                                            <span class=\"tc-ctl-finfo-errors\">"
    + alias1(lookupProperty(helpers,"i18n").call(depth0 != null ? depth0 : (container.nullContext || {}),"fi.error",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":52,"column":78},"end":{"line":52,"column":97}}}))
    + "<span class=\"tc-ctl-finfo-error-text\">"
    + alias1(container.lambda((depth0 != null ? lookupProperty(depth0,"error") : depth0), depth0))
    + "</span></span>\r\n";
},"41":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "                                            <h5>"
    + container.escapeExpression(container.lambda((depth0 != null ? lookupProperty(depth0,"id") : depth0), depth0))
    + "</h5>\r\n"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"tc-ctl-finfo-attr"),depth0,{"name":"tc-ctl-finfo-attr","data":data,"indent":"                                            ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"43":function(container,depth0,helpers,partials,data) {
    var lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "                                        <li class=\"tc-ctl-finfo-empty\">"
    + container.escapeExpression(lookupProperty(helpers,"i18n").call(depth0 != null ? depth0 : (container.nullContext || {}),"noDataInThisLayer",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":60,"column":71},"end":{"line":60,"column":99}}}))
    + "</li>\r\n";
},"45":function(container,depth0,helpers,partials,data) {
    var lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "                            <li class=\"tc-ctl-finfo-empty\">"
    + container.escapeExpression(lookupProperty(helpers,"i18n").call(depth0 != null ? depth0 : (container.nullContext || {}),"noDataAtThisService",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":66,"column":59},"end":{"line":66,"column":89}}}))
    + "</li>\r\n";
},"47":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),(depth0 != null ? lookupProperty(depth0,"displayElevation") : depth0),{"name":"if","hash":{},"fn":container.program(48, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":73,"column":8},"end":{"line":77,"column":15}}})) != null ? stack1 : "");
},"48":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"unless").call(depth0 != null ? depth0 : (container.nullContext || {}),(depth0 != null ? lookupProperty(depth0,"loading") : depth0),{"name":"unless","hash":{},"fn":container.program(49, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":74,"column":12},"end":{"line":76,"column":23}}})) != null ? stack1 : "");
},"49":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "                "
    + ((stack1 = lookupProperty(helpers,"unless").call(depth0 != null ? depth0 : (container.nullContext || {}),(depth0 != null ? lookupProperty(depth0,"displayElevation") : depth0),{"name":"unless","hash":{},"fn":container.program(50, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":75,"column":16},"end":{"line":75,"column":108}}})) != null ? stack1 : "")
    + "\r\n";
},"50":function(container,depth0,helpers,partials,data) {
    var lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<li class=\"tc-ctl-finfo-empty\">"
    + container.escapeExpression(lookupProperty(helpers,"i18n").call(depth0 != null ? depth0 : (container.nullContext || {}),"noData",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":75,"column":75},"end":{"line":75,"column":92}}}))
    + "</li>";
},"52":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(helpers,"gt").call(alias1,(depth0 != null ? lookupProperty(depth0,"featureCount") : depth0),1,{"name":"gt","hash":{},"data":data,"loc":{"start":{"line":82,"column":10},"end":{"line":82,"column":29}}}),{"name":"if","hash":{},"fn":container.program(53, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":82,"column":4},"end":{"line":88,"column":11}}})) != null ? stack1 : "");
},"53":function(container,depth0,helpers,partials,data) {
    var alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<div class=\"tc-ctl-finfo-counter\">\r\n    <button type=\"button\" class=\"tc-ctl-btn tc-ctl-finfo-btn-prev\">"
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"previous",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":84,"column":67},"end":{"line":84,"column":86}}}))
    + "</button>\r\n    <div class=\"tc-ctl-finfo-counter-pages\"><span class=\"tc-ctl-finfo-counter-current\"></span>/"
    + alias2(container.lambda((depth0 != null ? lookupProperty(depth0,"featureCount") : depth0), depth0))
    + "</div>\r\n    <button type=\"button\" class=\"tc-ctl-btn tc-ctl-finfo-btn-next\">"
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"next",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":86,"column":67},"end":{"line":86,"column":82}}}))
    + "</button>\r\n    </div>\r\n";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<div class=\"tc-ctl-finfo-coords\">\r\n    <span class=\"tc-ctl-finfo-coords-pair tc-ctl-finfo-coords-crs\" title=\""
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"crs",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":2,"column":74},"end":{"line":2,"column":88}}}))
    + "\">CRS: <span class=\"tc-ctl-finfo-coords-val\">"
    + alias2(container.lambda((depth0 != null ? lookupProperty(depth0,"crs") : depth0), depth0))
    + "</span></span>\r\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"isGeo") : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0, blockParams, depths),"inverse":container.program(3, data, 0, blockParams, depths),"data":data,"loc":{"start":{"line":3,"column":4},"end":{"line":9,"column":11}}})) != null ? stack1 : "")
    + "    "
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"displayElevation") : depth0),{"name":"if","hash":{},"fn":container.program(5, data, 0, blockParams, depths),"inverse":container.noop,"data":data,"loc":{"start":{"line":10,"column":4},"end":{"line":10,"column":356}}})) != null ? stack1 : "")
    + "\r\n</div>\r\n<div class=\"tc-ctl-finfo-result "
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"featureCount") : depth0),{"name":"if","hash":{},"fn":container.program(7, data, 0, blockParams, depths),"inverse":container.noop,"data":data,"loc":{"start":{"line":12,"column":32},"end":{"line":12,"column":118}}})) != null ? stack1 : "")
    + "\">\r\n    <ul class=\"tc-ctl-finfo-services\">\r\n"
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,(depth0 != null ? lookupProperty(depth0,"services") : depth0),{"name":"each","hash":{},"fn":container.program(10, data, 0, blockParams, depths),"inverse":container.program(47, data, 0, blockParams, depths),"data":data,"loc":{"start":{"line":14,"column":8},"end":{"line":78,"column":17}}})) != null ? stack1 : "")
    + "    </ul>\r\n</div>\r\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"featureCount") : depth0),{"name":"if","hash":{},"fn":container.program(52, data, 0, blockParams, depths),"inverse":container.noop,"data":data,"loc":{"start":{"line":81,"column":0},"end":{"line":89,"column":11}}})) != null ? stack1 : "");
},"usePartial":true,"useData":true,"useDepths":true});

/***/ })

}]);
//# sourceMappingURL=../maps/chunks/TC_templates_tc-ctl-finfo_mjs.sitna.debug.js.map