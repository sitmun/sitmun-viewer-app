"use strict";
(self["webpackChunkSITNA"] = self["webpackChunkSITNA"] || []).push([["TC_tool_ElevationService_js"],{

/***/ "./TC/tool/ElevationService.js":
/*!*************************************!*\
  !*** ./TC/tool/ElevationService.js ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _TC__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../TC */ "./TC.js");
/* harmony import */ var _Util__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Util */ "./TC/Util.js");


/**
  * Opciones de servicio de obtención de elevaciones de puntos.
  * @typedef ElevationServiceOptions
  * @memberof SITNA
  * @see SITNA.ElevationOptions
  * @property {string[]} [allowedGeometryTypes] - Si se establece, indica para qué geometrías se van a hacer consultas 
  * de elevación al servicio. Esto es conveniente por ejemplo si el servicio solo permite obtener elevaciones de un punto simple,
  * invalidándolo para la consulta si la geometría es un polígono o una línea. Los elementos del array tienen que ser cadenas 
  * cuyos valores deben ser los definidos por [SITNA.Consts.geom]{@link SITNA.Consts}.
  * @property {string} [googleMapsKey] - Valor de una clave válida de la API de Google Maps. Solamente es necesaria cuando 
  * el valor de la propiedad `name` es [SITNA.Consts.elevationService.GOOGLE]{@link SITNA.Consts}.
  *
  * Puede obtener más información en el [sitio para desarrolladores de Google](https://developers.google.com/maps/documentation/javascript/get-api-key).
  * @property {string} name - Nombre del servicio que queremos utilizar. Debe tener un valor de [SITNA.Consts.elevationService]{@link SITNA.Consts}.
  * @property {string} [url] - URL del servicio. Cada servicio de elevaciones de puntos tiene asignada una URL por defecto, 
  * así que rara vez será necesario establecer esta propiedad.
  */

class ElevationService { 
    constructor(options) {
        const self = this;
        self.options = options || {};
        self.url = self.options.url;
        self.process = self.options.process;
        self.minimumElevation = self.options.minimumElevation;
        if (_Util__WEBPACK_IMPORTED_MODULE_1__["default"].isFunction(self.options.request)) {
            self.request = self.options.request;
        }
        if (_Util__WEBPACK_IMPORTED_MODULE_1__["default"].isFunction(self.options.parseResponse)) {
            self.parseResponse = self.options.parseResponse;
        }
    }

    async getElevation(options) {
        const self = this;
        options = options || {};
        if (options.resolution === undefined) {
            options.resolution = self.options.resolution;
        }
        if (options.sampleNumber === undefined) {
            options.sampleNumber = self.options.sampleNumber;
        }
        const response = await self.request(options);
        return (options.responseCallback || self.parseResponse).call(self, response, options);
    }

    async request(options) {
        const self = this;
        options = options || {};
        if (options.dataInputs || options.body) {
            const WPS = await __webpack_require__.e(/*! import() */ "TC_format_WPS_js").then(__webpack_require__.t.bind(__webpack_require__, /*! ../format/WPS */ "./TC/format/WPS.js", 23));
            const data = {
                process: options.process || self.process,
                dataInputs: options.dataInputs,
                responseType: SITNA.Consts.mimeType.JSON,
                version: options.serviceVersion || self.serviceVersion || '1.0.0',
                output: options.output
            };
            const contentType = typeof options.contentType === 'boolean' ? options.contentType : options.contentType || SITNA.Consts.mimeType.XML;
            const response = await _TC__WEBPACK_IMPORTED_MODULE_0__["default"].ajax({
                url: self.url,
                method: 'POST',
                contentType: contentType,
                responseType: SITNA.Consts.mimeType.JSON,
                data: options.body || WPS.buildExecuteQuery(data)
            });
            return response.data;
        }
        else {
            throw Error('Request is not valid for elevation service');
        }
    }

    parseResponse(response, _options) {
        var self = this;
        if (response.coordinates) {
            const coords = response.coordinates;
            coords.forEach(function (coord) {
                if (coord[2] < self.minimumElevation) {
                    coord[2] = null;
                }
            });
        }
        return response.coordinates || [];
    }

    cancelRequest(_id) {

    }
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (ElevationService);

/***/ })

}]);
//# sourceMappingURL=../maps/chunks/TC_tool_ElevationService_js.sitna.debug.js.map