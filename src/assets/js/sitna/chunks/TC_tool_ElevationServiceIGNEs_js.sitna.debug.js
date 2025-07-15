"use strict";
(self["webpackChunkSITNA"] = self["webpackChunkSITNA"] || []).push([["TC_tool_ElevationServiceIGNEs_js"],{

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

/***/ }),

/***/ "./TC/tool/ElevationServiceIGNEs.js":
/*!******************************************!*\
  !*** ./TC/tool/ElevationServiceIGNEs.js ***!
  \******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _TC__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../TC */ "./TC.js");
/* harmony import */ var _ElevationService__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./ElevationService */ "./TC/tool/ElevationService.js");
/* harmony import */ var _Util__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../Util */ "./TC/Util.js");




let proxificationTool;

class ElevationServiceIGNEs extends _ElevationService__WEBPACK_IMPORTED_MODULE_1__["default"] {
    constructor() {
        super(...arguments);
        const self = this;
        self.url = self.options.url || '//servicios.idee.es/wcs-inspire/mdt';
        self.minimumElevation = self.options.minimumElevation || -9998;
        self.nativeCRS = 'EPSG:25830';
    }

    async request(options) {
        const self = this;
        options = options || {};
        if (options.coordinates.length === 1) {
            let point = options.coordinates[0];

            if (options.crs && options.crs !== self.nativeCRS) {
                point = _Util__WEBPACK_IMPORTED_MODULE_2__["default"].reproject(point, options.crs, self.nativeCRS);
            }

            let coverageName = 'Elevacion25830_5';
            let coverageResolution = 3;
            const halfRes1 = coverageResolution / 2;
            const halfRes2 = coverageResolution - halfRes1;

            const bbox = [
                point[0] - halfRes1,
                point[1] - halfRes1,
                point[0] + halfRes2,
                point[1] + halfRes2
            ];
            const requestUrl = self.url + '?SERVICE=WCS&REQUEST=GetCoverage&VERSION=2.0.1' +
                '&SUBSET=' + encodeURIComponent('x,' + self.nativeCRS + '(' + bbox[0] + ',' + bbox[2] + ')') +
                '&SUBSET=' + encodeURIComponent('y,' + self.nativeCRS + '(' + bbox[1] + ',' + bbox[3] + ')') +
                '&COVERAGEID=' + encodeURIComponent(coverageName) +
                '&RESOLUTION=x(1)' +
                '&RESOLUTION=y(1)' +
                '&FORMAT=' + encodeURIComponent('application/asc') +
                '&EXCEPTIONS=XML';

            if (!proxificationTool) {
                const Proxification = (await Promise.resolve(/*! import() */).then(__webpack_require__.bind(__webpack_require__, /*! ./Proxification */ "./TC/tool/Proxification.js"))).default;
                proxificationTool = new Proxification(_TC__WEBPACK_IMPORTED_MODULE_0__["default"].proxify);
            }
            const response = await proxificationTool.fetch(requestUrl);
            return response.responseText;
        }

        throw new Error('ign.es elevation service supports only points');
    }

    parseResponse(response, options) {
        const self = this;
        const lines = response.split('\n');
        const nColsLine = lines.find(line => line.indexOf('ncols') === 0);
        const nCols = parseInt(nColsLine && nColsLine.substr(nColsLine.lastIndexOf(' ')));
        const nRowsLine = lines.find(line => line.indexOf('nrows') === 0);
        const nRows = parseInt(nColsLine && nRowsLine.substr(nRowsLine.lastIndexOf(' ')));
        if (nCols && nRows) {
            const xllCornerLine = lines.find(line => line.indexOf('xllcorner') === 0);
            const x = parseFloat(xllCornerLine && xllCornerLine.substr(xllCornerLine.lastIndexOf(' ')));
            const yllCornerLine = lines.find(line => line.indexOf('yllcorner') === 0);
            const y = parseFloat(yllCornerLine && yllCornerLine.substr(yllCornerLine.lastIndexOf(' ')));
            if (!isNaN(x) && !isNaN(y)) {
                const cellSizeIndex = lines.findIndex(line => line.indexOf('cellsize') === 0);
                let elevation = parseFloat(lines[cellSizeIndex + Math.round(nRows / 2)].trim().split(' ')[Math.round(nCols / 2) - 1]);
                if (isNaN(elevation)) {
                    elevation = null;
                }
                let point = options.coordinates[0].slice();
                point[2] = elevation;
                if (options.crs && options.crs !== self.nativeCRS) {
                    point = _Util__WEBPACK_IMPORTED_MODULE_2__["default"].reproject(point, self.nativeCRS, options.crs);
                }
                return super.parseResponse.call(self, { coordinates: [point] }, options);
            }
        }
        return [];
    }
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (ElevationServiceIGNEs);

/***/ })

}]);
//# sourceMappingURL=../maps/chunks/TC_tool_ElevationServiceIGNEs_js.sitna.debug.js.map