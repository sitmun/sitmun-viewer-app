"use strict";
(self["webpackChunkSITNA"] = self["webpackChunkSITNA"] || []).push([["TC_templates_tc-ctl-wfsedit_mjs"],{

/***/ "./TC/templates/tc-ctl-wfsedit.mjs":
/*!*****************************************!*\
  !*** ./TC/templates/tc-ctl-wfsedit.mjs ***!
  \*****************************************/
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

  return "        <option value=\""
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"id") : depth0), depth0))
    + "\">"
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"title") : depth0), depth0))
    + "</option>\r\n";
},"3":function(container,depth0,helpers,partials,data) {
    return " checked";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.escapeExpression, alias3=container.lambda, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<h2>"
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"featureEditing",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":1,"column":4},"end":{"line":1,"column":29}}}))
    + "</h2>\r\n<div class=\"tc-ctl-wfsedit-layer\">\r\n    <select class=\"tc-combo tc-ctl-wfsedit-layer-sel\" disabled>\r\n        <option value=\"\">"
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"selectLayerToEdit",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":4,"column":25},"end":{"line":4,"column":53}}}))
    + "</option>\r\n"
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,(depth0 != null ? lookupProperty(depth0,"layers") : depth0),{"name":"each","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":5,"column":8},"end":{"line":7,"column":17}}})) != null ? stack1 : "")
    + "    </select>\r\n</div>\r\n<div class=\"tc-ctl-wfsedit-view tc-hidden\">\r\n    <table>\r\n        <tbody>\r\n            <tr>\r\n                <th><img class=\"tc-ctl-wfsedit-view-watch\" /></th>\r\n                <td>"
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"featuresInEditedLayer",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":15,"column":20},"end":{"line":15,"column":52}}}))
    + "</td>\r\n            </tr>\r\n            <tr>\r\n                <th><img class=\"tc-ctl-wfsedit-view-original-watch\" /></th>\r\n                <td><input type=\"checkbox\" id=\"tc-ctl-wfsedit-view-original-cb-"
    + alias2(alias3((depth0 != null ? lookupProperty(depth0,"controlId") : depth0), depth0))
    + "\""
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"showOriginalFeatures") : depth0),{"name":"if","hash":{},"fn":container.program(3, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":19,"column":93},"end":{"line":19,"column":136}}})) != null ? stack1 : "")
    + " /><label class=\"tc-ctl-wfsedit-view-original\" for=\"tc-ctl-wfsedit-view-original-cb-"
    + alias2(alias3((depth0 != null ? lookupProperty(depth0,"controlId") : depth0), depth0))
    + "\">"
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"featuresAsBeforeEditing",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":19,"column":235},"end":{"line":19,"column":269}}}))
    + "</label></td>\r\n            </tr>\r\n            <tr>\r\n                <th><input type=\"color\" id=\"tc-ctl-wfsedit-view-clr-added-"
    + alias2(alias3((depth0 != null ? lookupProperty(depth0,"controlId") : depth0), depth0))
    + "\" class=\"tc-clt-wfsedit-view-clr-added\" /><label for=\"tc-ctl-wfsedit-view-clr-added-"
    + alias2(alias3((depth0 != null ? lookupProperty(depth0,"controlId") : depth0), depth0))
    + "\" title=\""
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"clickToChangeColor",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":22,"column":193},"end":{"line":22,"column":222}}}))
    + "\"><img class=\"tc-ctl-wfsedit-view-added-watch\" /></label></th>\r\n                <td><input type=\"checkbox\" id=\"tc-ctl-wfsedit-view-added-cb-"
    + alias2(alias3((depth0 != null ? lookupProperty(depth0,"controlId") : depth0), depth0))
    + "\""
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"highlightChanges") : depth0),{"name":"if","hash":{},"fn":container.program(3, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":23,"column":90},"end":{"line":23,"column":129}}})) != null ? stack1 : "")
    + " /><label class=\"tc-ctl-wfsedit-view-added\" for=\"tc-ctl-wfsedit-view-added-cb-"
    + alias2(alias3((depth0 != null ? lookupProperty(depth0,"controlId") : depth0), depth0))
    + "\">"
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"unsyncedAdded",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":23,"column":222},"end":{"line":23,"column":246}}}))
    + "</label></td>\r\n            </tr>\r\n            <tr>\r\n                <th><input type=\"color\" id=\"tc-ctl-wfsedit-view-clr-modified-"
    + alias2(alias3((depth0 != null ? lookupProperty(depth0,"controlId") : depth0), depth0))
    + "\" class=\"tc-clt-wfsedit-view-clr-modified\" /><label for=\"tc-ctl-wfsedit-view-clr-modified-"
    + alias2(alias3((depth0 != null ? lookupProperty(depth0,"controlId") : depth0), depth0))
    + "\" title=\""
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"clickToChangeColor",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":26,"column":202},"end":{"line":26,"column":231}}}))
    + "\"><img class=\"tc-ctl-wfsedit-view-modified-watch\" /></label></th>\r\n                <td><input type=\"checkbox\" id=\"tc-ctl-wfsedit-view-modified-cb-"
    + alias2(alias3((depth0 != null ? lookupProperty(depth0,"controlId") : depth0), depth0))
    + "\""
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"highlightChanges") : depth0),{"name":"if","hash":{},"fn":container.program(3, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":27,"column":93},"end":{"line":27,"column":132}}})) != null ? stack1 : "")
    + " /><label class=\"tc-ctl-wfsedit-view-modified\" for=\"tc-ctl-wfsedit-view-modified-cb-"
    + alias2(alias3((depth0 != null ? lookupProperty(depth0,"controlId") : depth0), depth0))
    + "\">"
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"unsyncedModified",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":27,"column":231},"end":{"line":27,"column":258}}}))
    + "</label></td>\r\n            </tr>\r\n            <tr>\r\n                <th><input type=\"color\" id=\"tc-ctl-wfsedit-view-clr-removed-"
    + alias2(alias3((depth0 != null ? lookupProperty(depth0,"controlId") : depth0), depth0))
    + "\" class=\"tc-clt-wfsedit-view-clr-removed\" /><label for=\"tc-ctl-wfsedit-view-clr-removed-"
    + alias2(alias3((depth0 != null ? lookupProperty(depth0,"controlId") : depth0), depth0))
    + "\" title=\""
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"clickToChangeColor",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":30,"column":199},"end":{"line":30,"column":228}}}))
    + "\"><img class=\"tc-ctl-wfsedit-view-removed-watch\" /></label></th>\r\n                <td><input type=\"checkbox\" id=\"tc-ctl-wfsedit-view-removed-cb-"
    + alias2(alias3((depth0 != null ? lookupProperty(depth0,"controlId") : depth0), depth0))
    + "\""
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"highlightChanges") : depth0),{"name":"if","hash":{},"fn":container.program(3, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":31,"column":92},"end":{"line":31,"column":131}}})) != null ? stack1 : "")
    + " /><label class=\"tc-ctl-wfsedit-view-removed\" for=\"tc-ctl-wfsedit-view-removed-cb-"
    + alias2(alias3((depth0 != null ? lookupProperty(depth0,"controlId") : depth0), depth0))
    + "\">"
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"unsyncedRemoved",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":31,"column":228},"end":{"line":31,"column":254}}}))
    + "</label></td>\r\n            </tr>\r\n        </tbody>\r\n    </table>\r\n    <button type=\"button\" class=\"tc-ctl-wfsedit-btn-crop tc-hidden\" title=\""
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"refreshLayerToCurrentExtent",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":35,"column":75},"end":{"line":35,"column":113}}}))
    + "\">"
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"refreshLayerToCurrentExtent",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":35,"column":115},"end":{"line":35,"column":153}}}))
    + "</button>\r\n</div>\r\n<div class=\"tc-ctl-wfsedit-edit tc-hidden\"></div>\r\n<div class=\"tc-ctl-wfsedit-save\">\r\n    <button type=\"button\" class=\"tc-button tc-icon-button tc-ctl-wfsedit-btn-save\" disabled title=\""
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"syncChanges",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":39,"column":99},"end":{"line":39,"column":121}}}))
    + "\">"
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"syncChanges",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":39,"column":123},"end":{"line":39,"column":145}}}))
    + "</button>\r\n    <button type=\"button\" class=\"tc-button tc-icon-button tc-ctl-wfsedit-btn-discard\" disabled title=\""
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"discardChanges",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":40,"column":102},"end":{"line":40,"column":127}}}))
    + "\">"
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"discardChanges",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":40,"column":129},"end":{"line":40,"column":154}}}))
    + "</button>\r\n</div>\r\n";
},"useData":true});

/***/ })

}]);
//# sourceMappingURL=../maps/chunks/TC_templates_tc-ctl-wfsedit_mjs.sitna.debug.js.map