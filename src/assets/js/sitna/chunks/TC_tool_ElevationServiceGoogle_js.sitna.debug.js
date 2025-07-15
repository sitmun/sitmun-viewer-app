"use strict";
(self["webpackChunkSITNA"] = self["webpackChunkSITNA"] || []).push([["TC_tool_ElevationServiceGoogle_js"],{

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

/***/ "./TC/tool/ElevationServiceGoogle.js":
/*!*******************************************!*\
  !*** ./TC/tool/ElevationServiceGoogle.js ***!
  \*******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _TC__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../TC */ "./TC.js");
/* harmony import */ var _ElevationService__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./ElevationService */ "./TC/tool/ElevationService.js");
/* harmony import */ var _Util__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../Util */ "./TC/Util.js");
/* harmony import */ var _Consts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../Consts */ "./TC/Consts.js");





// https://developers.google.com/maps/documentation/javascript/elevation?hl=es

let googleElevator;
const currentRequestIds = new Map();

const upRequestId = function (id, count) {
    let currentCount = currentRequestIds.get(id) || 0;
    currentCount += count;
    currentRequestIds.set(id, currentCount);
};

const downRequestId = function (id) {
    let currentCount = currentRequestIds.get(id);
    if (currentCount) {
        currentCount -= 1;
        if (currentCount <= 0) {
            currentRequestIds.delete(id);
        }
        return true;
    }
    return false;
};

class ElevationServiceGoogle extends _ElevationService__WEBPACK_IMPORTED_MODULE_1__["default"] {
    constructor() {
        super(...arguments);
        const self = this;
        self.url = self.options.url || '//maps.googleapis.com/maps/api/js?v=3';
        const intIdx = self.url.lastIndexOf('?');
        if (intIdx < 0) {
            self.url += '?';
        }
        else if (intIdx < self.url.length - 1) {
            self.url += '&';
        }

        //ahora google pide en la url de google maps una función función global que se llamará una vez que la API de Maps JavaScript se cargue por completo.
        let fnCallBackSV = "SV_" + (Math.random() + 1).toString(36).substring(7);

        window[fnCallBackSV] = function () {
            delete window[fnCallBackSV];
        }

        self.url += 'key=' + self.options.googleMapsKey + "&callback=" + fnCallBackSV;
        self.minimumElevation = self.options.minimumElevation || -9998;
        self.nativeCRS = 'EPSG:4326';
        self.maxCoordinateCountPerRequest = 512;
        self.minRetryInterval = 5100;
        self.maxRetries = Number.isInteger(self.options.maxRetries) ? self.options.maxRetries : 0;
    }

    request(options) {
        const self = this;
        options = options || {};
        if (!self.options.googleMapsKey) {
            return Promise.reject(Error('Missing Google Maps key'));
        }
        const requestId = options.id;

        const cancelledResponse = { status: 'CANCELLED' };
        let geomType;
        let coordinateList = options.coordinates;
        if (coordinateList.length === 1) {
            geomType = _Consts__WEBPACK_IMPORTED_MODULE_3__["default"].geom.POINT;
        }
        else {
            geomType = _Consts__WEBPACK_IMPORTED_MODULE_3__["default"].geom.POLYLINE;
        }

        if (self.options.allowedGeometryTypes && !self.options.allowedGeometryTypes.includes(geomType)) {
            return Promise.reject(Error(geomType + ' geometry type not allowed by configuration'));
        }

        if (coordinateList.length > self.maxCoordinateCountPerRequest) {
            // Google no soporta tantos puntos por petición, dividimos la petición en varias
            return new Promise(function (resolve, _reject) {
                const chunks = [];
                for (var i = 0, ii = coordinateList.length; i < ii; i += self.maxCoordinateCountPerRequest) {
                    chunks.push(coordinateList.slice(i, i + self.maxCoordinateCountPerRequest));
                }
                upRequestId(requestId, chunks.length);
                let retries = 0;
                const subrequests = chunks.map(function subrequest(chunk) {
                    const requestOptions = _Util__WEBPACK_IMPORTED_MODULE_2__["default"].extend({}, options, { coordinates: chunk, id: requestId });
                    return new Promise(function (res, rej) {
                        if (!currentRequestIds.has(requestId)) {
                            res(cancelledResponse);
                        }
                        else {
                            self.request(requestOptions)
                                .then(function (result) {
                                    if (result.status === 'OVER_QUERY_LIMIT') {
                                        console.log("OVER_QUERY_LIMIT status reached for request " + requestId);
                                        if (!currentRequestIds.has(requestId)) {
                                            res(cancelledResponse);
                                        }
                                        else {
                                            // Peticiones demasiado seguidas: esperamos y volvemos a pedir
                                            if (!self.maxRetries || retries < self.maxRetries) {
                                                retries = retries + 1;
                                                setTimeout(function () {
                                                    subrequest(chunk)
                                                        .then(r => res(r))
                                                        .catch(e => rej(e));
                                                }, self.minRetryInterval);
                                            }
                                            else {
                                                res(result);
                                            }
                                        }
                                    }
                                    else {
                                        res(result);
                                    }
                                })
                                .catch(e => rej(e));
                        }
                    });
                });
                Promise.all(subrequests).then(function mergeResponses(responses) {
                    const results = Array.prototype.concat.apply([], responses
                        .filter(r => r.status === 'OK')
                        .map(r => r.elevations));
                    downRequestId(requestId);
                    resolve({
                        status: 'OK',
                        elevations: results
                    });
                });
            });
        }

        if (options.crs && options.crs !== self.nativeCRS) {
            coordinateList = _Util__WEBPACK_IMPORTED_MODULE_2__["default"].reproject(coordinateList, options.crs, self.nativeCRS);
        }

        return new Promise(function (resolve, _reject) {
            const googleMapsIsLoaded = window.google && window.google.maps;
            if (!googleMapsIsLoaded) {
                _TC__WEBPACK_IMPORTED_MODULE_0__["default"].Cfg.proxyExceptions = _TC__WEBPACK_IMPORTED_MODULE_0__["default"].Cfg.proxyExceptions || [];
                _TC__WEBPACK_IMPORTED_MODULE_0__["default"].Cfg.proxyExceptions.push(self.url);
            }
            _TC__WEBPACK_IMPORTED_MODULE_0__["default"].loadJS(
                !googleMapsIsLoaded,
                self.url,
                function () {
                    googleElevator = googleElevator || new google.maps.ElevationService();
                    const coords = coordinateList.map(p => ({ lat: p[1], lng: p[0] }));
                    googleElevator.getElevationForLocations({
                        locations: coords
                    }, function (elevations, status) {
                        downRequestId(requestId);
                        resolve({
                            elevations: elevations,
                            status: status
                        });
                    });
                },
                false,
                true
            );
        });
    }

    parseResponse(response, options) {
        const self = this;
        switch (response.status) {
            case 'OK':
                return response.elevations.map(function (r) {
                    if (options.crs && options.crs !== self.nativeCRS) {
                        return _Util__WEBPACK_IMPORTED_MODULE_2__["default"].reproject([r.location.lng(), r.location.lat()], self.nativeCRS, options.crs).concat(r.elevation);
                    }
                    else {
                        return [r.location.lng(), r.location.lat(), r.elevation];
                    }
                });
            //case 'OVER_DAILY_LIMIT':
            //case 'OVER_QUERY_LIMIT':
            //case 'REQUEST_DENIED':
            //    self.serviceIsDisabled = true;
            default:
                return [];
        }
    }

    cancelRequest(id) {
        currentRequestIds.delete(id);
    }
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (ElevationServiceGoogle);

/***/ })

}]);
//# sourceMappingURL=../maps/chunks/TC_tool_ElevationServiceGoogle_js.sitna.debug.js.map