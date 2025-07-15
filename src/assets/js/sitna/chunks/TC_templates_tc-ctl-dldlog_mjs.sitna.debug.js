"use strict";
(self["webpackChunkSITNA"] = self["webpackChunkSITNA"] || []).push([["TC_templates_tc-ctl-dldlog_mjs"],{

/***/ "./TC/templates/tc-ctl-dldlog.mjs":
/*!****************************************!*\
  !*** ./TC/templates/tc-ctl-dldlog.mjs ***!
  \****************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({"1":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.lambda, alias2=container.escapeExpression, alias3=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "            <div class=\"tc-ctl-dldlog-elev\">\r\n                <input id=\""
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"checkboxId") : depth0), depth0))
    + "\" type=\"checkbox\" "
    + ((stack1 = lookupProperty(helpers,"if").call(alias3,((stack1 = (depth0 != null ? lookupProperty(depth0,"elevation") : depth0)) != null ? lookupProperty(stack1,"checked") : stack1),{"name":"if","hash":{},"fn":container.program(2, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":11,"column":59},"end":{"line":11,"column":98}}})) != null ? stack1 : "")
    + ">\r\n                <label for=\""
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"checkboxId") : depth0), depth0))
    + "\" class=\"tc-ctl-dldlog-elev-label\">"
    + alias2(lookupProperty(helpers,"i18n").call(alias3,"includeElevations",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":12,"column":77},"end":{"line":12,"column":105}}}))
    + "</label>\r\n            </div>\r\n            <div class=\"tc-ctl-dldlog-ext\">\r\n            </div>\r\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias3,((stack1 = (depth0 != null ? lookupProperty(depth0,"elevation") : depth0)) != null ? lookupProperty(stack1,"resolution") : stack1),{"name":"if","hash":{},"fn":container.program(4, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":16,"column":12},"end":{"line":29,"column":19}}})) != null ? stack1 : "");
},"2":function(container,depth0,helpers,partials,data) {
    return "checked";
},"4":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.escapeExpression, alias3=container.lambda, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "            <div class=\"tc-ctl-dldlog-ip tc-hidden\">\r\n                <h4>"
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"interpolateCoordsFromElevProfile",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":18,"column":20},"end":{"line":18,"column":63}}}))
    + "</h4>\r\n                <label>\r\n                    <input type=\"radio\" name=\""
    + alias2(alias3((depth0 != null ? lookupProperty(depth0,"controlId") : depth0), depth0))
    + "-finfo-ip-coords\" value=\"0\" checked />\r\n                    <span>"
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"no",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":21,"column":26},"end":{"line":21,"column":39}}}))
    + "</span>\r\n                </label>\r\n                <label>\r\n                    <input type=\"radio\" name=\""
    + alias2(alias3((depth0 != null ? lookupProperty(depth0,"controlId") : depth0), depth0))
    + "-finfo-ip-coords\" value=\"1\" />\r\n                    <span>"
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"yes",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":25,"column":26},"end":{"line":25,"column":40}}}))
    + "</span>\r\n                </label>\r\n                <div class=\"tc-ctl-dldlog-ip-m tc-hidden\">"
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"interpolateEveryXMeters.1",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":27,"column":58},"end":{"line":27,"column":94}}}))
    + "<input type=\"number\" min=\"1\" step=\"1\" class=\"tc-textbox\" value=\""
    + alias2(alias3(((stack1 = (depth0 != null ? lookupProperty(depth0,"elevation") : depth0)) != null ? lookupProperty(stack1,"resolution") : stack1), depth0))
    + "\" />"
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"interpolateEveryXMeters.2",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":27,"column":186},"end":{"line":27,"column":222}}}))
    + "</div>\r\n            </div>\r\n";
},"6":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(helpers,"eq").call(alias1,depth0,"KML",{"name":"eq","hash":{},"data":data,"loc":{"start":{"line":34,"column":26},"end":{"line":34,"column":41}}}),{"name":"if","hash":{},"fn":container.program(7, data, 0),"inverse":container.program(9, data, 0),"data":data,"loc":{"start":{"line":34,"column":20},"end":{"line":52,"column":28}}})) != null ? stack1 : "");
},"7":function(container,depth0,helpers,partials,data) {
    return "<button type=\"button\" class=\"tc-button tc-btn-dl tc-ctl-dldlog-btn-kml\" data-format=\"KML\" title=\"KML\">KML</button>";
},"9":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(helpers,"eq").call(alias1,depth0,"KMZ",{"name":"eq","hash":{},"data":data,"loc":{"start":{"line":36,"column":31},"end":{"line":36,"column":46}}}),{"name":"if","hash":{},"fn":container.program(10, data, 0),"inverse":container.program(12, data, 0),"data":data,"loc":{"start":{"line":36,"column":20},"end":{"line":52,"column":20}}})) != null ? stack1 : "");
},"10":function(container,depth0,helpers,partials,data) {
    return "<button type=\"button\" class=\"tc-button tc-btn-dl tc-ctl-dldlog-btn-kmz\" data-format=\"KMZ\" title=\"KML\">KML</button>";
},"12":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(helpers,"eq").call(alias1,depth0,"GML",{"name":"eq","hash":{},"data":data,"loc":{"start":{"line":38,"column":31},"end":{"line":38,"column":46}}}),{"name":"if","hash":{},"fn":container.program(13, data, 0),"inverse":container.program(15, data, 0),"data":data,"loc":{"start":{"line":38,"column":20},"end":{"line":52,"column":20}}})) != null ? stack1 : "");
},"13":function(container,depth0,helpers,partials,data) {
    return "<button type=\"button\" class=\"tc-button tc-btn-dl tc-ctl-dldlog-btn-gml\" data-format=\"GML\" title=\"GML\">GML</button>";
},"15":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(helpers,"eq").call(alias1,depth0,"GeoJSON",{"name":"eq","hash":{},"data":data,"loc":{"start":{"line":40,"column":31},"end":{"line":40,"column":50}}}),{"name":"if","hash":{},"fn":container.program(16, data, 0),"inverse":container.program(18, data, 0),"data":data,"loc":{"start":{"line":40,"column":20},"end":{"line":52,"column":20}}})) != null ? stack1 : "");
},"16":function(container,depth0,helpers,partials,data) {
    return "<button type=\"button\" class=\"tc-button tc-btn-dl tc-ctl-dldlog-btn-geojson\" data-format=\"GeoJSON\" title=\"GeoJSON\">GeoJSON</button>";
},"18":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(helpers,"eq").call(alias1,depth0,"WKT",{"name":"eq","hash":{},"data":data,"loc":{"start":{"line":42,"column":31},"end":{"line":42,"column":46}}}),{"name":"if","hash":{},"fn":container.program(19, data, 0),"inverse":container.program(21, data, 0),"data":data,"loc":{"start":{"line":42,"column":20},"end":{"line":52,"column":20}}})) != null ? stack1 : "");
},"19":function(container,depth0,helpers,partials,data) {
    return "<button type=\"button\" class=\"tc-button tc-btn-dl tc-ctl-dldlog-btn-wkt\" data-format=\"WKT\" title=\"WKT\">WKT</button>";
},"21":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(helpers,"eq").call(alias1,depth0,"WKB",{"name":"eq","hash":{},"data":data,"loc":{"start":{"line":44,"column":31},"end":{"line":44,"column":46}}}),{"name":"if","hash":{},"fn":container.program(22, data, 0),"inverse":container.program(24, data, 0),"data":data,"loc":{"start":{"line":44,"column":20},"end":{"line":52,"column":20}}})) != null ? stack1 : "");
},"22":function(container,depth0,helpers,partials,data) {
    return "<button type=\"button\" class=\"tc-button tc-btn-dl tc-ctl-dldlog-btn-wkb\" data-format=\"WKB\" title=\"WKB\">WKB</button>";
},"24":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(helpers,"eq").call(alias1,depth0,"GPX",{"name":"eq","hash":{},"data":data,"loc":{"start":{"line":46,"column":31},"end":{"line":46,"column":46}}}),{"name":"if","hash":{},"fn":container.program(25, data, 0),"inverse":container.program(27, data, 0),"data":data,"loc":{"start":{"line":46,"column":20},"end":{"line":52,"column":20}}})) != null ? stack1 : "");
},"25":function(container,depth0,helpers,partials,data) {
    return "<button type=\"button\" class=\"tc-button tc-btn-dl tc-ctl-dldlog-btn-gpx\" data-format=\"GPX\" title=\"GPX\">GPX</button>";
},"27":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(helpers,"eq").call(alias1,depth0,"SHP",{"name":"eq","hash":{},"data":data,"loc":{"start":{"line":48,"column":31},"end":{"line":48,"column":46}}}),{"name":"if","hash":{},"fn":container.program(28, data, 0),"inverse":container.program(30, data, 0),"data":data,"loc":{"start":{"line":48,"column":20},"end":{"line":52,"column":20}}})) != null ? stack1 : "");
},"28":function(container,depth0,helpers,partials,data) {
    return "<button type=\"button\" class=\"tc-button tc-btn-dl tc-ctl-dldlog-btn-shp\" data-format=\"SHP\" title=\"Shapefile\">Shapefile</button>";
},"30":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(helpers,"eq").call(alias1,depth0,"GPKG",{"name":"eq","hash":{},"data":data,"loc":{"start":{"line":50,"column":31},"end":{"line":50,"column":47}}}),{"name":"if","hash":{},"fn":container.program(31, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":50,"column":20},"end":{"line":52,"column":20}}})) != null ? stack1 : "");
},"31":function(container,depth0,helpers,partials,data) {
    return "<button type=\"button\" class=\"tc-button tc-btn-dl tc-ctl-dldlog-btn-gpkg\" data-format=\"GPKG\" title=\"GeoPackage\">GeoPackage</button>";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.lambda, alias2=container.escapeExpression, alias3=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<div class=\"tc-ctl-dldlog tc-modal "
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"cssClass") : depth0), depth0))
    + "\">\r\n    <div class=\"tc-modal-background tc-modal-close\"></div>\r\n    <div class=\"tc-modal-window\">\r\n        <div class=\"tc-modal-header\">\r\n            <h3>"
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"title") : depth0), depth0))
    + "</h3>\r\n            <div class=\"tc-modal-close\"></div>\r\n        </div>\r\n        <div class=\"tc-modal-body\">\r\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias3,(depth0 != null ? lookupProperty(depth0,"elevation") : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":9,"column":12},"end":{"line":30,"column":19}}})) != null ? stack1 : "")
    + "            <div class=\"tc-ctl-dldlog-dl\">\r\n                <div>\r\n"
    + ((stack1 = lookupProperty(helpers,"each").call(alias3,(depth0 != null ? lookupProperty(depth0,"formats") : depth0),{"name":"each","hash":{},"fn":container.program(6, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":33,"column":20},"end":{"line":53,"column":29}}})) != null ? stack1 : "")
    + "                </div>\r\n            </div>\r\n        </div>\r\n    </div>\r\n</div>";
},"useData":true});

/***/ })

}]);
//# sourceMappingURL=../maps/chunks/TC_templates_tc-ctl-dldlog_mjs.sitna.debug.js.map