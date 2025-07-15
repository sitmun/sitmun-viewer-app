"use strict";
(self["webpackChunkSITNA"] = self["webpackChunkSITNA"] || []).push([["TC_templates_tc-ctl-legend-node_mjs"],{

/***/ "./TC/templates/tc-ctl-legend-node.mjs":
/*!*********************************************!*\
  !*** ./TC/templates/tc-ctl-legend-node.mjs ***!
  \*********************************************/
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

  return "    "
    + ((stack1 = container.lambda((depth0 != null ? lookupProperty(depth0,"customLegend") : depth0), depth0)) != null ? stack1 : "")
    + "\r\n";
},"3":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.lambda, alias3=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "    <li "
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"children") : depth0),{"name":"if","hash":{},"fn":container.program(4, data, 0),"inverse":container.program(6, data, 0),"data":data,"loc":{"start":{"line":4,"column":8},"end":{"line":4,"column":112}}})) != null ? stack1 : "")
    + " data-layer-name=\""
    + alias3(alias2((depth0 != null ? lookupProperty(depth0,"name") : depth0), depth0))
    + "\" data-layer-uid=\""
    + alias3(alias2((depth0 != null ? lookupProperty(depth0,"uid") : depth0), depth0))
    + "\">\r\n        <div class=\"tc-ctl-legend-title\">"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"legendTitle") : depth0),{"name":"if","hash":{},"fn":container.program(8, data, 0),"inverse":container.program(10, data, 0),"data":data,"loc":{"start":{"line":5,"column":41},"end":{"line":5,"column":99}}})) != null ? stack1 : "")
    + "</div>\r\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"legend") : depth0),{"name":"if","hash":{},"fn":container.program(12, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":6,"column":8},"end":{"line":22,"column":15}}})) != null ? stack1 : "")
    + "        <ul class=\"tc-ctl-legend-branch\">\r\n"
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,(depth0 != null ? lookupProperty(depth0,"children") : depth0),{"name":"each","hash":{},"fn":container.program(25, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":24,"column":12},"end":{"line":26,"column":21}}})) != null ? stack1 : "")
    + "        </ul>\r\n    </li>\r\n";
},"4":function(container,depth0,helpers,partials,data) {
    return "class=\"tc-ctl-legend-node\" ";
},"6":function(container,depth0,helpers,partials,data) {
    return "class=\"tc-ctl-legend-node tc-ctl-legend-leaf\" ";
},"8":function(container,depth0,helpers,partials,data) {
    var lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return container.escapeExpression(container.lambda((depth0 != null ? lookupProperty(depth0,"legendTitle") : depth0), depth0));
},"10":function(container,depth0,helpers,partials,data) {
    var lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return container.escapeExpression(container.lambda((depth0 != null ? lookupProperty(depth0,"title") : depth0), depth0));
},"12":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"each").call(alias1,(depth0 != null ? lookupProperty(depth0,"legend") : depth0),{"name":"each","hash":{},"fn":container.program(13, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":7,"column":12},"end":{"line":20,"column":21}}})) != null ? stack1 : "")
    + "        <div class=\"tc-ctl-legend-nvr\">"
    + container.escapeExpression(lookupProperty(helpers,"i18n").call(alias1,"notVisibleAtCurrentResolution",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":21,"column":39},"end":{"line":21,"column":79}}}))
    + "</div>\r\n";
},"13":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "        <div class=\"tc-ctl-legend-watch\">\r\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"src") : depth0),{"name":"if","hash":{},"fn":container.program(14, data, 0),"inverse":container.program(19, data, 0),"data":data,"loc":{"start":{"line":9,"column":16},"end":{"line":15,"column":23}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"value") : depth0),{"name":"if","hash":{},"fn":container.program(23, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":16,"column":16},"end":{"line":18,"column":23}}})) != null ? stack1 : "")
    + "        </div>\r\n";
},"14":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "            <img src=\"\" data-img=\""
    + container.escapeExpression(container.lambda((depth0 != null ? lookupProperty(depth0,"src") : depth0), depth0))
    + "\" style=\""
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"width") : depth0),{"name":"if","hash":{},"fn":container.program(15, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":10,"column":50},"end":{"line":10,"column":108}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"scale") : depth0),{"name":"if","hash":{},"fn":container.program(17, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":10,"column":108},"end":{"line":10,"column":180}}})) != null ? stack1 : "")
    + "\" />\r\n";
},"15":function(container,depth0,helpers,partials,data) {
    var alias1=container.lambda, alias2=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "width:"
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"width") : depth0), depth0))
    + "px;height:"
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"height") : depth0), depth0))
    + "px;";
},"17":function(container,depth0,helpers,partials,data) {
    var lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "transform:scale("
    + container.escapeExpression(container.lambda((depth0 != null ? lookupProperty(depth0,"scale") : depth0), depth0))
    + ");transform-origin:0 50% 0;";
},"19":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),(depth0 != null ? lookupProperty(depth0,"strokeColor") : depth0),{"name":"if","hash":{},"fn":container.program(20, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":12,"column":20},"end":{"line":14,"column":27}}})) != null ? stack1 : "");
},"20":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.lambda, alias2=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "            <div class=\"tc-ctl-legend-img\" style=\"border:solid "
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"strokeWidth") : depth0), depth0))
    + "px "
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"strokeColor") : depth0), depth0))
    + ";background-color:"
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"fillColor") : depth0), depth0))
    + ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),(depth0 != null ? lookupProperty(depth0,"width") : depth0),{"name":"if","hash":{},"fn":container.program(21, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":13,"column":127},"end":{"line":13,"column":203}}})) != null ? stack1 : "")
    + "\"></div>\r\n";
},"21":function(container,depth0,helpers,partials,data) {
    var alias1=container.lambda, alias2=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ";width:"
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"width") : depth0), depth0))
    + "px;height:"
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"height") : depth0), depth0))
    + "px;border-radius:50%";
},"23":function(container,depth0,helpers,partials,data) {
    var lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "            <span class=\"tc-ctl-legend-txt\">"
    + container.escapeExpression(container.lambda((depth0 != null ? lookupProperty(depth0,"value") : depth0), depth0))
    + "</span>\r\n";
},"25":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = container.invokePartial(lookupProperty(partials,"tc-ctl-legend-node"),depth0,{"name":"tc-ctl-legend-node","data":data,"indent":"                ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),(depth0 != null ? lookupProperty(depth0,"customLegend") : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.program(3, data, 0),"data":data,"loc":{"start":{"line":1,"column":0},"end":{"line":29,"column":7}}})) != null ? stack1 : "");
},"usePartial":true,"useData":true});

/***/ })

}]);
//# sourceMappingURL=../maps/chunks/TC_templates_tc-ctl-legend-node_mjs.sitna.debug.js.map