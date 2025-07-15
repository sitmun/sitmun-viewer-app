"use strict";
(self["webpackChunkSITNA"] = self["webpackChunkSITNA"] || []).push([["TC_templates_tc-ctl-geolocation-tracking-toast_mjs"],{

/***/ "./TC/templates/tc-ctl-geolocation-tracking-toast.mjs":
/*!************************************************************!*\
  !*** ./TC/templates/tc-ctl-geolocation-tracking-toast.mjs ***!
  \************************************************************/
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

  return container.escapeExpression(lookupProperty(helpers,"i18n").call(depth0 != null ? depth0 : (container.nullContext || {}),"lon",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":3,"column":25},"end":{"line":3,"column":39}}}));
},"3":function(container,depth0,helpers,partials,data) {
    return "X";
},"5":function(container,depth0,helpers,partials,data) {
    var alias1=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "        <th>"
    + alias1(lookupProperty(helpers,"i18n").call(depth0 != null ? depth0 : (container.nullContext || {}),"geo.trk.accuracy",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":6,"column":12},"end":{"line":6,"column":39}}}))
    + ":</th>\r\n        <td> "
    + alias1(container.lambda((depth0 != null ? lookupProperty(depth0,"accuracy") : depth0), depth0))
    + " m </td>\r\n";
},"7":function(container,depth0,helpers,partials,data) {
    var lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return container.escapeExpression(lookupProperty(helpers,"i18n").call(depth0 != null ? depth0 : (container.nullContext || {}),"lat",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":11,"column":25},"end":{"line":11,"column":39}}}));
},"9":function(container,depth0,helpers,partials,data) {
    return "Y";
},"11":function(container,depth0,helpers,partials,data) {
    var alias1=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "        <th>"
    + alias1(lookupProperty(helpers,"i18n").call(depth0 != null ? depth0 : (container.nullContext || {}),"geo.trk.speed",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":14,"column":12},"end":{"line":14,"column":36}}}))
    + ":</th>\r\n        <td>"
    + alias1(container.lambda((depth0 != null ? lookupProperty(depth0,"speed") : depth0), depth0))
    + " km/h</td>\r\n";
},"13":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "        <th>"
    + ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),(depth0 != null ? lookupProperty(depth0,"isGeo") : depth0),{"name":"if","hash":{},"fn":container.program(14, data, 0),"inverse":container.program(16, data, 0),"data":data,"loc":{"start":{"line":20,"column":12},"end":{"line":20,"column":55}}})) != null ? stack1 : "")
    + ":</th>\r\n        <td> "
    + container.escapeExpression(container.lambda((depth0 != null ? lookupProperty(depth0,"z") : depth0), depth0))
    + " m </td>\r\n";
},"14":function(container,depth0,helpers,partials,data) {
    var lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return container.escapeExpression(lookupProperty(helpers,"i18n").call(depth0 != null ? depth0 : (container.nullContext || {}),"ele",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":20,"column":25},"end":{"line":20,"column":39}}}));
},"16":function(container,depth0,helpers,partials,data) {
    return "Z";
},"18":function(container,depth0,helpers,partials,data) {
    var alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "        <th title=\""
    + alias2(lookupProperty(helpers,"i18n").call(alias1," mdt.title",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":24,"column":19},"end":{"line":24,"column":40}}}))
    + "\">"
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"ele",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":24,"column":42},"end":{"line":24,"column":56}}}))
    + " ("
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"mdt",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":24,"column":58},"end":{"line":24,"column":72}}}))
    + "):</th>\r\n        <td>"
    + alias2(container.lambda((depth0 != null ? lookupProperty(depth0,"mdt") : depth0), depth0))
    + " m </td>\r\n";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.lambda, alias3=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<table class=\"tc-ctl-geolocation-info-tracking\">\r\n    <tr>\r\n        <th>"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"isGeo") : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.program(3, data, 0),"data":data,"loc":{"start":{"line":3,"column":12},"end":{"line":3,"column":55}}})) != null ? stack1 : "")
    + ":</th>\r\n        <td> "
    + alias3(alias2((depth0 != null ? lookupProperty(depth0,"x") : depth0), depth0))
    + " </td>\r\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"accuracy") : depth0),{"name":"if","hash":{},"fn":container.program(5, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":5,"column":8},"end":{"line":8,"column":15}}})) != null ? stack1 : "")
    + "    </tr>\r\n    <tr>\r\n        <th>"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"isGeo") : depth0),{"name":"if","hash":{},"fn":container.program(7, data, 0),"inverse":container.program(9, data, 0),"data":data,"loc":{"start":{"line":11,"column":12},"end":{"line":11,"column":55}}})) != null ? stack1 : "")
    + ":</th>\r\n        <td> "
    + alias3(alias2((depth0 != null ? lookupProperty(depth0,"y") : depth0), depth0))
    + " </td>\r\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"speed") : depth0),{"name":"if","hash":{},"fn":container.program(11, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":13,"column":8},"end":{"line":16,"column":15}}})) != null ? stack1 : "")
    + "    </tr>\r\n    <tr>\r\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"z") : depth0),{"name":"if","hash":{},"fn":container.program(13, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":19,"column":8},"end":{"line":22,"column":15}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"mdt") : depth0),{"name":"if","hash":{},"fn":container.program(18, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":23,"column":8},"end":{"line":26,"column":15}}})) != null ? stack1 : "")
    + "    </tr>    \r\n</table>\r\n";
},"useData":true});

/***/ })

}]);
//# sourceMappingURL=../maps/chunks/TC_templates_tc-ctl-geolocation-tracking-toast_mjs.sitna.debug.js.map