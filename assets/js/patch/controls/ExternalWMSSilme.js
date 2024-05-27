TC.control = TC.control || {};

if (!TC.control.ExternalWMS) {
    TC.syncLoadJS(TC.apiLocation + 'TC/control/ExternalWMS');
}

TC.control.ExternalWMSSilme = function (options) {
    var _ctl = this;

    TC.control.ExternalWMS.apply(_ctl, arguments);
};

TC.inherit(TC.control.ExternalWMSSilme, TC.control.ExternalWMS);

(function () {
    var ctlProto = TC.control.ExternalWMSSilme.prototype;

    ctlProto.register = function (map) {
        const self = this;
        const result = TC.Control.prototype.register.call(self, map);

        self.div.addEventListener('change', TC.EventTarget.listenerBySelector('select', function (evt) {
            if (evt.target.value !== '') {
                var url = evt.target.value;
                if (url.indexOf('//') === 0) {
                    url = location.protocol + url;
                }
                self.div.querySelector('input').value = url;
                evt.target.value = '';
            }
        }));

        /**
         * Borra parámetros no necesarios de la URL del servicio WMS.
         */
        var _removeParamsFromUrl = function (url, unwantedParams) {
            for (var i = 0; i < unwantedParams.length; i++) {
                url = TC.Util.removeURLParameter(url, unwantedParams[i]);
            }
            if (url.match(/\?$/)) {
                url = url.substr(0, url.length - 1);
            }
            return url;
        }

        const addWMS = function () {
            var url = self.div.querySelector('input').value.trim();

            if (!url) {
                TC.alert(self.getLocaleString('typeAnAddress'));
            }
            else if (!/^((https?|ftp):)?(\/\/)?(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(url)) {
                TC.alert(self.getLocaleString('typeAValidAddress'));
            }
            else {
                if (self._addedUrls.some(function (addedUrl) {
                    return addedUrl.replace(/https?:\/\/|\/\//, '') === url.replace(/https?:\/\/|\/\//, '')
                })) {
                    TC.alert(self.getLocaleString('serviceAlreadyAdded'));
                }
                else {
                    var loadingCtrl = self.map.getControlsByClass("TC.control.LoadingIndicator")[0];
                    loadingCtrl.show();
                    var params = TC.Util.getQueryStringParams(url);

                    if (!/https?:\/\/|\/\//i.test(url)) {
                        url = "//" + url;
                    }

                    //Extraemos sólo los parámetros adicionales
                    var unwantedParams = ["version", "service", "request"];
                    var urlWithoutParams = _removeParamsFromUrl(url, Object.keys(params));

                    for (var item in params) {
                        if (unwantedParams.indexOf(item.toLowerCase()) >= 0) {
                            delete params[item];
                        }
                    }

                    const addButton = self.div.querySelector('button');
                    addButton.disabled = true;

                    var obj = {
                        id: 'xwms' + (++self.count),
                        //"title": "Servicio externo",
                        type: 'WMS',
                        url: urlWithoutParams,
                        hideTree: false,
                        queryParams: params//,
                        //stealth: true//Silme s'ha afegit aquest paràmetre perque sinó posava la capa a capes carregades
                    };
                    //URI: recorremos las opciones buscando el servicio que se va a agregar a ver si tiene parametro layerNames
                    for (var i = 0; i < self.options.suggestions.length; i++) {
                        var _current = self.options.suggestions[i].items.filter(function (item, i) {
                            return item.url === url;
                        });
                        if (_current.length > 0 && _current[0].layerNames) {
                            obj["layerNames"] = _current[0].layerNames;
                            break;
                        }
                    }

                    var layer = new TC.layer.Raster(obj);
                    layer.parentGroupNode = "node99"; //silme - node d'altres serveis
                    layer.getCapabilitiesPromise().then(function (cap) {
                        if (typeof (cap.Capability) === 'undefined') {
                            TC.alert(self.getLocaleString('noLayersFoundInService'));
                            loadingCtrl.hide();
                            addButton.disabled = false;
                        } else {
                            var root = cap.Capability.Layer;
                            if (root.CRS && root.CRS.indexOf(self.map.crs) == -1 && !self.allowReprojection) {
                                //no soportado. avisar y fallar
                                TC.alert(self.getLocaleString('serviceSrsNotCompatible'));
                                loadingCtrl.hide();
                                addButton.disabled = false;
                                return;
                            }

                            self.map.trigger(TC.Consts.event.EXTERNALSERVICEADDED, { layer: layer });
                            self.div.querySelector('input').value = '';

                            const selectedOptions = [];
                            self.div.querySelectorAll('select option').forEach(function (option) {
                                if (option.value.replace(/https?:\/\/|\/\//, '') === url.replace(/https?:\/\/|\/\//, '')) {
                                    selectedOptions.push(option);
                                }
                            });
                            self.markServicesAsSelected(selectedOptions);
                            self._addedUrls.push(url);
                            loadingCtrl.hide();
                            addButton.disabled = false;
                        }
                    },
                        function (error) {
                            TC.alert(self.getLocaleString('serviceCouldNotBeLoaded') + ":\n" + error);
                            loadingCtrl.hide();
                            addButton.disabled = false;
                        });
                }
            }
        };

        self.renderPromise().then(() => {
            self.div.querySelector('input').addEventListener('keyup', (e) => {
                if (e.key && e.key.toLowerCase() === "enter" && self.div.querySelector('input').value.trim().length > 0) {
                    addWMS();
                }
            });
        });

        self.div.addEventListener('click', TC.EventTarget.listenerBySelector('button[name="agregar"]', addWMS));

        map.on(TC.Consts.event.LAYERADD, function (e) {
            const layer = e.layer;
            if (layer && !layer.isBase) {
                var url = layer.url;

                if (url) {
                    self.pending_markServicesAsSelected = self.pending_markServicesAsSelected || [];
                    if (self.div.querySelectorAll('select option').length === 0 && url && self.pending_markServicesAsSelected.indexOf(url) === -1) {
                        self.pending_markServicesAsSelected.push(url);
                    }

                    const selectedOptions = [];
                    self.div.querySelectorAll('select option').forEach(function (option) {
                        if (option.value.replace(/https?:\/\/|\/\//, '') === url.replace(/https?:\/\/|\/\//, '')) {
                            selectedOptions.push(option);
                        }
                    });
                    self.markServicesAsSelected(selectedOptions);
                    self._addedUrls.push(url);
                }
            }
        });

        return result;
    };

    //ctlProto.template = {};
    //ctlProto.template[ctlProto.CLASS] = TC.apiLocation + "TC/templates/tc-ctl-xwms.hbs";

    ctlProto.render = function (callback) {
        const self = this;
        return self._set1stRenderPromise(self.renderData(self.options, function () {
            self.pending_markServicesAsSelected = self.pending_markServicesAsSelected || [];

            self.pending_markServicesAsSelected.forEach(function (elemUrl) {
                const selectedOptions = [];
                self.div.querySelectorAll('select option').forEach(function (option) {
                    if (TC.Util.addProtocol(option.value) === TC.Util.addProtocol(elemUrl)) {
                        selectedOptions.push(option);
                    }
                });

                self.markServicesAsSelected(selectedOptions);
                self._addedUrls.push(elemUrl);
            });

            self.pending_markServicesAsSelected = [];
        }));
    };


})();
