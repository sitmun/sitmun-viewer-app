// @ts-nocheck
var ret = false;
var info = null;
var selfClass = null;

TC.control = TC.control || {};

if (!TC.control.LayerCatalog) {
    TC.syncLoadJS(TC.apiLocation + 'TC/control/LayerCatalog');
}

(function () {
    const cacheCapabilities = {};

    const realTree = new Object();

    TC.control.LayerCatalogSilme = function () {
        var _ctl = this;

        TC.control.LayerCatalog.apply(_ctl, arguments);

        _ctl._selectors = {
            LAYER_ROOT: 'div.' + _ctl.CLASS + '-tree > ul.' + _ctl.CLASS + '-branch > li.' + _ctl.CLASS + '-node > ul.' + _ctl.CLASS + '-branch > li.' + _ctl.CLASS + '-node'
        };
    };

    TC.inherit(TC.control.LayerCatalogSilme, TC.control.LayerCatalog);

    TC.control.LayerCatalogSilme.prototype.register = function (map) {
        var _ctl = this;

        _ctl.template[_ctl.CLASS] = TC.isDebug ? "patch/templates/LayerCatalogSilme.hbs" : { "1": function (container, depth0, helpers, partials, data) { var stack1, alias1 = depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function (parent, propertyName) { if (Object.prototype.hasOwnProperty.call(parent, propertyName)) { return parent[propertyName]; } return undefined }; return ((stack1 = lookupProperty(helpers, "if").call(alias1, (depth0 != null ? lookupProperty(depth0, "layerTrees") : depth0), { "name": "if", "hash": {}, "fn": container.program(2, data, 0), "inverse": container.noop, "data": data, "loc": { "start": { "line": 4, "column": 4 }, "end": { "line": 7, "column": 11 } } })) != null ? stack1 : "") + ((stack1 = lookupProperty(helpers, "if").call(alias1, (depth0 != null ? lookupProperty(depth0, "layers") : depth0), { "name": "if", "hash": {}, "fn": container.program(2, data, 0), "inverse": container.noop, "data": data, "loc": { "start": { "line": 8, "column": 4 }, "end": { "line": 11, "column": 11 } } })) != null ? stack1 : ""); }, "2": function (container, depth0, helpers, partials, data) { var alias1 = depth0 != null ? depth0 : (container.nullContext || {}), alias2 = container.escapeExpression, lookupProperty = container.lookupProperty || function (parent, propertyName) { if (Object.prototype.hasOwnProperty.call(parent, propertyName)) { return parent[propertyName]; } return undefined }; return "    <button class=\"tc-ctl-lcat-btn-search\" title=\"" + alias2(lookupProperty(helpers, "i18n").call(alias1, "searchLayersByText", { "name": "i18n", "hash": {}, "data": data, "loc": { "start": { "line": 5, "column": 50 }, "end": { "line": 5, "column": 79 } } })) + "\"></button>    <label id=\"canvi-projecte-silme\" class=\"tc-ctl-lcat-btn-search-silme\" title=\"" + alias2(lookupProperty(helpers, "i18n").call(alias1, "changeTopicOrganization", { "name": "i18n", "hash": {}, "data": data, "loc": { "start": { "line": 6, "column": 81 }, "end": { "line": 6, "column": 115 } } })) + "\">" + alias2(lookupProperty(helpers, "i18n").call(alias1, "changeTopic", { "name": "i18n", "hash": {}, "data": data, "loc": { "start": { "line": 6, "column": 117 }, "end": { "line": 6, "column": 139 } } })) + "</label>"; }, "4": function (container, depth0, helpers, partials, data) { var stack1, lookupProperty = container.lookupProperty || function (parent, propertyName) { if (Object.prototype.hasOwnProperty.call(parent, propertyName)) { return parent[propertyName]; } return undefined }; return "    <ul class=\"tc-ctl-lcat-branch\">" + ((stack1 = lookupProperty(helpers, "each").call(depth0 != null ? depth0 : (container.nullContext || {}), (depth0 != null ? lookupProperty(depth0, "layerTrees") : depth0), { "name": "each", "hash": {}, "fn": container.program(5, data, 0), "inverse": container.noop, "data": data, "loc": { "start": { "line": 27, "column": 8 }, "end": { "line": 29, "column": 17 } } })) != null ? stack1 : "") + "    </ul>"; }, "5": function (container, depth0, helpers, partials, data) { var stack1, lookupProperty = container.lookupProperty || function (parent, propertyName) { if (Object.prototype.hasOwnProperty.call(parent, propertyName)) { return parent[propertyName]; } return undefined }; return ((stack1 = container.invokePartial(lookupProperty(partials, "tc-ctl-lcat-branch"), depth0, { "name": "tc-ctl-lcat-branch", "data": data, "indent": "        ", "helpers": helpers, "partials": partials, "decorators": container.decorators })) != null ? stack1 : ""); }, "7": function (container, depth0, helpers, partials, data) { var stack1, lookupProperty = container.lookupProperty || function (parent, propertyName) { if (Object.prototype.hasOwnProperty.call(parent, propertyName)) { return parent[propertyName]; } return undefined }; return ((stack1 = lookupProperty(helpers, "if").call(depth0 != null ? depth0 : (container.nullContext || {}), (depth0 != null ? lookupProperty(depth0, "layers") : depth0), { "name": "if", "hash": {}, "fn": container.program(8, data, 0), "inverse": container.program(11, data, 0), "data": data, "loc": { "start": { "line": 32, "column": 4 }, "end": { "line": 42, "column": 11 } } })) != null ? stack1 : ""); }, "8": function (container, depth0, helpers, partials, data) { var stack1, lookupProperty = container.lookupProperty || function (parent, propertyName) { if (Object.prototype.hasOwnProperty.call(parent, propertyName)) { return parent[propertyName]; } return undefined }; return "    <ul class=\"tc-ctl-lcat-branch\">" + ((stack1 = lookupProperty(helpers, "each").call(depth0 != null ? depth0 : (container.nullContext || {}), (depth0 != null ? lookupProperty(depth0, "layers") : depth0), { "name": "each", "hash": {}, "fn": container.program(9, data, 0), "inverse": container.noop, "data": data, "loc": { "start": { "line": 34, "column": 8 }, "end": { "line": 36, "column": 17 } } })) != null ? stack1 : "") + "    </ul>"; }, "9": function (container, depth0, helpers, partials, data) { var alias1 = container.lambda, alias2 = container.escapeExpression, lookupProperty = container.lookupProperty || function (parent, propertyName) { if (Object.prototype.hasOwnProperty.call(parent, propertyName)) { return parent[propertyName]; } return undefined }; return "        <li data-layer-id=\"" + alias2(alias1((depth0 != null ? lookupProperty(depth0, "id") : depth0), depth0)) + "\" title=\"" + alias2(lookupProperty(helpers, "i18n").call(depth0 != null ? depth0 : (container.nullContext || {}), "loadingLayers", { "name": "i18n", "hash": {}, "data": data, "loc": { "start": { "line": 35, "column": 42 }, "end": { "line": 35, "column": 66 } } })) + "\" class=\"tc-ctl-lcat-loading-node\"> " + alias2(alias1((depth0 != null ? lookupProperty(depth0, "title") : depth0), depth0)) + "</li>"; }, "11": function (container, depth0, helpers, partials, data) { var lookupProperty = container.lookupProperty || function (parent, propertyName) { if (Object.prototype.hasOwnProperty.call(parent, propertyName)) { return parent[propertyName]; } return undefined }; return "    <div class=\"tc-ctl tc-ctl-lcat-loading\">        <span>" + container.escapeExpression(lookupProperty(helpers, "i18n").call(depth0 != null ? depth0 : (container.nullContext || {}), "loadingLayerTree", { "name": "i18n", "hash": {}, "data": data, "loc": { "start": { "line": 40, "column": 14 }, "end": { "line": 40, "column": 41 } } })) + "...</span>    </div>"; }, "compiler": [8, ">= 4.3.0"], "main": function (container, depth0, helpers, partials, data) { var stack1, alias1 = depth0 != null ? depth0 : (container.nullContext || {}), alias2 = container.escapeExpression, lookupProperty = container.lookupProperty || function (parent, propertyName) { if (Object.prototype.hasOwnProperty.call(parent, propertyName)) { return parent[propertyName]; } return undefined }; return "<h2>    " + alias2(lookupProperty(helpers, "i18n").call(alias1, "availableLayers", { "name": "i18n", "hash": {}, "data": data, "loc": { "start": { "line": 2, "column": 4 }, "end": { "line": 2, "column": 31 } } })) + "" + ((stack1 = lookupProperty(helpers, "if").call(alias1, (depth0 != null ? lookupProperty(depth0, "enableSearch") : depth0), { "name": "if", "hash": {}, "fn": container.program(1, data, 0), "inverse": container.noop, "data": data, "loc": { "start": { "line": 3, "column": 4 }, "end": { "line": 12, "column": 11 } } })) != null ? stack1 : "") + "</h2><div class=\"tc-ctl-lcat-search tc-hidden tc-collapsed\">    <div class=\"tc-group\">        <input type=\"search\" class=\"tc-ctl-lcat-input tc-textbox\" placeholder=\"" + alias2(lookupProperty(helpers, "i18n").call(alias1, "textToSearchInLayers", { "name": "i18n", "hash": {}, "data": data, "loc": { "start": { "line": 18, "column": 79 }, "end": { "line": 18, "column": 110 } } })) + "\">    </div>    <ul></ul></div><div class=\"tc-ctl-lcat-tree\" id=\"arbol\">" + ((stack1 = lookupProperty(helpers, "if").call(alias1, (depth0 != null ? lookupProperty(depth0, "layerTrees") : depth0), { "name": "if", "hash": {}, "fn": container.program(4, data, 0), "inverse": container.program(7, data, 0), "data": data, "loc": { "start": { "line": 25, "column": 4 }, "end": { "line": 43, "column": 11 } } })) != null ? stack1 : "") + "</div><div class=\"tc-ctl-lcat-info tc-hidden\">" + ((stack1 = container.invokePartial(lookupProperty(partials, "tc-ctl-lcat-info"), depth0, { "name": "tc-ctl-lcat-info", "data": data, "indent": "    ", "helpers": helpers, "partials": partials, "decorators": container.decorators })) != null ? stack1 : "") + "</div><div id=\"projects\" class=\"tc-ctl-lcat-proj tc-hidden\">" + ((stack1 = container.invokePartial(lookupProperty(partials, "tc-ctl-lcat-proj"), depth0, { "name": "tc-ctl-lcat-proj", "data": data, "indent": "    ", "helpers": helpers, "partials": partials, "decorators": container.decorators })) != null ? stack1 : "") + "</div>"; }, "usePartial": true, "useData": true };
        _ctl.template[_ctl.CLASS + "-node"] = TC.isDebug ? "patch/templates/LayerCatalogNodeSilme.hbs" : { "1": function (container, depth0, helpers, partials, data) { return " class=\"tc-ctl-lcat-node tc-collapsed\" "; }, "3": function (container, depth0, helpers, partials, data) { return " class=\"tc-ctl-lcat-node tc-ctl-lcat-leaf\" "; }, "5": function (container, depth0, helpers, partials, data) { return "<button aria-label=\"Collapse Button\" class=\"tc-ctl-lcat-collapse-btn\"></button>"; }, "7": function (container, depth0, helpers, partials, data) { var lookupProperty = container.lookupProperty || function (parent, propertyName) { if (Object.prototype.hasOwnProperty.call(parent, propertyName)) { return parent[propertyName]; } return undefined }; return container.escapeExpression(container.lambda((depth0 != null ? lookupProperty(depth0, "title") : depth0), depth0)); }, "9": function (container, depth0, helpers, partials, data) { var lookupProperty = container.lookupProperty || function (parent, propertyName) { if (Object.prototype.hasOwnProperty.call(parent, propertyName)) { return parent[propertyName]; } return undefined }; return "<button title=\"" + container.escapeExpression(lookupProperty(helpers, "i18n").call(depth0 != null ? depth0 : (container.nullContext || {}), "infoFromThisLayer", { "name": "i18n", "hash": {}, "data": data, "loc": { "start": { "line": 3, "column": 90 }, "end": { "line": 3, "column": 118 } } })) + "\" class=\"tc-ctl-lcat-btn-info\"></button>"; }, "11": function (container, depth0, helpers, partials, data) { return "<ul class=\"tc-ctl-lcat-branch tc-collapsed\">"; }, "13": function (container, depth0, helpers, partials, data) { var stack1, lookupProperty = container.lookupProperty || function (parent, propertyName) { if (Object.prototype.hasOwnProperty.call(parent, propertyName)) { return parent[propertyName]; } return undefined }; return ((stack1 = container.invokePartial(lookupProperty(partials, "tc-ctl-lcat-node"), depth0, { "name": "tc-ctl-lcat-node", "data": data, "indent": "        ", "helpers": helpers, "partials": partials, "decorators": container.decorators })) != null ? stack1 : ""); }, "15": function (container, depth0, helpers, partials, data) { return "</ul>"; }, "compiler": [8, ">= 4.3.0"], "main": function (container, depth0, helpers, partials, data) { var stack1, alias1 = depth0 != null ? depth0 : (container.nullContext || {}), alias2 = container.lambda, alias3 = container.escapeExpression, lookupProperty = container.lookupProperty || function (parent, propertyName) { if (Object.prototype.hasOwnProperty.call(parent, propertyName)) { return parent[propertyName]; } return undefined }; return "<li " + ((stack1 = lookupProperty(helpers, "if").call(alias1, (depth0 != null ? lookupProperty(depth0, "children") : depth0), { "name": "if", "hash": {}, "fn": container.program(1, data, 0), "inverse": container.program(3, data, 0), "data": data, "loc": { "start": { "line": 1, "column": 4 }, "end": { "line": 1, "column": 117 } } })) != null ? stack1 : "") + " data-layer-name=\"" + alias3(alias2((depth0 != null ? lookupProperty(depth0, "name") : depth0), depth0)) + "\" data-layer-uid=\"" + alias3(alias2((depth0 != null ? lookupProperty(depth0, "uid") : depth0), depth0)) + "\" id=\"" + alias3(alias2((depth0 != null ? lookupProperty(depth0, "id") : depth0), depth0)) + "\">    " + ((stack1 = lookupProperty(helpers, "if").call(alias1, (depth0 != null ? lookupProperty(depth0, "children") : depth0), { "name": "if", "hash": {}, "fn": container.program(5, data, 0), "inverse": container.noop, "data": data, "loc": { "start": { "line": 2, "column": 4 }, "end": { "line": 2, "column": 106 } } })) != null ? stack1 : "") + "    <span title=\"" + ((stack1 = lookupProperty(helpers, "if").call(alias1, (depth0 != null ? lookupProperty(depth0, "name") : depth0), { "name": "if", "hash": {}, "fn": container.program(7, data, 0), "inverse": container.noop, "data": data, "loc": { "start": { "line": 3, "column": 17 }, "end": { "line": 3, "column": 45 } } })) != null ? stack1 : "") + "\">" + alias3(alias2((depth0 != null ? lookupProperty(depth0, "title") : depth0), depth0)) + "</span>" + ((stack1 = lookupProperty(helpers, "if").call(alias1, (depth0 != null ? lookupProperty(depth0, "name") : depth0), { "name": "if", "hash": {}, "fn": container.program(9, data, 0), "inverse": container.noop, "data": data, "loc": { "start": { "line": 3, "column": 63 }, "end": { "line": 3, "column": 165 } } })) != null ? stack1 : "") + "    " + ((stack1 = lookupProperty(helpers, "if").call(alias1, (depth0 != null ? lookupProperty(depth0, "children") : depth0), { "name": "if", "hash": {}, "fn": container.program(11, data, 0), "inverse": container.noop, "data": data, "loc": { "start": { "line": 4, "column": 4 }, "end": { "line": 5, "column": 15 } } })) != null ? stack1 : "") + "" + ((stack1 = lookupProperty(helpers, "each").call(alias1, (depth0 != null ? lookupProperty(depth0, "children") : depth0), { "name": "each", "hash": {}, "fn": container.program(13, data, 0), "inverse": container.noop, "data": data, "loc": { "start": { "line": 7, "column": 8 }, "end": { "line": 9, "column": 17 } } })) != null ? stack1 : "") + "        " + ((stack1 = lookupProperty(helpers, "if").call(alias1, (depth0 != null ? lookupProperty(depth0, "children") : depth0), { "name": "if", "hash": {}, "fn": container.program(15, data, 0), "inverse": container.noop, "data": data, "loc": { "start": { "line": 11, "column": 8 }, "end": { "line": 11, "column": 36 } } })) != null ? stack1 : "") + "</li>"; }, "usePartial": true, "useData": true };
        _ctl.template[_ctl.CLASS + "-branch"] = TC.isDebug ? "patch/templates/LayerCatalogBranchSilme.hbs" : { "1": function (container, depth0, helpers, partials, data) { var stack1, lookupProperty = container.lookupProperty || function (parent, propertyName) { if (Object.prototype.hasOwnProperty.call(parent, propertyName)) { return parent[propertyName]; } return undefined }; return ((stack1 = container.invokePartial(lookupProperty(partials, "tc-ctl-lcat-node"), depth0, { "name": "tc-ctl-lcat-node", "data": data, "indent": "            ", "helpers": helpers, "partials": partials, "decorators": container.decorators })) != null ? stack1 : ""); }, "compiler": [8, ">= 4.3.0"], "main": function (container, depth0, helpers, partials, data) { var stack1, alias1 = container.lambda, alias2 = container.escapeExpression, lookupProperty = container.lookupProperty || function (parent, propertyName) { if (Object.prototype.hasOwnProperty.call(parent, propertyName)) { return parent[propertyName]; } return undefined }; return "<ul class=\"tc-ctl-lcat-node\" id=\"" + alias2(alias1((depth0 != null ? lookupProperty(depth0, "id") : depth0), depth0)) + "\">    <span>" + alias2(alias1((depth0 != null ? lookupProperty(depth0, "title") : depth0), depth0)) + "</span>    <ul class=\"tc-ctl-lcat-branch tc-collapsed\">" + ((stack1 = lookupProperty(helpers, "each").call(depth0 != null ? depth0 : (container.nullContext || {}), (depth0 != null ? lookupProperty(depth0, "children") : depth0), { "name": "each", "hash": {}, "fn": container.program(1, data, 0), "inverse": container.noop, "data": data, "loc": { "start": { "line": 5, "column": 8 }, "end": { "line": 7, "column": 17 } } })) != null ? stack1 : "") + "    </ul></ul>"; }, "usePartial": true, "useData": true };
        _ctl.template[_ctl.CLASS + '-info'] = TC.isDebug ? "patch/templates/LayerCatalogInfoSilme.hbs" : { "1": function (container, depth0, helpers, partials, data) { var stack1, lookupProperty = container.lookupProperty || function (parent, propertyName) { if (Object.prototype.hasOwnProperty.call(parent, propertyName)) { return parent[propertyName]; } return undefined }; return "    <div class=\"tc-ctl-lcat-name\">" + ((stack1 = lookupProperty(helpers, "if").call(depth0 != null ? depth0 : (container.nullContext || {}), (depth0 != null ? lookupProperty(depth0, "isGroup") : depth0), { "name": "if", "hash": {}, "fn": container.program(2, data, 0), "inverse": container.program(4, data, 0), "data": data, "loc": { "start": { "line": 7, "column": 8 }, "end": { "line": 11, "column": 15 } } })) != null ? stack1 : "") + "        <div id=\"lcat-info\"><pre>" + ((stack1 = container.lambda((depth0 != null ? lookupProperty(depth0, "name") : depth0), depth0)) != null ? stack1 : "") + "</pre></div>    </div>"; }, "2": function (container, depth0, helpers, partials, data) { var lookupProperty = container.lookupProperty || function (parent, propertyName) { if (Object.prototype.hasOwnProperty.call(parent, propertyName)) { return parent[propertyName]; } return undefined }; return "        <h4 id=\"lcat-info-title\">" + container.escapeExpression(lookupProperty(helpers, "i18n").call(depth0 != null ? depth0 : (container.nullContext || {}), "groupLayerId", { "name": "i18n", "hash": {}, "data": data, "loc": { "start": { "line": 8, "column": 33 }, "end": { "line": 8, "column": 56 } } })) + "</h4>"; }, "4": function (container, depth0, helpers, partials, data) { var lookupProperty = container.lookupProperty || function (parent, propertyName) { if (Object.prototype.hasOwnProperty.call(parent, propertyName)) { return parent[propertyName]; } return undefined }; return "        <h4 id=\"lcat-info-title\">" + container.escapeExpression(lookupProperty(helpers, "i18n").call(depth0 != null ? depth0 : (container.nullContext || {}), "layerId", { "name": "i18n", "hash": {}, "data": data, "loc": { "start": { "line": 10, "column": 33 }, "end": { "line": 10, "column": 51 } } })) + "</h4>"; }, "6": function (container, depth0, helpers, partials, data) { var stack1, alias1 = depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function (parent, propertyName) { if (Object.prototype.hasOwnProperty.call(parent, propertyName)) { return parent[propertyName]; } return undefined }; return "    <div class=\"tc-ctl-lcat-metadata\">        <!--<h4>" + container.escapeExpression(lookupProperty(helpers, "i18n").call(alias1, "metadata", { "name": "i18n", "hash": {}, "data": data, "loc": { "start": { "line": 17, "column": 16 }, "end": { "line": 17, "column": 35 } } })) + "</h4>-->" + ((stack1 = lookupProperty(helpers, "each").call(alias1, (depth0 != null ? lookupProperty(depth0, "metadata") : depth0), { "name": "each", "hash": {}, "fn": container.program(7, data, 0), "inverse": container.noop, "data": data, "loc": { "start": { "line": 18, "column": 8 }, "end": { "line": 20, "column": 17 } } })) != null ? stack1 : "") + "    </div>"; }, "7": function (container, depth0, helpers, partials, data) { var stack1, alias1 = container.lambda, lookupProperty = container.lookupProperty || function (parent, propertyName) { if (Object.prototype.hasOwnProperty.call(parent, propertyName)) { return parent[propertyName]; } return undefined }; return "        <a href=\"" + ((stack1 = alias1((depth0 != null ? lookupProperty(depth0, "url") : depth0), depth0)) != null ? stack1 : "") + "\" type=\"" + ((stack1 = alias1((depth0 != null ? lookupProperty(depth0, "format") : depth0), depth0)) != null ? stack1 : "") + "\" title=\"" + ((stack1 = alias1((depth0 != null ? lookupProperty(depth0, "formatDescription") : depth0), depth0)) != null ? stack1 : "") + "\" target=\"_blank\">" + ((stack1 = alias1((depth0 != null ? lookupProperty(depth0, "formatDescription") : depth0), depth0)) != null ? stack1 : "") + "</a>"; }, "9": function (container, depth0, helpers, partials, data) { var stack1, alias1 = depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function (parent, propertyName) { if (Object.prototype.hasOwnProperty.call(parent, propertyName)) { return parent[propertyName]; } return undefined }; return "    <div class=\"tc-ctl-lcat-descarregadades\">        <!--<h4>" + container.escapeExpression(lookupProperty(helpers, "i18n").call(alias1, "descarregadades", { "name": "i18n", "hash": {}, "data": data, "loc": { "start": { "line": 25, "column": 16 }, "end": { "line": 25, "column": 42 } } })) + "</h4>-->" + ((stack1 = lookupProperty(helpers, "each").call(alias1, (depth0 != null ? lookupProperty(depth0, "dataUrl") : depth0), { "name": "each", "hash": {}, "fn": container.program(7, data, 0), "inverse": container.noop, "data": data, "loc": { "start": { "line": 26, "column": 8 }, "end": { "line": 28, "column": 17 } } })) != null ? stack1 : "") + "    </div>"; }, "11": function (container, depth0, helpers, partials, data) { var stack1, alias1 = container.lambda, lookupProperty = container.lookupProperty || function (parent, propertyName) { if (Object.prototype.hasOwnProperty.call(parent, propertyName)) { return parent[propertyName]; } return undefined }; return "    <div class=\"tc-ctl-lcat-url\">        <h4>" + container.escapeExpression(lookupProperty(helpers, "i18n").call(depth0 != null ? depth0 : (container.nullContext || {}), "url", { "name": "i18n", "hash": {}, "data": data, "loc": { "start": { "line": 33, "column": 12 }, "end": { "line": 33, "column": 26 } } })) + "</h4>        <a href=\"" + ((stack1 = alias1((depth0 != null ? lookupProperty(depth0, "url") : depth0), depth0)) != null ? stack1 : "") + "?service=wms&amp;request=getcapabilities\" target=\"_blank\">" + ((stack1 = alias1((depth0 != null ? lookupProperty(depth0, "url") : depth0), depth0)) != null ? stack1 : "") + "</a>    </div>"; }, "13": function (container, depth0, helpers, partials, data) { var stack1, lookupProperty = container.lookupProperty || function (parent, propertyName) { if (Object.prototype.hasOwnProperty.call(parent, propertyName)) { return parent[propertyName]; } return undefined }; return "    <div class=\"tc-ctl-lcat-abstract\">" + ((stack1 = lookupProperty(helpers, "if").call(depth0 != null ? depth0 : (container.nullContext || {}), (depth0 != null ? lookupProperty(depth0, "isGroup") : depth0), { "name": "if", "hash": {}, "fn": container.program(14, data, 0), "inverse": container.program(16, data, 0), "data": data, "loc": { "start": { "line": 39, "column": 8 }, "end": { "line": 43, "column": 15 } } })) != null ? stack1 : "") + "        <div><pre>" + ((stack1 = container.lambda((depth0 != null ? lookupProperty(depth0, "abstract") : depth0), depth0)) != null ? stack1 : "") + "</pre></div>    </div>"; }, "14": function (container, depth0, helpers, partials, data) { var lookupProperty = container.lookupProperty || function (parent, propertyName) { if (Object.prototype.hasOwnProperty.call(parent, propertyName)) { return parent[propertyName]; } return undefined }; return "        <h4>" + container.escapeExpression(lookupProperty(helpers, "i18n").call(depth0 != null ? depth0 : (container.nullContext || {}), "groupAbstract", { "name": "i18n", "hash": {}, "data": data, "loc": { "start": { "line": 40, "column": 12 }, "end": { "line": 40, "column": 36 } } })) + "</h4>"; }, "16": function (container, depth0, helpers, partials, data) { var lookupProperty = container.lookupProperty || function (parent, propertyName) { if (Object.prototype.hasOwnProperty.call(parent, propertyName)) { return parent[propertyName]; } return undefined }; return "        <h4>" + container.escapeExpression(lookupProperty(helpers, "i18n").call(depth0 != null ? depth0 : (container.nullContext || {}), "abstract", { "name": "i18n", "hash": {}, "data": data, "loc": { "start": { "line": 42, "column": 12 }, "end": { "line": 42, "column": 31 } } })) + "</h4>"; }, "18": function (container, depth0, helpers, partials, data) { var stack1, lookupProperty = container.lookupProperty || function (parent, propertyName) { if (Object.prototype.hasOwnProperty.call(parent, propertyName)) { return parent[propertyName]; } return undefined }; return "    <div class=\"tc-ctl-lcat-parentAbstract\">        <h4>" + container.escapeExpression(lookupProperty(helpers, "i18n").call(depth0 != null ? depth0 : (container.nullContext || {}), "parentAbstract", { "name": "i18n", "hash": {}, "data": data, "loc": { "start": { "line": 49, "column": 12 }, "end": { "line": 49, "column": 37 } } })) + "</h4>        <div><pre>" + ((stack1 = container.lambda((depth0 != null ? lookupProperty(depth0, "parentAbstract") : depth0), depth0)) != null ? stack1 : "") + "</pre></div>    </div>"; }, "20": function (container, depth0, helpers, partials, data) { var stack1, lookupProperty = container.lookupProperty || function (parent, propertyName) { if (Object.prototype.hasOwnProperty.call(parent, propertyName)) { return parent[propertyName]; } return undefined }; return "    <div class=\"tc-ctl-lcat-info-data\">        <h4 class=\"tc-ctl-lcat-info-data-title\">" + container.escapeExpression(lookupProperty(helpers, "i18n").call(depth0 != null ? depth0 : (container.nullContext || {}), "contactPerson", { "name": "i18n", "hash": {}, "data": data, "loc": { "start": { "line": 55, "column": 48 }, "end": { "line": 55, "column": 72 } } })) + "</h4>        <div class=\"tc-ctl-lcat-info-data-content\"><pre>" + ((stack1 = container.lambda((depth0 != null ? lookupProperty(depth0, "contactPerson") : depth0), depth0)) != null ? stack1 : "") + "</pre></div>    </div>"; }, "22": function (container, depth0, helpers, partials, data) { var stack1, lookupProperty = container.lookupProperty || function (parent, propertyName) { if (Object.prototype.hasOwnProperty.call(parent, propertyName)) { return parent[propertyName]; } return undefined }; return "    <div class=\"tc-ctl-lcat-info-data\">        <h4 class=\"tc-ctl-lcat-info-data-title\">" + container.escapeExpression(lookupProperty(helpers, "i18n").call(depth0 != null ? depth0 : (container.nullContext || {}), "contactOrganization", { "name": "i18n", "hash": {}, "data": data, "loc": { "start": { "line": 61, "column": 48 }, "end": { "line": 61, "column": 78 } } })) + "</h4>        <div class=\"tc-ctl-lcat-info-data-content\"><pre>" + ((stack1 = container.lambda((depth0 != null ? lookupProperty(depth0, "ontactOrganization") : depth0), depth0)) != null ? stack1 : "") + "</pre></div>    </div>"; }, "24": function (container, depth0, helpers, partials, data) { var stack1, lookupProperty = container.lookupProperty || function (parent, propertyName) { if (Object.prototype.hasOwnProperty.call(parent, propertyName)) { return parent[propertyName]; } return undefined }; return "    <div class=\"tc-ctl-lcat-info-data\">        <h4 class=\"tc-ctl-lcat-info-data-title\">" + container.escapeExpression(lookupProperty(helpers, "i18n").call(depth0 != null ? depth0 : (container.nullContext || {}), "contactMail", { "name": "i18n", "hash": {}, "data": data, "loc": { "start": { "line": 67, "column": 48 }, "end": { "line": 67, "column": 70 } } })) + "</h4>        <div class=\"tc-ctl-lcat-info-data-content\"><pre>" + ((stack1 = container.lambda((depth0 != null ? lookupProperty(depth0, "contactMail") : depth0), depth0)) != null ? stack1 : "") + "</pre></div>    </div>"; }, "26": function (container, depth0, helpers, partials, data) { var stack1, lookupProperty = container.lookupProperty || function (parent, propertyName) { if (Object.prototype.hasOwnProperty.call(parent, propertyName)) { return parent[propertyName]; } return undefined }; return "    <div class=\"tc-ctl-lcat-info-data\">        <h4 class=\"tc-ctl-lcat-info-data-title\">" + container.escapeExpression(lookupProperty(helpers, "i18n").call(depth0 != null ? depth0 : (container.nullContext || {}), "contactTelephone", { "name": "i18n", "hash": {}, "data": data, "loc": { "start": { "line": 73, "column": 48 }, "end": { "line": 73, "column": 75 } } })) + "</h4>        <div class=\"tc-ctl-lcat-info-data-content\"><pre>" + ((stack1 = container.lambda((depth0 != null ? lookupProperty(depth0, "contactTelephone") : depth0), depth0)) != null ? stack1 : "") + "</pre></div>    </div>"; }, "28": function (container, depth0, helpers, partials, data) { var stack1, lookupProperty = container.lookupProperty || function (parent, propertyName) { if (Object.prototype.hasOwnProperty.call(parent, propertyName)) { return parent[propertyName]; } return undefined }; return "    <div class=\"tc-ctl-lcat-info-data\">        <h4 class=\"tc-ctl-lcat-info-data-title\">" + container.escapeExpression(lookupProperty(helpers, "i18n").call(depth0 != null ? depth0 : (container.nullContext || {}), "fees", { "name": "i18n", "hash": {}, "data": data, "loc": { "start": { "line": 79, "column": 48 }, "end": { "line": 79, "column": 63 } } })) + "</h4>        <div class=\"tc-ctl-lcat-info-data-content\"><pre>" + ((stack1 = container.lambda((depth0 != null ? lookupProperty(depth0, "fees") : depth0), depth0)) != null ? stack1 : "") + "</pre></div>    </div>"; }, "30": function (container, depth0, helpers, partials, data) { var stack1, lookupProperty = container.lookupProperty || function (parent, propertyName) { if (Object.prototype.hasOwnProperty.call(parent, propertyName)) { return parent[propertyName]; } return undefined }; return "    <div class=\"tc-ctl-lcat-info-data\">        <h4 class=\"tc-ctl-lcat-info-data-title\">" + container.escapeExpression(lookupProperty(helpers, "i18n").call(depth0 != null ? depth0 : (container.nullContext || {}), "accessConstraints", { "name": "i18n", "hash": {}, "data": data, "loc": { "start": { "line": 85, "column": 48 }, "end": { "line": 85, "column": 76 } } })) + "</h4>        <div class=\"tc-ctl-lcat-info-data-content\"><pre>" + ((stack1 = container.lambda((depth0 != null ? lookupProperty(depth0, "accessConstraints") : depth0), depth0)) != null ? stack1 : "") + "</pre></div>    </div>"; }, "compiler": [8, ">= 4.3.0"], "main": function (container, depth0, helpers, partials, data) { var stack1, alias1 = depth0 != null ? depth0 : (container.nullContext || {}), alias2 = container.escapeExpression, lookupProperty = container.lookupProperty || function (parent, propertyName) { if (Object.prototype.hasOwnProperty.call(parent, propertyName)) { return parent[propertyName]; } return undefined }; return "<a class=\"tc-ctl-lcat-info-close\"></a><h2>" + alias2(lookupProperty(helpers, "i18n").call(alias1, "layerInfo", { "name": "i18n", "hash": {}, "data": data, "loc": { "start": { "line": 2, "column": 4 }, "end": { "line": 2, "column": 24 } } })) + "</h2><div><h3 class=\"tc-ctl-lcat-title test\">" + alias2(container.lambda((depth0 != null ? lookupProperty(depth0, "title") : depth0), depth0)) + "</h3></div><div class=\"tc-ctl-lcat-info-content\">" + ((stack1 = lookupProperty(helpers, "if").call(alias1, (depth0 != null ? lookupProperty(depth0, "name") : depth0), { "name": "if", "hash": {}, "fn": container.program(1, data, 0), "inverse": container.noop, "data": data, "loc": { "start": { "line": 5, "column": 4 }, "end": { "line": 14, "column": 11 } } })) != null ? stack1 : "") + ((stack1 = lookupProperty(helpers, "if").call(alias1, (depth0 != null ? lookupProperty(depth0, "metadata") : depth0), { "name": "if", "hash": {}, "fn": container.program(6, data, 0), "inverse": container.noop, "data": data, "loc": { "start": { "line": 15, "column": 4 }, "end": { "line": 22, "column": 11 } } })) != null ? stack1 : "") + ((stack1 = lookupProperty(helpers, "if").call(alias1, (depth0 != null ? lookupProperty(depth0, "dataUrl") : depth0), { "name": "if", "hash": {}, "fn": container.program(9, data, 0), "inverse": container.noop, "data": data, "loc": { "start": { "line": 23, "column": 4 }, "end": { "line": 30, "column": 11 } } })) != null ? stack1 : "") + ((stack1 = lookupProperty(helpers, "if").call(alias1, (depth0 != null ? lookupProperty(depth0, "url") : depth0), { "name": "if", "hash": {}, "fn": container.program(11, data, 0), "inverse": container.noop, "data": data, "loc": { "start": { "line": 31, "column": 4 }, "end": { "line": 36, "column": 11 } } })) != null ? stack1 : "") + ((stack1 = lookupProperty(helpers, "if").call(alias1, (depth0 != null ? lookupProperty(depth0, "abstract") : depth0), { "name": "if", "hash": {}, "fn": container.program(13, data, 0), "inverse": container.noop, "data": data, "loc": { "start": { "line": 37, "column": 4 }, "end": { "line": 46, "column": 11 } } })) != null ? stack1 : "") + ((stack1 = lookupProperty(helpers, "if").call(alias1, (depth0 != null ? lookupProperty(depth0, "parentAbstract") : depth0), { "name": "if", "hash": {}, "fn": container.program(18, data, 0), "inverse": container.noop, "data": data, "loc": { "start": { "line": 47, "column": 4 }, "end": { "line": 52, "column": 11 } } })) != null ? stack1 : "") + ((stack1 = lookupProperty(helpers, "if").call(alias1, (depth0 != null ? lookupProperty(depth0, "contactPerson") : depth0), { "name": "if", "hash": {}, "fn": container.program(20, data, 0), "inverse": container.noop, "data": data, "loc": { "start": { "line": 53, "column": 4 }, "end": { "line": 58, "column": 11 } } })) != null ? stack1 : "") + ((stack1 = lookupProperty(helpers, "if").call(alias1, (depth0 != null ? lookupProperty(depth0, "contactOrganization") : depth0), { "name": "if", "hash": {}, "fn": container.program(22, data, 0), "inverse": container.noop, "data": data, "loc": { "start": { "line": 59, "column": 4 }, "end": { "line": 64, "column": 11 } } })) != null ? stack1 : "") + ((stack1 = lookupProperty(helpers, "if").call(alias1, (depth0 != null ? lookupProperty(depth0, "contactMail") : depth0), { "name": "if", "hash": {}, "fn": container.program(24, data, 0), "inverse": container.noop, "data": data, "loc": { "start": { "line": 65, "column": 4 }, "end": { "line": 70, "column": 11 } } })) != null ? stack1 : "") + ((stack1 = lookupProperty(helpers, "if").call(alias1, (depth0 != null ? lookupProperty(depth0, "contactTelephone") : depth0), { "name": "if", "hash": {}, "fn": container.program(26, data, 0), "inverse": container.noop, "data": data, "loc": { "start": { "line": 71, "column": 4 }, "end": { "line": 76, "column": 11 } } })) != null ? stack1 : "") + ((stack1 = lookupProperty(helpers, "if").call(alias1, (depth0 != null ? lookupProperty(depth0, "fees") : depth0), { "name": "if", "hash": {}, "fn": container.program(28, data, 0), "inverse": container.noop, "data": data, "loc": { "start": { "line": 77, "column": 4 }, "end": { "line": 82, "column": 11 } } })) != null ? stack1 : "") + ((stack1 = lookupProperty(helpers, "if").call(alias1, (depth0 != null ? lookupProperty(depth0, "accessConstraints") : depth0), { "name": "if", "hash": {}, "fn": container.program(30, data, 0), "inverse": container.noop, "data": data, "loc": { "start": { "line": 83, "column": 4 }, "end": { "line": 88, "column": 11 } } })) != null ? stack1 : "") + "</div>"; }, "useData": true };
        _ctl.template[_ctl.CLASS + '-results'] = TC.isDebug ? "patch/templates/LayerCatalogResultsSilme.hbs" : { "1": function (container, depth0, helpers, partials, data, blockParams, depths) { var stack1, alias1 = depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function (parent, propertyName) { if (Object.prototype.hasOwnProperty.call(parent, propertyName)) { return parent[propertyName]; } return undefined }; return ((stack1 = lookupProperty(helpers, "if").call(alias1, lookupProperty(helpers, "gt").call(alias1, (depths[1] != null ? lookupProperty(depths[1], "servicesLooked") : depths[1]), 1, { "name": "gt", "hash": {}, "data": data, "loc": { "start": { "line": 2, "column": 6 }, "end": { "line": 2, "column": 30 } } }), { "name": "if", "hash": {}, "fn": container.program(2, data, 0, blockParams, depths), "inverse": container.noop, "data": data, "loc": { "start": { "line": 2, "column": 0 }, "end": { "line": 5, "column": 15 } } })) != null ? stack1 : "") + ((stack1 = lookupProperty(helpers, "each").call(alias1, (depth0 != null ? lookupProperty(depth0, "founds") : depth0), { "name": "each", "hash": {}, "fn": container.program(5, data, 0, blockParams, depths), "inverse": container.noop, "data": data, "loc": { "start": { "line": 6, "column": 8 }, "end": { "line": 11, "column": 17 } } })) != null ? stack1 : "") + ((stack1 = lookupProperty(helpers, "if").call(alias1, lookupProperty(helpers, "gt").call(alias1, (depths[1] != null ? lookupProperty(depths[1], "servicesLooked") : depths[1]), 1, { "name": "gt", "hash": {}, "data": data, "loc": { "start": { "line": 12, "column": 14 }, "end": { "line": 12, "column": 38 } } }), { "name": "if", "hash": {}, "fn": container.program(12, data, 0, blockParams, depths), "inverse": container.noop, "data": data, "loc": { "start": { "line": 12, "column": 8 }, "end": { "line": 15, "column": 7 } } })) != null ? stack1 : ""); }, "2": function (container, depth0, helpers, partials, data) { var stack1, alias1 = container.lambda, alias2 = container.escapeExpression, lookupProperty = container.lookupProperty || function (parent, propertyName) { if (Object.prototype.hasOwnProperty.call(parent, propertyName)) { return parent[propertyName]; } return undefined }; return "<li class=\"tc-ctl-lcat-search-group " + ((stack1 = lookupProperty(helpers, "if").call(depth0 != null ? depth0 : (container.nullContext || {}), ((stack1 = (depth0 != null ? lookupProperty(depth0, "service") : depth0)) != null ? lookupProperty(stack1, "isCollapsed") : stack1), { "name": "if", "hash": {}, "fn": container.program(3, data, 0), "inverse": container.noop, "data": data, "loc": { "start": { "line": 3, "column": 36 }, "end": { "line": 3, "column": 82 } } })) != null ? stack1 : "") + "\" data-service-id=\"" + alias2(alias1(((stack1 = (depth0 != null ? lookupProperty(depth0, "service") : depth0)) != null ? lookupProperty(stack1, "id") : stack1), depth0)) + "\">    <h5>" + alias2(alias1(((stack1 = (depth0 != null ? lookupProperty(depth0, "service") : depth0)) != null ? lookupProperty(stack1, "title") : stack1), depth0)) + "</h5><ul>"; }, "3": function (container, depth0, helpers, partials, data) { return "tc-collapsed"; }, "5": function (container, depth0, helpers, partials, data) { var stack1, alias1 = container.lambda, alias2 = container.escapeExpression, alias3 = depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function (parent, propertyName) { if (Object.prototype.hasOwnProperty.call(parent, propertyName)) { return parent[propertyName]; } return undefined }; return "        <li data-layer-name=\"" + alias2(alias1((depth0 != null ? lookupProperty(depth0, "Name") : depth0), depth0)) + "\" " + ((stack1 = lookupProperty(helpers, "if").call(alias3, (depth0 != null ? lookupProperty(depth0, "alreadyAdded") : depth0), { "name": "if", "hash": {}, "fn": container.program(6, data, 0), "inverse": container.noop, "data": data, "loc": { "start": { "line": 7, "column": 39 }, "end": { "line": 7, "column": 86 } } })) != null ? stack1 : "") + " " + ((stack1 = lookupProperty(helpers, "if").call(alias3, (depth0 != null ? lookupProperty(depth0, "layer") : depth0), { "name": "if", "hash": {}, "fn": container.program(8, data, 0), "inverse": container.noop, "data": data, "loc": { "start": { "line": 7, "column": 87 }, "end": { "line": 7, "column": 135 } } })) != null ? stack1 : "") + ">            <h5 class=\"tc-selectable\" " + ((stack1 = lookupProperty(helpers, "if").call(alias3, (depth0 != null ? lookupProperty(depth0, "alreadyAdded") : depth0), { "name": "if", "hash": {}, "fn": container.program(10, data, 0), "inverse": container.noop, "data": data, "loc": { "start": { "line": 8, "column": 38 }, "end": { "line": 8, "column": 140 } } })) != null ? stack1 : "") + ">" + alias2(alias1((depth0 != null ? lookupProperty(depth0, "Title") : depth0), depth0)) + "</h5>            <button class=\"tc-ctl-lcat-search-btn-info\" title=\"" + alias2(lookupProperty(helpers, "i18n").call(alias3, "infoFromThisLayer", { "name": "i18n", "hash": {}, "data": data, "loc": { "start": { "line": 9, "column": 63 }, "end": { "line": 9, "column": 92 } } })) + "\"></button>        </li>"; }, "6": function (container, depth0, helpers, partials, data) { return " class=\"tc-checked\" "; }, "8": function (container, depth0, helpers, partials, data) { return " style=\"background:#e4e6d0\" "; }, "10": function (container, depth0, helpers, partials, data) { var alias1 = depth0 != null ? depth0 : (container.nullContext || {}), alias2 = container.escapeExpression, lookupProperty = container.lookupProperty || function (parent, propertyName) { if (Object.prototype.hasOwnProperty.call(parent, propertyName)) { return parent[propertyName]; } return undefined }; return " data-tooltip=\"" + alias2(lookupProperty(helpers, "i18n").call(alias1, "layerAlreadyAdded", { "name": "i18n", "hash": {}, "data": data, "loc": { "start": { "line": 8, "column": 73 }, "end": { "line": 8, "column": 102 } } })) + "\" " + alias2(lookupProperty(helpers, "i18n").call(alias1, "clickToAddToMap", { "name": "i18n", "hash": {}, "data": data, "loc": { "start": { "line": 8, "column": 104 }, "end": { "line": 8, "column": 131 } } })) + "\" "; }, "12": function (container, depth0, helpers, partials, data) { return "    </ul></li>"; }, "14": function (container, depth0, helpers, partials, data) { var lookupProperty = container.lookupProperty || function (parent, propertyName) { if (Object.prototype.hasOwnProperty.call(parent, propertyName)) { return parent[propertyName]; } return undefined }; return "<li class=\"tc-ctl-lcat-no-results\"><h5>" + container.escapeExpression(lookupProperty(helpers, "i18n").call(depth0 != null ? depth0 : (container.nullContext || {}), "noMatches", { "name": "i18n", "hash": {}, "data": data, "loc": { "start": { "line": 17, "column": 39 }, "end": { "line": 17, "column": 60 } } })) + "</h5></li>"; }, "compiler": [8, ">= 4.3.0"], "main": function (container, depth0, helpers, partials, data, blockParams, depths) { var stack1, lookupProperty = container.lookupProperty || function (parent, propertyName) { if (Object.prototype.hasOwnProperty.call(parent, propertyName)) { return parent[propertyName]; } return undefined }; return "" + ((stack1 = lookupProperty(helpers, "each").call(depth0 != null ? depth0 : (container.nullContext || {}), (depth0 != null ? lookupProperty(depth0, "servicesFound") : depth0), { "name": "each", "hash": {}, "fn": container.program(1, data, 0, blockParams, depths), "inverse": container.program(14, data, 0, blockParams, depths), "data": data, "loc": { "start": { "line": 1, "column": 1 }, "end": { "line": 18, "column": 9 } } })) != null ? stack1 : ""); }, "useData": true, "useDepths": true };
        _ctl.template[_ctl.CLASS + '-proj'] = TC.isDebug ? "patch/templates/LayerCatalogProjSilme.hbs" : { "1": function (container, depth0, helpers, partials, data) { var stack1, alias1 = container.lambda, alias2 = container.escapeExpression, alias3 = depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function (parent, propertyName) { if (Object.prototype.hasOwnProperty.call(parent, propertyName)) { return parent[propertyName]; } return undefined }; return "        <li class=\"tc-ctl-proj-branch\">            <label id=\"" + alias2(alias1((depth0 != null ? lookupProperty(depth0, "id") : depth0), depth0)) + "\" class=\"tc-ctl-lcat-proj-topic\" title=\"" + alias2(alias1((depth0 != null ? lookupProperty(depth0, "tooltip") : depth0), depth0)) + "\" " + ((stack1 = lookupProperty(helpers, "if").call(alias3, (depth0 != null ? lookupProperty(depth0, "thumbnail") : depth0), { "name": "if", "hash": {}, "fn": container.program(2, data, 0), "inverse": container.noop, "data": data, "loc": { "start": { "line": 10, "column": 82 }, "end": { "line": 10, "column": 151 } } })) != null ? stack1 : "") + ">                " + ((stack1 = lookupProperty(helpers, "if").call(alias3, (depth0 != null ? lookupProperty(depth0, "tooltip") : depth0), { "name": "if", "hash": {}, "fn": container.program(4, data, 0), "inverse": container.noop, "data": data, "loc": { "start": { "line": 11, "column": 16 }, "end": { "line": 11, "column": 101 } } })) != null ? stack1 : "") + "                <span class=\"tc-ctl-lcat-proj-topic-name\">" + alias2(alias1((depth0 != null ? lookupProperty(depth0, "name") : depth0), depth0)) + "</span>            </label>        </li>"; }, "2": function (container, depth0, helpers, partials, data) { var lookupProperty = container.lookupProperty || function (parent, propertyName) { if (Object.prototype.hasOwnProperty.call(parent, propertyName)) { return parent[propertyName]; } return undefined }; return " style=\"background-image:url(" + container.escapeExpression(container.lambda((depth0 != null ? lookupProperty(depth0, "thumbnail") : depth0), depth0)) + ")\" "; }, "4": function (container, depth0, helpers, partials, data) { var lookupProperty = container.lookupProperty || function (parent, propertyName) { if (Object.prototype.hasOwnProperty.call(parent, propertyName)) { return parent[propertyName]; } return undefined }; return "<span class=\"tc-ctl-lcat-proj-topic-tooltip\">" + container.escapeExpression(container.lambda((depth0 != null ? lookupProperty(depth0, "tooltip") : depth0), depth0)) + "</span>"; }, "compiler": [8, ">= 4.3.0"], "main": function (container, depth0, helpers, partials, data) { var stack1, alias1 = depth0 != null ? depth0 : (container.nullContext || {}), alias2 = container.escapeExpression, lookupProperty = container.lookupProperty || function (parent, propertyName) { if (Object.prototype.hasOwnProperty.call(parent, propertyName)) { return parent[propertyName]; } return undefined }; return "<a class=\"tc-ctl-lcat-proj-window\"></a><a class=\"tc-ctl-lcat-proj-close\"></a><h3>" + alias2(lookupProperty(helpers, "i18n").call(alias1, "changeTopic", { "name": "i18n", "hash": {}, "data": data, "loc": { "start": { "line": 3, "column": 4 }, "end": { "line": 3, "column": 26 } } })) + "</h3><div><h4 class=\"tc-ctl-lcat-title\">" + alias2(container.lambda((depth0 != null ? lookupProperty(depth0, "title") : depth0), depth0)) + "</h4></div><div class=\"tc-ctl-lcat-proj-content\">    <div class=\"tc-ctl-lcat-proj-subtitle\">" + alias2(lookupProperty(helpers, "i18n").call(alias1, "projSubtitle", { "name": "i18n", "hash": {}, "data": data, "loc": { "start": { "line": 6, "column": 43 }, "end": { "line": 6, "column": 66 } } })) + "</div>    <ul class=\"tc-ctl-lcat-proj-childs\">" + ((stack1 = lookupProperty(helpers, "each").call(alias1, (depth0 != null ? lookupProperty(depth0, "projs") : depth0), { "name": "each", "hash": {}, "fn": container.program(1, data, 0), "inverse": container.noop, "data": data, "loc": { "start": { "line": 8, "column": 8 }, "end": { "line": 15, "column": 17 } } })) != null ? stack1 : "") + "    </ul></div><a class=\"tc-ctl-lcat-footer\" href=\"https://ide.cime.es/sitmun\" target=\"_blank\">    <div class=\"tc-ctl-lcat-footer-img\"></div>    <div class=\"tc-ctl-lcat-footer-text\">" + alias2(lookupProperty(helpers, "i18n").call(alias1, "restrictedAccess", { "name": "i18n", "hash": {}, "data": data, "loc": { "start": { "line": 20, "column": 41 }, "end": { "line": 20, "column": 68 } } })) + "</div></a>"; }, "useData": true };

        const result = TC.control.LayerCatalog.prototype.register.call(_ctl, map);

        map
            .on(TC.Consts.event.LAYERADD + ' ' + TC.Consts.event.UPDATEPARAMS, function (e) {
                // MV 20221006 - Cercam dins els layers del capabilities
                CercaLayerDinsCapabilities(e);

                const layer = e.layer;
                if (!layer.isBase && layer.type === TC.Consts.layerType.WMS) {

                    _ctl.loaded().then(function () { // Esperamos a que cargue primero las capas de la configuración

                        if (_ctl.getLayerRootNode(layer)) {
                            updateControl.call(_ctl, layer);
                        }
                        else {
                            // la capa no está renderizada, pero podría estar en proceso, comprobamos que no está en la lista de capas del control
                            var layerAlreadyAdded = false;
                            for (var i = 0, len = _ctl.layers.length; i < len; i++) {
                                var lyr = _ctl.layers[i];
                                if (lyr.type === layer.type && lyr.options.url === layer.options.url) {
                                    layerAlreadyAdded = true;
                                    break;
                                }
                            }

                            // 12/03/2019 GLS la capa forma parte de los servicios configurados pero el nodo aún no se ha cargado, la guardamos
                            if (layerAlreadyAdded) {
                                if (!_ctl.layersToSetChecked) {
                                    _ctl.layersToSetChecked = [];
                                }

                                _ctl.layersToSetChecked.push(layer);
                            } else {
                                _ctl.addLayer(new TC.layer.Raster({
                                    url: layer.options.url,
                                    type: layer.type,
                                    layerNames: [],
                                    title: layer.title || layer.wrap.getServiceTitle(),
                                    hideTitle: true,
                                    hideTree: false
                                })).then(function () {
                                    updateControl.call(_ctl, layer);
                                });
                            }
                        }
                    });
                }
            })
            .on(TC.Consts.event.EXTERNALSERVICEADDED, function (e) {
                if (e && e.layer) {
                    _ctl.addLayer(e.layer);
                    _ctl.div.classList.remove(TC.Consts.classes.COLLAPSED);
                }
            });

        getInstance = function () {
            return _ctl;
        }

        silmeLayerCatalog = this;//Silme

        return result;
    };

    TC.control.LayerCatalogSilme.prototype.renderBranch = function (layer, callback, promiseRenderResolve) {
        const self = this;

        self.sourceLayers.unshift(layer);
        layer.getCapabilitiesPromise()
            .then(function (result) {

                //self.sourceLayers.push(layer);

                self.getRenderedHtml(self.CLASS + '-branch', getLayerTree(this), function (html) {
                    var template = document.createElement('template');
                    template.innerHTML = html;

                    var newChild = template.content ? template.content.firstChild : template.firstChild;
                    var oldChild = self.div.querySelector('.' + self.CLASS + '-branch').querySelector('li.' + self.CLASS + '-loading-node[data-layer-id="' + this.id + '"]');

                    if (oldChild) {
                        self.div.querySelector('.' + self.CLASS + '-branch').replaceChild(newChild, oldChild);
                    } else {
                        self.div.querySelector('.' + self.CLASS + '-branch').appendChild(newChild);
                    }

                    addLogicToNode.call(self, newChild, this);

                    if (self.div.querySelector('.' + self.CLASS + '-branch').childElementCount === 1) {
                        promiseRenderResolve();
                    }

                    if (TC.Util.isFunction(callback)) {
                        // pasamos el callback el item
                        callback(self.sourceLayers[self.sourceLayers.map(function (l) { return l.id }).indexOf(this.id)]);
                    }

                }.bind(this));

            }.bind(layer))
            .catch(function (error) {
                /*
                var index = self.layers.map(function (l) { return l.id }).indexOf(this.id);
                self.layers.splice(index, 1);

                var errorMessage = self.getLocaleString("lyrCtlg.errorLoadingNode", { serviceName: this.title });
                var liError = self.div.querySelector('.' + self.CLASS + '-branch').querySelector('li.' + self.CLASS + '-loading-node[data-layer-id="' + this.id + '"]');
                liError.classList.add('error');
                liError.setAttribute('title', errorMessage);

                self.map.toast(errorMessage, { type: TC.Consts.msgType.ERROR });
                */
            }.bind(layer));
    };

    TC.control.LayerCatalogSilme.prototype.render = function (callback) {
        const self = this;

        return self._set1stRenderPromise(new Promise(function (resolve, reject) {
            const promises = self.layers.map(function (layer) {
                return layer.wrap.getLayer();
            })
            Promise.all(promises).then(function () {//SILME 20210419
                //Tot ok, no fem res
            }, function (reject) {
                //si entram aquí és perque un servei (o més d'un) han fallat.

                //lo que fem és treure les capes que no tenen capabilities associat, o sigui,
                //que la promesa no s'ha complert

                //la resa de codi es igual que si no hagués fallat cap promise
                //hauriem de veure si es pot eliminar codi redundant o fer una funció que s'executi després, hagi fallat o no (HERE)
                for (var i = 0; i < self.layers.length; i++) {
                    if (self.layers[i].capabilities == undefined) {
                        self.map.toast(self.getLocaleString('errorCarregarCapa') + self.layers[i].title, { type: TC.Consts.msgType.ERROR });
                        self.layers.splice(i, 1);
                        i--;
                    }

                }
            }).then(function () {
                //Si totes les capes estan OK passem aquí directament, sino eliminem les que no estàn bé de l'arbre de capes i després passem aquí
                var layerTrees = self.layers.map(function (layer) {
                    var result = layer.getTree();
                    layer.tree = result;//mv
                    var makeNodeVisible = function makeNodeVisible(node) {
                        var result = false;
                        var childrenVisible = false;
                        for (var i = 0; i < node.children.length; i++) {
                            if (makeNodeVisible(node.children[i])) {
                                childrenVisible = true;
                            }
                        }
                        if (node.hasOwnProperty('isVisible')) {
                            node.isVisible = (!layer.names || !layer.names.length) || childrenVisible || node.isVisible;
                        }
                        return node.isVisible;
                    };
                    makeNodeVisible(result);
                    return result;
                });

                layerTrees.forEach(function (item) {
                    var layer = self.layers.find(function (layer) {
                        return item.title === layer.title
                    });
                });

                realTree.children = new Array();

                TC.control.LayerCatalog.prototype.render.call(self, function () {

                    const getLayerTree = function (layer) {
                        if (layer.tree == null) {
                            for (var i = 0; i < layer.children.length; i++) {
                                var resultChild = layer.children[i].getTree();
                                resultChild.id = layer.children[i].id;
                                var makeNodeVisible = function makeNodeVisible(node) {
                                    var result = false;
                                    var childrenVisible = false;
                                    for (var k = 0; k < node.children.length; k++) {
                                        if (makeNodeVisible(node.children[k])) {
                                            childrenVisible = true;
                                        }
                                        //node.children[i].parentGroupNode = layer.parentGroupNode;//Silme
                                    }
                                    if (node.hasOwnProperty('isVisible')) {
                                        node.isVisible = (!layer.children[i].names || !layer.children[i].names.length) || childrenVisible || node.isVisible;
                                    }
                                    return node.isVisible;
                                };
                                makeNodeVisible(resultChild)
                                layer.children[i] = resultChild;
                            }
                            return layer;
                        } else {
                            var result = layer.getTree();
                            var makeNodeVisible = function makeNodeVisible(node) {
                                var result = false;
                                var childrenVisible = false;
                                for (var i = 0; i < node.children.length; i++) {
                                    if (makeNodeVisible(node.children[i])) {
                                        childrenVisible = true;
                                    }
                                    //node.children[i].parentGroupNode = layer.parentGroupNode;//Silme
                                }
                                if (node.hasOwnProperty('isVisible')) {
                                    node.isVisible = (!layer.names || !layer.names.length) || childrenVisible || node.isVisible;
                                }
                                return node.isVisible;
                            };
                            makeNodeVisible(result);
                        }
                        //result.parentGroupNode = layer.parentGroupNode;
                        return result;
                    };

                    //Passa per aquí cada vegada que renderitza un control, i volem que carregui el nostre arbre quan tots hagin acabat de carregar
                    //if ($('.tc-ctl-lcat-tree').find('.tc-ctl-lcat-loading-node').length == 0 && $('.tc-ctl-lcat-tree').find('.tc-ctl-lcat-node-silme').length != 0) {

                    if (!self.div.querySelector('.tc-ctl-lcat-tree').querySelector('.tc-ctl-lcat-loading-node') && !!self.div.querySelector('.tc-ctl-lcat-tree').querySelector('.tc-ctl-lcat-node')) {
                        //if ($('.tc-ctl-lcat-tree').find('.tc-ctl-lcat-loading-node').length == 0 && $('.tc-ctl-lcat-tree').find('.tc-ctl-lcat-node').length != 0) {
                        var catalog = SITNA.Cfg.controls.layerCatalogSilme;
                        for (var i = 0; i < treeLayers.length; i++) {
                            for (var k = 0; k < catalog.layerTreeGroups.length; k++) {
                                if (catalog.layerTreeGroups[k].id == treeLayers[i].parentGroupNode) {
                                    if (isEmpty(realTree.children.filter(e => e.id === catalog.layerTreeGroups[k].id))) {
                                        realTree.children.push(catalog.layerTreeGroups[k]);
                                        realTree.children.filter(e => e.id === catalog.layerTreeGroups[k].id)[0].children = new Array();
                                        treeLayers[i].children = treeLayers[i].getTree().children;
                                        realTree.children.filter(e => e.id === catalog.layerTreeGroups[k].id)[0].children.push(treeLayers[i]);
                                    } else {
                                        treeLayers[i].children = treeLayers[i].getTree().children;
                                        realTree.children.filter(e => e.id === catalog.layerTreeGroups[k].id)[0].children.push(treeLayers[i]);
                                    }
                                }
                            }
                        }

                        self.div.querySelector('.tc-ctl-lcat-tree').querySelector('.tc-ctl-lcat-branch').innerHTML = "";

                        for (var i = 0; i < realTree.children.length; i++) {
                            //Hem d'agafar lo mateix que al LayerCatalog self.getLayerTree(self.layers[0])
                            selfClass.getRenderedHtml(self.CLASS + '-node', getLayerTree(realTree.children[i]), function (html) {
                                var template = document.createElement('template');
                                template.innerHTML = html;

                                var newChild = template.content ? template.content.firstChild : template.firstChild;

                                if (self.div.querySelector('#' + newChild.id) == null)//no existeix
                                {
                                    self.div.querySelector('.' + self.CLASS + '-branch').appendChild(newChild);
                                }

                                for (var i = 0; i < newChild.children[2].children.length; i++) {
                                    //var layer = self.getLayer(newChild.children[2].children[i].id);
                                    var layer = self.getLayer(newChild.children[2].children[i].id);
                                    addLogicToNode.call(self, newChild.children[2].children[i], layer);
                                }
                                addLogicToTreeGroup.call(self, newChild);
                            });
                        }

                        //self.div.querySelector('.tc-ctl-lcat-branch').children[0].classList.remove(TC.Consts.classes.COLLAPSED);//Desplegam el primer node
                        //self.div.querySelector('.tc-ctl-lcat-branch').querySelector('.tc-ctl-lcat-branch').classList.remove(TC.Consts.classes.COLLAPSED);

                        callback(self.sourceLayers[self.sourceLayers.map(function (l) { return l.id }).indexOf(this.id)]);
                    }

                    resolve();
                });

                selfClass = self;

            }, function () {

            }).then(function () {

                if (treeLayers.length > 0)
                    layerCatalogCarregat();

            });


            treeLayers = self.layers;
        }));
    };

    /*TC.control.LayerCatalogSilme.prototype.getRenderedHtml = function (templateId, data, callback) {
        var _ctl = this;
        const result = TC.control.LayerCatalog.prototype.getRenderedHtml.call(_ctl, templateId, data, callback);
    };*/

    const addLogicToNode = function (node, layer) {
        const self = this;

        /*Açò ho feim a addLogicToTreeGroup
        node.querySelectorAll('li > button.' + self.CLASS + '-collapse-btn').forEach(function (btn) {
            btn.addEventListener('click', onCollapseButtonClick);
        });

        node.querySelectorAll('span').forEach(function (span) {
            span.addEventListener('click', function (e) {
                onSpanClick(e, self);
            });
        });
        */

        self._roots = self.div.querySelectorAll(self._selectors.LAYER_ROOT);

        //node.dataset.layerId = layer.id;

        //Silme - important per identificar els roots
        for (var i = 0; i < self._roots.length; i++) {
            self._roots[i].dataset.layerId = self._roots[i].id;
        }

        var formatDescriptions = {};
        node.querySelectorAll('.' + self.CLASS + '-btn-info').forEach(function (a) {
            const span = a.parentElement.querySelector('span');
            const name = a.parentElement.dataset.layerName;
            var uid = a.parentElement.dataset.layerUid;//Silme MV
            var info;
            if (name) {
                span.classList.add(TC.Consts.classes.SELECTABLE);
                //var info = layer.wrap.getInfo(name);
                //var info = getInfo(name, layer.wrap);
                //Silme
                for (var i = 0; i < self.layers.length; i++) {
                    layerFound = cercaLayers(self.layers[i], uid);
                    if (layerFound != null) {
                        layerParent = self.layers[i];
                        break;
                    }
                }
                if (layerParent != null)
                    info = getInfo(name, layerParent.wrap);
                //End silme
                if (!info.hasOwnProperty('abstract') && !info.hasOwnProperty('legend') && !info.hasOwnProperty('metadata')) {
                    a.parentElement.removeChild(a);
                }
                else {
                    a.addEventListener(TC.Consts.event.CLICK, function (e) {
                        const a = e.target;
                        var li = a;
                        do {
                            li = li.parentElement;
                        }
                        while (li && li.tagName !== 'LI');

                        e.stopPropagation();
                        const elm = this;
                        var uid = elm.parentElement.dataset.layerUid;//Silme
                        if (elm.classList.toggle(TC.Consts.classes.CHECKED)) {
                            showLayerInfo.call(self, layer, name, uid, li);
                        } else {
                            self.hideLayerInfo();
                        }
                    });
                }
                if (layer.compatibleLayers && layer.compatibleLayers.indexOf(name) < 0) {
                    span.classList.add(TC.Consts.classes.INCOMPATIBLE);
                    span.setAttribute('title', self.getLocaleString('reprojectionNeeded'));
                    //console.log("capa " + name + " incompatible");
                }
                if (self.map) {
                    for (var j = 0, len = self.map.workLayers.length; j < len; j++) {
                        var wl = self.map.workLayers[j];
                        if (wl.type === TC.Consts.layerType.WMS && wl.url === layer.url && wl.names.length === 1 && wl.names[0] === name) {
                            span.parentElement.classList.add(TC.Consts.classes.CHECKED);
                            span.dataset.tooltip = self.getLocaleString('layerAlreadyAdded');
                        }
                    }
                }
            }
            else {
                span.dataset.tooltip = '';
                a.parentElement.removeChild(a);
            }
        });
    };

    const addLogicToTreeGroup = function (node) {
        const self = this;

        node.querySelectorAll('li > button.' + self.CLASS + '-collapse-btn').forEach(function (btn) {
            btn.addEventListener('click', onCollapseButtonClick);
        });

        node.querySelectorAll('li > span').forEach(function (span) {
            span.addEventListener('click', onCollapseButtonClick);
        });

        node.querySelectorAll('span').forEach(function (span) {
            span.addEventListener('click', function (e) {
                onSpanClick(e, self);
            });
        });
    };

    const onCollapseButtonClick = function (e) {
        e.target.blur();
        e.stopPropagation();
        const li = e.target.parentElement;
        if (li.tagName === 'LI' && !li.classList.contains(self.CLASS + '-leaf') && li.querySelector('ul')) {
            li.classList.toggle(TC.Consts.classes.COLLAPSED);
            const ul = li.querySelector('ul');
            ul.classList.toggle(TC.Consts.classes.COLLAPSED);
        }
    };

    const onSpanClick = function (e, ctl) {
        if (e.target.classList.contains(SITNA.Consts.classes.SELECTABLE)) {
            const li = e.target.parentNode;
            if (!li.classList.contains(TC.Consts.classes.LOADING) && !li.classList.contains(TC.Consts.classes.CHECKED)) {
                e.preventDefault;

                if (li.tagName === 'UL' && !li.classList.contains(self.CLASS + '-leaf')) {
                    li.classList.toggle(TC.Consts.classes.COLLAPSED);
                    const ul = li.querySelector('ul');
                    ul.classList.toggle(TC.Consts.classes.COLLAPSED);
                }

                var layerName = li.dataset.layerName;
                layerName = (layerName !== undefined) ? layerName.toString() : '';
                var layer;
                for (var i = 0, len = ctl._roots.length; i < len; i++) {
                    const root = ctl._roots[i];
                    if (root.contains(li)) {
                        //layer = ctl.getLayer(root.dataset.layerId);//rewrite
                        layer = ctl.getLayer(root.id);
                        //layer = root;
                        break;
                    }
                }
                if (!layer) {
                    //layer = ctl.getLayer(root.dataset.layerId);//rewrite
                    layer = ctl.getLayer(root.id);
                }
                if (layer && layerName) {
                    layer.uid = li.dataset.layerUid;
                    var redrawTime = 1;

                    if (/iPad/i.test(navigator.userAgent))
                        redrawTime = 10;
                    else if (TC.Util.detectFirefox())
                        redrawTime = 250;

                    /* intentam anar per layer.dataset.layerName
                    if (!layer.title) {
                        layer.title = layer.getTree().title;
                    }
                    */

                    li.classList.add(TC.Consts.classes.LOADING);
                    li.querySelector('span').dataset.tooltip = '';

                    const reDraw = function (element) {
                        return new Promise(function (resolve, reject) {
                            setTimeout(function () {
                                element.offsetHeight = element.offsetHeight;
                                element.offsetWidth = element.offsetWidth;

                                resolve();
                            }, redrawTime);
                        });
                    };

                    reDraw(li).then(function () {
                        addLayerToMap.call(ctl, layer, layerName);
                    });
                    e.stopPropagation();
                }

            }
        }
    };

    const getLayer = function (id) {
        const self = this;
        for (var i = 0, len = self.layers.length; i < len; i++) {
            const layer = self.layers[i];
            if (layer.id === id) {
                var configLayer = self.options.layers.filter(l => l.id === id);

                if (configLayer.length > 0) {
                    layer.hideTitle = layer.options.hideTitle = configLayer[0].hideTitle;
                } else {
                    layer.hideTitle = layer.options.hideTitle = false;
                }

                return layer;
            }
        }
        return null;
    };

    const getLayerTree = function (layer) {
        var result = layer.getTree();
        var makeNodeVisible = function makeNodeVisible(node) {
            var result = false;
            var childrenVisible = false;
            for (var i = 0; i < node.children.length; i++) {
                if (makeNodeVisible(node.children[i])) {
                    childrenVisible = true;
                }
            }
            if (node.hasOwnProperty('isVisible')) {
                node.isVisible = (!layer.names || !layer.names.length) || childrenVisible || node.isVisible;
            }
            return node.isVisible;
        };
        makeNodeVisible(result);
        return result;
    };

    const getInfo = function (name, layer) {
        var self = layer;
        var result = {};
        var capabilities = self.parent.capabilities;
        var url = self.parent.url;
        if (capabilities && capabilities.Capability) {
            var layerNodes = self.getAllLayerNodes();
            for (var i = 0; i < layerNodes.length; i++) {
                var l = layerNodes[i];
                if (self.parent.compareNames(self.getName(l), name)) {
                    if (l.Title) {
                        result.title = l.Title;
                    }
                    if (l.Abstract) {
                        result['abstract'] = l.Abstract;
                    }
                    //Silme
                    if (l.Name) {
                        if (l.Name.includes(":"))
                            result['name'] = l.Name.substr(l.Name.indexOf(":") + 1);
                        else
                            result['name'] = l.Name;
                    }

                    if (l.Layer) {
                        result.isGroup = true;
                    }
                    //End Silme
                    result.legend = [];

                    var _process = function (value) {
                        var legend = this.getLegend(value);

                        if (legend.src)
                            result.legend.push({
                                src: legend.src, title: value.Title
                            });
                    };

                    var _traverse = function (o, func) {
                        if (o.Layer && o.Layer.length > 0) {
                            for (var i in o.Layer) {
                                //bajar un nivel en el árbol
                                _traverse(o.Layer[i], func);
                            }
                        } else {
                            func.apply(self, [o]);
                        }
                    };

                    //Obtenemos todas las leyendas de la capa o grupo de capas
                    _traverse(l, _process);

                    if (l.MetadataURL && l.MetadataURL.length) {
                        result.metadata = [];
                        for (var j = 0; j < l.MetadataURL.length; j++) {
                            var md = l.MetadataURL[j];
                            result.metadata.push({
                                format: md.Format, type: md.type, url: md.OnlineResource
                            });
                        }
                    }
                    //Silme
                    result.dataUrl = [];
                    if (l.DataURL) {
                        result.dataUrl.push({ format: l.DataURL.Format, type: l.DataURL.OnlineResource.type, url: l.DataURL.OnlineResource.href });
                    }

                    result.parentAbstract = [];
                    if (capabilities.Service.Abstract) {
                        result.parentAbstract = capabilities.Service.Abstract;
                    }

                    result.contactPerson = [];
                    if (capabilities.Service.ContactInformation.ContactPersonPrimary.ContactPerson) {
                        result.contactPerson = capabilities.Service.ContactInformation.ContactPersonPrimary.ContactPerson;
                    }

                    result.contactOrganization = [];
                    if (capabilities.Service.ContactInformation.ContactPersonPrimary.ContactOrganization) {
                        result.contactOrganization = capabilities.Service.ContactInformation.ContactPersonPrimary.ContactOrganization;
                    }

                    result.contactMail = [];
                    if (capabilities.Service.ContactInformation.ContactElectronicMailAddress) {
                        result.contactMail = capabilities.Service.ContactInformation.ContactElectronicMailAddress;
                    }

                    result.contactTelephone = [];
                    if (capabilities.Service.ContactInformation.ContactVoiceTelephone) {
                        result.contactTelephone = capabilities.Service.ContactInformation.ContactVoiceTelephone;
                    }

                    result.fees = [];
                    if (capabilities.Service.Fees) {
                        result.fees = capabilities.Service.Fees;
                    }

                    result.accessConstraints = [];
                    if (capabilities.Service.AccessConstraints) {
                        result.accessConstraints = capabilities.Service.AccessConstraints;
                    }

                    result.url = [];
                    if (url) {
                        result.url = url;
                    }



                    //End silme
                    result.queryable = l.queryable;
                    break;
                }
            }
        }
        return result;
    };

    const showLayerInfo = function (layer, name, uid, li) {
        const self = this;
        var result = null;

        var info = self.div.querySelector('.' + self.CLASS + '-info');
        // Make the DIV element draggable:
        dragElement(info);//Silme
        //Silme - Amb això el DIV de info sempre surtira enmig
        info.style['left'] = null;
        info.style['top'] = null;

        const toggleInfo = function (layerName, infoObj) {
            var result = false;
            //if (lName !== undefined && lName.toString() === layerName) {
            //    info.dataset.layerName = '';
            //    $info.removeClass(TC.Consts.classes.HIDDEN);
            //}
            //else {
            if (infoObj) {
                result = true;
                info.dataset.layerName = layerName;
                info.classList.remove(TC.Consts.classes.HIDDEN);
                self.getRenderedHtml(self.CLASS + '-info', infoObj)
                    .then(function (out) {
                        info.innerHTML = out;
                        info.querySelector('.' + self.CLASS + '-info-close').addEventListener(TC.Consts.event.CLICK, function () {
                            self.hideLayerInfo();
                        }, { passive: true })
                    })
                    .catch(function (err) {
                        TC.error(err);
                    });
            }
            //}
            return result;
        };

        self.div.querySelectorAll('.' + self.CLASS + '-btn-info, .' + self.CLASS + '-search-btn-info').forEach(function (btn) {
            btn.classList.remove(TC.Consts.classes.CHECKED);
        });

        const formatDescriptions = {};
        for (var i = 0, ii = self._roots.length; i < ii; i++) {
            const root = self._roots[i];
            if (root.dataset.layerId.toString() === layer.id.toString()) { //SILME MV 20220211
                const as = root.querySelectorAll('.' + self.CLASS + '-btn-info');
                for (var j = 0, jj = as.length; j < jj; j++) {
                    const a = as[j];
                    var n = a.parentElement.dataset.layerName;
                    if (n === name) {
                        //Silme const info = layer.wrap.getInfo(name);
                        //Silme
                        for (var i = 0; i < self.layers.length; i++) {
                            layerFound = cercaLayers(self.layers[i], uid);
                            if (layerFound != null) {
                                layerParent = self.layers[i];
                                break;
                            }
                        }
                        if (layerParent != null)
                            infoSilme = getInfo(name, layerParent.wrap);
                        //End Silme
                        if (infoSilme.metadata) {
                            infoSilme.metadata.forEach(function (md) {
                                md.formatDescription = formatDescriptions[md.format] =
                                    formatDescriptions[md.format] ||
                                    self.getLocaleString(TC.Util.getSimpleMimeType(md.format)) ||
                                    self.getLocaleString('viewMetadata');
                            });
                        }
                        const infoBtn = li.querySelector('.' + self.CLASS + '-btn-info');
                        infoBtn.classList.toggle(TC.Consts.classes.CHECKED, toggleInfo(n, infoSilme));
                        result = infoSilme;
                        break;
                    }
                }
                break;
            }
        }

        return result;
    };

    const addLayerToMap = function (layer, layerName) {
        const self = this;
        const layerOptions = TC.Util.extend({}, layer.options);
        layerOptions.id = self.getUID();
        layerOptions.layerNames = [layerName];
        layerOptions.title = layer.title;
        layerOptions.uid = layer.uid;
        const newLayer = new TC.layer.Raster(layerOptions);
        if (newLayer.isCompatible(self.map.crs)) {
            self.map.addLayer(layerOptions).then(function (layer) {
                layer.wrap.$events.on(TC.Consts.event.TILELOADERROR, function (event) {
                    var layer = this.parent;
                    if (event.error.code === 401 || event.error.code === 403)
                        layer.map.toast(event.error.text, { type: TC.Consts.msgType.ERROR });
                    layer.map.removeLayer(layer);
                });
            });
        }
        else {
            showProjectionChangeDialog(self, newLayer);
        }
    };

    const _refreshResultList = function () {
        const self = this;

        if ("createEvent" in document) {
            var evt = document.createEvent("HTMLEvents");
            evt.initEvent("keyup", false, true);
            if (self.textInput) {
                self.textInput.dispatchEvent(evt);
            }
        }
        else {
            if (self.textInput) {
                self.textInput.fireEvent("keyup");
            }
        }
    };

    const updateControl = function (layer) {
        const self = this;

        self.getLayerNodes(layer).forEach(function (node) {
            node.classList.remove(TC.Consts.classes.LOADING);
            node.classList.add(TC.Consts.classes.CHECKED);
            node.querySelector('span').dataset.tooltip = self.getLocaleString('layerAlreadyAdded');
        });
        _refreshResultList.call(self);
    };

    TC.control.LayerCatalogSilme.prototype.addLayer = function (layer) {
        const self = this;
        return new Promise(function (resolve, reject) {
            var fromLayerCatalog = [];

            if (self.options.layers && self.options.layers.length) {
                fromLayerCatalog = self.options.layers.filter(function (l) {
                    var getMap = TC.Util.reqGetMapOnCapabilities(l.url);
                    return getMap && getMap.replace(TC.Util.regex.PROTOCOL) == layer.url.replace(TC.Util.regex.PROTOCOL);
                });
            }

            if (fromLayerCatalog.length == 0)
                fromLayerCatalog = self.layers.filter(function (l) {
                    return l.url.replace(TC.Util.regex.PROTOCOL) == layer.url.replace(TC.Util.regex.PROTOCOL);
                });

            if (fromLayerCatalog.length == 0) {
                self.layers.push(layer);
                layer.getCapabilitiesPromise().then(function () {
                    layer.compatibleLayers = layer.wrap.getCompatibleLayers(self.map.crs);
                    layer.title = layer.title || layer.wrap.getServiceTitle();

                    if (!(SITNA.Cfg.controls.layerCatalogSilme.layerTreeGroups.filter(e => e.id === "node99")[0].children)) {
                        SITNA.Cfg.controls.layerCatalogSilme.layerTreeGroups.filter(e => e.id === "node99")[0].children = new Array();
                        layer.children = layer.getTree().children
                        SITNA.Cfg.controls.layerCatalogSilme.layerTreeGroups.filter(e => e.id === "node99")[0].children.push(layer)
                    } else {
                        layer.children = layer.getTree().children
                        SITNA.Cfg.controls.layerCatalogSilme.layerTreeGroups.filter(e => e.id === "node99")[0].children.push(layer);
                    }

                    //self.renderBranch(layer, function () {
                    //    resolve(); //ver linea 55 y por ahí
                    //});
                    TC.control.LayerCatalog.prototype.getRenderedHtml.call(self, 'tc-ctl-lcat-node', SITNA.Cfg.controls.layerCatalogSilme.layerTreeGroups.filter(e => e.id === "node99")[0], function (html) {
                        var template = document.createElement('template');
                        template.innerHTML = html;

                        var newChild = template.content ? template.content.firstChild : template.firstChild;

                        if (self.div.querySelector('#' + newChild.id) != null)//Silme
                        {
                            self.div.querySelector('#' + newChild.id).remove()//Silme - eliminem l'arbre anterior
                        }

                        //silme if (self.div.querySelector('#' + newChild.id) == null)//no existeix
                        //{
                        self.div.querySelector('.' + self.CLASS + '-branch').appendChild(newChild);
                        //}

                        for (var i = 0; i < newChild.children[2].children.length; i++) {
                            //var layer = self.getLayer(newChild.children[2].children[i].id);
                            var layer = self.getLayer(newChild.children[2].children[i].id);
                            addLogicToNode.call(self, newChild.children[2].children[i], layer);
                        }
                        addLogicToTreeGroup.call(self, newChild);
                    });
                });
            } else { resolve(); }
        }).then(function () {
            //mv 20210527 açò ho hem afegit per que carregui la capa corresponent després d'afegir un nou servei
            //a l'arbre de capes des del control localitzar (trams i fites de camí de cavalls, però podrien ser altres)
            if (pendingLayer) {
                silmeAddLayer(pendingLayer)
                pendingLayer = null;
            }
        });
    };

    TC.control.LayerCatalogSilme.prototype.loaded = function () {
        return this._readyPromise;
    };

    function CercaLayerDinsCapabilities(e) {
        // quan arrencam visor el capabilites està buit
        if (e.layer.capabilities != null && e.layer.type == TC.Consts.layerType.WMS) {
            var mainTree = e.layer.capabilities.Capability.Layer;
            var nomCerca = e.layer.names[0];
            cercaDinsAquestNode(mainTree, nomCerca);
        }

    }

    function cercaDinsAquestNode(node, nomCerca) {
        if (node.Name != null) {
            if (node.Name == nomCerca) {
                agafaKeywords(node);
                return true;
            }
        }

        if (node.Layer != null) {
            for (var i = 0; i < node.Layer.length; i++) {
                var trobat = cercaDinsAquestNode(node.Layer[i], nomCerca);
                if (trobat) return true;
            }
        }

        return false;
    }

    function agafaKeywords(node) {
        // Toastr
        var keywordList = node.KeywordList;
        if (keywordList!=undefined){
            if (Array.isArray(keywordList.Keyword)) {
              for (var i = 0; i < keywordList.Keyword.length; i++) {
                if (keywordList.Keyword[i] != null && keywordList.Keyword[i].includes("* ")) {
                  //alert("Desactualitzat");
                  toastr.info(keywordList.Keyword[i].substr(keywordList.Keyword[i].indexOf("* ") + 2), "Atenció");
                }
              }
            } else {
              if (keywordList != '' && keywordList.Keyword.includes("Aquesta cartografia no és vigent")) {
                // alert("Desactualitzat"); // *  --> mostra missatge a continuació
                toastr.info(keywordList.Keyword.substr(keywordList.Keyword.indexOf("* ") + 2), "Atenció");
             }
            }
        }
    }
})();
