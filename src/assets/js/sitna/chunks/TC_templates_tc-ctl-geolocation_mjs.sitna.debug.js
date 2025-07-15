"use strict";
(self["webpackChunkSITNA"] = self["webpackChunkSITNA"] || []).push([["TC_templates_tc-ctl-geolocation_mjs"],{

/***/ "./TC/templates/tc-ctl-geolocation.mjs":
/*!*********************************************!*\
  !*** ./TC/templates/tc-ctl-geolocation.mjs ***!
  \*********************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.escapeExpression, alias3=container.lambda, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<h2>"
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"geo",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":1,"column":4},"end":{"line":1,"column":18}}}))
    + "</h2>\r\n<div class=\"tc-ctl-geolocation-content\">    \r\n    <div class=\"tc-ctl-geolocation-track\">\r\n        <div class=\"tc-ctl-geolocation-track-snap-info\"></div>                \r\n        <div class=\"tc-ctl-geolocation-track-panel-block\" >\r\n            <label title=\""
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"geo.trk.panel.help.1",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":6,"column":26},"end":{"line":6,"column":57}}}))
    + "\">\r\n                <input class=\"tc-toggle\" type=\"checkbox\" checked />\r\n                "
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"geo.trk.panel.help.2",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":8,"column":16},"end":{"line":8,"column":47}}}))
    + "\r\n            </label>\r\n            <sitna-button variant=\"minimal\" icon=\"help\" text=\""
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"geo.trk.panel.help.3",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":10,"column":62},"end":{"line":10,"column":93}}}))
    + "\" class=\"tc-ctl-geolocation-track-panel-help\"></sitna-button>\r\n        </div>\r\n        <div class=\"tc-ctl-geolocation-track-mng\">\r\n            <div class=\"tc-ctl-geolocation-select\">\r\n                <sitna-tab text=\""
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"geo.gps",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":14,"column":33},"end":{"line":14,"column":51}}}))
    + "\" title=\""
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"geo.track.title",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":14,"column":60},"end":{"line":14,"column":86}}}))
    + "\" group=\""
    + alias2(alias3((depth0 != null ? lookupProperty(depth0,"controlId") : depth0), depth0))
    + "-mode\" selected for=\""
    + alias2(alias3((depth0 != null ? lookupProperty(depth0,"controlId") : depth0), depth0))
    + "-geolocation-panel\"></sitna-tab>\r\n                <sitna-tab text=\""
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"geo.tracks",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":15,"column":33},"end":{"line":15,"column":54}}}))
    + "\" title=\""
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"geo.tracks.title",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":15,"column":63},"end":{"line":15,"column":90}}}))
    + "\" group=\""
    + alias2(alias3((depth0 != null ? lookupProperty(depth0,"controlId") : depth0), depth0))
    + "-mode\" for=\""
    + alias2(alias3((depth0 != null ? lookupProperty(depth0,"controlId") : depth0), depth0))
    + "-tracks-panel\"></sitna-tab>\r\n            </div>                        \r\n            <div id=\""
    + alias2(alias3((depth0 != null ? lookupProperty(depth0,"controlId") : depth0), depth0))
    + "-tracks-panel\" class=\"tc-ctl-geolocation-track-available tc-ctl-geolocation-track-cnt tc-ctl-geolocation-panel tc-hidden\">\r\n                <i class=\"tc-ctl-geolocation-track-search-icon\"></i>\r\n                <input id=\"tc-ctl-geolocation-track-available-srch\" type=\"search\" list=\"tc-ctl-geolocation-track-available-lst\" class=\"tc-ctl-geolocation-track-available-srch tc-textbox\" placeholder=\""
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"geo.filter.plhr",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":19,"column":200},"end":{"line":19,"column":226}}}))
    + "\" maxlength=\"200\" />                \r\n                <ol class=\"tc-list tc-ctl-geolocation-track-available-lst\">\r\n                    <li class=\"tc-ctl-geolocation-track-available-empty\"><span>"
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"geo.noTracks",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":21,"column":79},"end":{"line":21,"column":102}}}))
    + "</span></li>\r\n                    <li class=\"tc-ctl-geolocation-track-not\" hidden><span>"
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"noMatches",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":22,"column":74},"end":{"line":22,"column":94}}}))
    + "</span></li>\r\n                </ol>\r\n                <div class=\"tc-ctl-geolocation-track-cnt\">\r\n                    <button type=\"button\" class=\"tc-button tc-icon-button tc-btn-delete-all\" disabled title=\""
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"geo.trk.delete.all.tooltip",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":25,"column":109},"end":{"line":25,"column":146}}}))
    + "\">"
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"geo.trk.delete.all",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":25,"column":148},"end":{"line":25,"column":177}}}))
    + "</button>\r\n                    <input name=\"uploaded-file\" id=\"uploaded-file-"
    + alias2(alias3((depth0 != null ? lookupProperty(depth0,"controlId") : depth0), depth0))
    + "\" type=\"file\" class=\"tc-ctl-geolocation-track-import tc-button\" accept=\".gpx,.kml,.kmz\" disabled />\r\n                    <label class=\"tc-button tc-icon-button\" for=\"uploaded-file-"
    + alias2(alias3((depth0 != null ? lookupProperty(depth0,"controlId") : depth0), depth0))
    + "\" title=\""
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"geo.trk.import.upload",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":27,"column":101},"end":{"line":27,"column":134}}}))
    + "\">"
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"geo.trk.import.lbl",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":27,"column":136},"end":{"line":27,"column":165}}}))
    + "</label>\r\n                </div>\r\n            </div>\r\n            <div id=\""
    + alias2(alias3((depth0 != null ? lookupProperty(depth0,"controlId") : depth0), depth0))
    + "-geolocation-panel\" class=\"tc-ctl-geolocation-tracks tc-ctl-geolocation-panel\">    \r\n                <div class=\"tc-alert tc-alert-warning tc-hidden\" >\r\n                    <p id=\"panel-msg\">\r\n                        "
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"geo.trk.panel.1",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":33,"column":24},"end":{"line":33,"column":50}}}))
    + "                    \r\n                        <ul>\r\n                            <li>"
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"geo.trk.panel.2",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":35,"column":32},"end":{"line":35,"column":58}}}))
    + "</li>\r\n                            <li>"
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"geo.trk.panel.3",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":36,"column":32},"end":{"line":36,"column":58}}}))
    + "</li>\r\n                            <li>"
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"geo.trk.panel.4",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":37,"column":32},"end":{"line":37,"column":58}}}))
    + "</li>\r\n                            <li>"
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"geo.trk.panel.5",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":38,"column":32},"end":{"line":38,"column":58}}}))
    + "</li>\r\n                        </ul>\r\n                    </p>\r\n                </div>            \r\n                <div class=\"tc-ctl-geolocation-track-ui\">   \r\n                    <div  class=\"tc-ctl-geolocation-track-render\">\r\n                        <input id=\"tc-ctl-geolocation-track-render-"
    + alias2(alias3((depth0 != null ? lookupProperty(depth0,"controlId") : depth0), depth0))
    + "\" class=\"tc-toggle\" type=\"checkbox\" checked />\r\n                        <label for=\"tc-ctl-geolocation-track-render-"
    + alias2(alias3((depth0 != null ? lookupProperty(depth0,"controlId") : depth0), depth0))
    + "\" class=\"tc-ctl-geolocation-track-render\" title=\""
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"geo.trk.render",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":45,"column":130},"end":{"line":45,"column":155}}}))
    + "\">"
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"geo.trk.render",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":45,"column":157},"end":{"line":45,"column":182}}}))
    + "</label>\r\n                    </div>\r\n                    <button type=\"button\" class=\"tc-button tc-icon-button tc-ctl-geolocation-track-ui-activate\" title=\""
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"geo.track.activate.title",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":47,"column":119},"end":{"line":47,"column":154}}}))
    + "\">"
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"geo.track.activate",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":47,"column":156},"end":{"line":47,"column":185}}}))
    + "</button>\r\n                    <button type=\"button\" class=\"tc-button tc-icon-button tc-ctl-geolocation-track-ui-deactivate tc-hidden\" title=\""
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"geo.track.deactivate.title",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":48,"column":131},"end":{"line":48,"column":169}}}))
    + "\">"
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"geo.track.deactivate",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":48,"column":171},"end":{"line":48,"column":202}}}))
    + "</button>\r\n                </div>\r\n                <div class=\"tc-ctl-geolocation-track-current tc-ctl-geolocation-track-cnt\">\r\n                    <input type=\"text\" class=\"tc-ctl-geolocation-track-title tc-textbox\" disabled placeholder=\""
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"geo.trk.name.plhr",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":51,"column":111},"end":{"line":51,"column":139}}}))
    + "\" maxlength=\"200\" /><button type=\"button\" class=\"tc-button tc-icon-button tc-ctl-geolocation-track-save\" disabled title=\""
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"geo.trk.name.save",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":51,"column":260},"end":{"line":51,"column":288}}}))
    + "\"></button>\r\n                    <input type=\"text\" class=\"tc-ctl-geolocation-track-waypoint tc-textbox\" disabled placeholder=\""
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"geo.trk.wyp.plhr",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":52,"column":114},"end":{"line":52,"column":141}}}))
    + "\" maxlength=\"200\" /><button type=\"button\" class=\"tc-button tc-icon-button tc-ctl-geolocation-track-add-wpt\" disabled title=\""
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"geo.trk.wyp.save",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":52,"column":265},"end":{"line":52,"column":292}}}))
    + "\"></button>                    \r\n                </div>\r\n            </div>\r\n        </div>\r\n    </div>\r\n</div>\r\n<div class=\"tc-ctl-geolocation-track-center tc-hidden\">\r\n    <button type=\"button\" class=\"tc-float-btn\" title=\""
    + alias2(lookupProperty(helpers,"i18n").call(alias1,"geo.trk.center",{"name":"i18n","hash":{},"data":data,"loc":{"start":{"line":59,"column":54},"end":{"line":59,"column":79}}}))
    + "\"></button>\r\n</div>\r\n\r\n\r\n";
},"useData":true});

/***/ })

}]);
//# sourceMappingURL=../maps/chunks/TC_templates_tc-ctl-geolocation_mjs.sitna.debug.js.map