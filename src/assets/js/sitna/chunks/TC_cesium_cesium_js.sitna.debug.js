"use strict";
(self["webpackChunkSITNA"] = self["webpackChunkSITNA"] || []).push([["TC_cesium_cesium_js"],{

/***/ "./TC/cesium/cesium.js":
/*!*****************************!*\
  !*** ./TC/cesium/cesium.js ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var cesium__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! cesium */ "./node_modules/cesium/Source/Cesium.js");

window.CESIUM_BASE_URL = TC.apiLocation + 'lib/cesium/build/';





const cesium = {

    ApproximateTerrainHeights: cesium__WEBPACK_IMPORTED_MODULE_0__.ApproximateTerrainHeights
    , Billboard: cesium__WEBPACK_IMPORTED_MODULE_0__.Billboard
    , BillboardCollection: cesium__WEBPACK_IMPORTED_MODULE_0__.BillboardCollection
    , BoundingSphere: cesium__WEBPACK_IMPORTED_MODULE_0__.BoundingSphere
    , CallbackProperty: cesium__WEBPACK_IMPORTED_MODULE_0__.CallbackProperty
    , Camera: cesium__WEBPACK_IMPORTED_MODULE_0__.Camera
    , Cartesian2: cesium__WEBPACK_IMPORTED_MODULE_0__.Cartesian2
    , Cartesian3: cesium__WEBPACK_IMPORTED_MODULE_0__.Cartesian3
    , Cartographic: cesium__WEBPACK_IMPORTED_MODULE_0__.Cartographic
    , CesiumTerrainProvider: cesium__WEBPACK_IMPORTED_MODULE_0__.CesiumTerrainProvider
    , CircleGeometry: cesium__WEBPACK_IMPORTED_MODULE_0__.CircleGeometry
    , ClockRange: cesium__WEBPACK_IMPORTED_MODULE_0__.ClockRange
    , ClockStep: cesium__WEBPACK_IMPORTED_MODULE_0__.ClockStep
    , Color: cesium__WEBPACK_IMPORTED_MODULE_0__.Color
    , ColorGeometryInstanceAttribute: cesium__WEBPACK_IMPORTED_MODULE_0__.ColorGeometryInstanceAttribute
    , ColorMaterialProperty: cesium__WEBPACK_IMPORTED_MODULE_0__.ColorMaterialProperty
    , combine: cesium__WEBPACK_IMPORTED_MODULE_0__.combine
    , Credit: cesium__WEBPACK_IMPORTED_MODULE_0__.Credit
    , CzmlDataSource: cesium__WEBPACK_IMPORTED_MODULE_0__.CzmlDataSource
    , CustomDataSource: cesium__WEBPACK_IMPORTED_MODULE_0__.CustomDataSource
    , DataSourceCollection: cesium__WEBPACK_IMPORTED_MODULE_0__.DataSourceCollection
    , DataSourceDisplay: cesium__WEBPACK_IMPORTED_MODULE_0__.DataSourceDisplay
    , DeveloperError: cesium__WEBPACK_IMPORTED_MODULE_0__.DeveloperError
    , EasingFunction: cesium__WEBPACK_IMPORTED_MODULE_0__.EasingFunction
    , Ellipsoid: cesium__WEBPACK_IMPORTED_MODULE_0__.Ellipsoid
    , EllipsoidGeodesic: cesium__WEBPACK_IMPORTED_MODULE_0__.EllipsoidGeodesic
    , EllipsoidTerrainProvider: cesium__WEBPACK_IMPORTED_MODULE_0__.EllipsoidTerrainProvider
    , Entity: cesium__WEBPACK_IMPORTED_MODULE_0__.Entity
    , Event: cesium__WEBPACK_IMPORTED_MODULE_0__.Event
    , EventHelper: cesium__WEBPACK_IMPORTED_MODULE_0__.EventHelper
    , GeographicTilingScheme: cesium__WEBPACK_IMPORTED_MODULE_0__.GeographicTilingScheme
    , GeometryInstance: cesium__WEBPACK_IMPORTED_MODULE_0__.GeometryInstance
    , Globe: cesium__WEBPACK_IMPORTED_MODULE_0__.Globe
    , GroundPrimitive: cesium__WEBPACK_IMPORTED_MODULE_0__.GroundPrimitive
    , HeadingPitchRange: cesium__WEBPACK_IMPORTED_MODULE_0__.HeadingPitchRange
    , HeightReference: cesium__WEBPACK_IMPORTED_MODULE_0__.HeightReference
    , HeightmapTerrainData: cesium__WEBPACK_IMPORTED_MODULE_0__.HeightmapTerrainData
    , HorizontalOrigin: cesium__WEBPACK_IMPORTED_MODULE_0__.HorizontalOrigin
    , ImageryLayer: cesium__WEBPACK_IMPORTED_MODULE_0__.ImageryLayer
    , ImageryState: cesium__WEBPACK_IMPORTED_MODULE_0__.ImageryState
    , IntersectionTests: cesium__WEBPACK_IMPORTED_MODULE_0__.IntersectionTests
    , JulianDate: cesium__WEBPACK_IMPORTED_MODULE_0__.JulianDate
    , LabelStyle: cesium__WEBPACK_IMPORTED_MODULE_0__.LabelStyle
    , Math: cesium__WEBPACK_IMPORTED_MODULE_0__.Math
    , Matrix3: cesium__WEBPACK_IMPORTED_MODULE_0__.Matrix3
    , Matrix4: cesium__WEBPACK_IMPORTED_MODULE_0__.Matrix4
    , PinBuilder: cesium__WEBPACK_IMPORTED_MODULE_0__.PinBuilder
    , PolygonGeometry: cesium__WEBPACK_IMPORTED_MODULE_0__.PolygonGeometry
    , PolygonHierarchy: cesium__WEBPACK_IMPORTED_MODULE_0__.PolygonHierarchy
    , PolygonPipeline: cesium__WEBPACK_IMPORTED_MODULE_0__.PolygonPipeline
    , PolylineDashMaterialProperty: cesium__WEBPACK_IMPORTED_MODULE_0__.PolylineDashMaterialProperty
    , Property: cesium__WEBPACK_IMPORTED_MODULE_0__.Property
    , Quaternion: cesium__WEBPACK_IMPORTED_MODULE_0__.Quaternion
    , Ray: cesium__WEBPACK_IMPORTED_MODULE_0__.Ray
    , Rectangle: cesium__WEBPACK_IMPORTED_MODULE_0__.Rectangle
    , RequestScheduler: cesium__WEBPACK_IMPORTED_MODULE_0__.RequestScheduler
    , RequestState: cesium__WEBPACK_IMPORTED_MODULE_0__.RequestState
    , Resource: cesium__WEBPACK_IMPORTED_MODULE_0__.Resource
    , RuntimeError: cesium__WEBPACK_IMPORTED_MODULE_0__.RuntimeError
    , ScreenSpaceEventHandler: cesium__WEBPACK_IMPORTED_MODULE_0__.ScreenSpaceEventHandler
    , ScreenSpaceEventType: cesium__WEBPACK_IMPORTED_MODULE_0__.ScreenSpaceEventType
    , SkyAtmosphere: cesium__WEBPACK_IMPORTED_MODULE_0__.SkyAtmosphere
    , SkyBox: cesium__WEBPACK_IMPORTED_MODULE_0__.SkyBox
    , TerrainProvider: cesium__WEBPACK_IMPORTED_MODULE_0__.TerrainProvider
    , TileCoordinatesImageryProvider: cesium__WEBPACK_IMPORTED_MODULE_0__.TileCoordinatesImageryProvider
    , TileProviderError: cesium__WEBPACK_IMPORTED_MODULE_0__.TileProviderError
    , TimeIntervalCollection: cesium__WEBPACK_IMPORTED_MODULE_0__.TimeIntervalCollection
    , Transforms: cesium__WEBPACK_IMPORTED_MODULE_0__.Transforms
    , TrustedServers: cesium__WEBPACK_IMPORTED_MODULE_0__.TrustedServers
    , VerticalOrigin: cesium__WEBPACK_IMPORTED_MODULE_0__.VerticalOrigin
    , Viewer: cesium__WEBPACK_IMPORTED_MODULE_0__.Viewer
    , WebMapServiceImageryProvider: cesium__WEBPACK_IMPORTED_MODULE_0__.WebMapServiceImageryProvider
    , WebMapTileServiceImageryProvider: cesium__WEBPACK_IMPORTED_MODULE_0__.WebMapTileServiceImageryProvider
    , when: cesium__WEBPACK_IMPORTED_MODULE_0__.when
    , defaultValue: cesium__WEBPACK_IMPORTED_MODULE_0__.defaultValue
    , defined: cesium__WEBPACK_IMPORTED_MODULE_0__.defined
    , deprecationWarning: cesium__WEBPACK_IMPORTED_MODULE_0__.deprecationWarning
    , sampleTerrainMostDetailed: cesium__WEBPACK_IMPORTED_MODULE_0__.sampleTerrainMostDetailed
    , Request: cesium__WEBPACK_IMPORTED_MODULE_0__.Request
    , RequestType: cesium__WEBPACK_IMPORTED_MODULE_0__.RequestType
    , TimeInterval: cesium__WEBPACK_IMPORTED_MODULE_0__.TimeInterval
    , VERSION: cesium__WEBPACK_IMPORTED_MODULE_0__.VERSION
};

const TOO_MANY_PARALLEL_REQUESTS = "Too many parallel requests, so postpone loading tile";
window.cesium = cesium;

if (!cesium.WCSTerrainProvider) {
    //TC.syncLoadJS(TC.apiLocation + 'TC/cesium/mergeTerrainProvider/MergeTerrainProvider');
    __webpack_require__.e(/*! import() */ "TC_cesium_mergeTerrainProvider_MergeTerrainProvider_js").then(__webpack_require__.bind(__webpack_require__, /*! ./mergeTerrainProvider/MergeTerrainProvider */ "./TC/cesium/mergeTerrainProvider/MergeTerrainProvider.js")).then(function (MergeTerrainProvider) {
        cesium.MergeTerrainProvider = MergeTerrainProvider.default;
    })
}

/* sobrescribimos y extendemos lo necesario para que todas las peticiones pasen por el algoritmo de proxificación */
// requerido para añadir la referencia a la capa TC
cesium.Resource.prototype._clone = cesium.Resource.prototype.clone;
cesium.Resource.prototype.clone = function () {
    let cloned = cesium.Resource.prototype._clone.apply(this, arguments);
    cloned.tcLayer = this.tcLayer;
    return cloned;
};

// requerido para gestionar la promesa rechaza directamente que vamos a retornar en lugar del undefined que retorna cesium en fetchImage
cesium.ImageryLayer.prototype.__requestImagery = cesium.ImageryLayer.prototype._requestImagery;
cesium.ImageryLayer.prototype._requestImagery = function (imagery) {
    var imageryProvider = this._imageryProvider;

    var that = this;

    function success(image) {
        if (!cesium.defined(image)) {
            return failure();
        }

        imagery.image = image;
        imagery.state = cesium.ImageryState.RECEIVED;
        imagery.request = undefined;

        cesium.TileProviderError.handleSuccess(that._requestImageError);
    }

    function failure(e) {
        if (typeof e === 'string' && e === TOO_MANY_PARALLEL_REQUESTS) {
            // Too many parallel requests, so postpone loading tile.
            imagery.state = cesium.ImageryState.UNLOADED;
            imagery.request = undefined;
            return;
        } else if (e.status && e.status.toString() === "200") {
            // si llega alguna excepción en XML como cuerpo de la petición de una imagen, pasamos de ella
            imagery.state = cesium.ImageryState.FAILED;
            imagery.request = undefined;
            return;
        }

        if (imagery.request.state === cesium.RequestState.CANCELLED) {
            // Cancelled due to low priority - try again later.
            imagery.state = cesium.ImageryState.UNLOADED;
            imagery.request = undefined;
            return;
        }

        // Initially assume failure.  handleError may retry, in which case the state will
        // change to TRANSITIONING.
        imagery.state = cesium.ImageryState.FAILED;
        imagery.request = undefined;

        var message =
            "Failed to obtain image tile X: " +
            imagery.x +
            " Y: " +
            imagery.y +
            " Level: " +
            imagery.level +
            ".";
        that._requestImageError = cesium.TileProviderError.handleError(
            that._requestImageError,
            imageryProvider,
            imageryProvider.errorEvent,
            message,
            imagery.x,
            imagery.y,
            imagery.level,
            doRequest,
            e
        );
    }

    function doRequest() {
        var request = new cesium.Request({
            throttle: false,
            throttleByServer: true,
            type: cesium.RequestType.IMAGERY,
        });
        imagery.request = request;
        imagery.state = cesium.ImageryState.TRANSITIONING;
        var imagePromise = imageryProvider.requestImage(
            imagery.x,
            imagery.y,
            imagery.level,
            request
        );

        // cesium hace lo siguiente y es lo que no nos encaja y que nosotros gestionamos en failure
        if (!cesium.defined(imagePromise)) {
            // Too many parallel requests, so postpone loading tile.
            imagery.state = cesium.ImageryState.UNLOADED;
            imagery.request = undefined;
            return;
        }

        if (cesium.defined(imageryProvider.getTileCredits)) {
            imagery.credits = imageryProvider.getTileCredits(
                imagery.x,
                imagery.y,
                imagery.level
            );
        }

        cesium.when(imagePromise, success, failure);
    }

    doRequest();
};

// requerido para que pasar por el algoritmo de proxificación
cesium.Resource.prototype._fetchImage = cesium.Resource.prototype.fetchImage;
cesium.Resource.prototype.fetchImage = function () {
    if (this.tcLayer) {
        let self = this;
        let options = arguments;

        let deferred = cesium.when.defer();

        this.tcLayer.getWebGLUrl.call(this.tcLayer, this.url)
            .then(function (params) {
                self.url = params.url;
                let image = params.image ? new Promise((resolve) => { resolve(params.image) }) : cesium.Resource.prototype._fetchImage.apply(self, options);
                if (image) {
                    image.then(deferred.resolve);
                } else {
                    deferred.reject(TOO_MANY_PARALLEL_REQUESTS);
                }
            })
            .catch(function (error) {
                deferred.reject(error);
            });

        return deferred.promise;
    } else {
        return cesium.Resource.prototype._fetchImage.apply(this, arguments);
    }
};

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (cesium);

/***/ })

}]);
//# sourceMappingURL=../maps/chunks/TC_cesium_cesium_js.sitna.debug.js.map