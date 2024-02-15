var arrayJsFiles = [
  // controls
  "assets/js/patch/controls/SearchSilme.js",
  //"assets/js/patch/controls/WFSQuerySilme.js",
  "assets/js/patch/controls/LayerCatalogSilme.js",
  "assets/js/patch/controls/WorkLayerManagerSilme.js",
  //"assets/js/patch/controls/BasemapSelectorSilme.js",
  "assets/js/patch/controls/ExternalWMSSilme.js",
  "assets/js/patch/controls/StreetViewSilme.js",
  //"assets/js/patch/controls/DownloadSilme.js",
  //"assets/js/patch/controls/Localitzar.js",
  //"assets/js/patch/controls/Reports.js",
  //"assets/js/patch/controls/BirdEye.js",
  "assets/js/patch/controls/DrawMeasureModifySilme.js",
  "assets/js/patch/controls/FeatureInfoSilme.js",
  "assets/js/patch/controls/Popup.js",

  // support
  "assets/js/patch/patch.js",
  //"assets/js/patch/SigSilmeOL.js",
  "assets/js/patch/SilmeMap.js",
  "assets/js/patch/SilmeModal.js",
  //"assets/js/patch/SilmeSecondBaseLayer.js",
  "assets/js/patch/SilmeSupport.js",
  "assets/js/patch/SilmeTree.js"
];

arrayJsFiles.forEach(function (jsFileSrc) {
  let script = document.createElement('script');
  script.src = jsFileSrc;
  document.head.appendChild(script)
});

const originalFnc = TC.UI.autocomplete

TC.UI.autocomplete = function (method) {

  if (typeof method === 'object' && method.target.classList.contains("tc-ctl-wfsquery-list")) {

    method.minLength = 1;

  }

  originalFnc.call(this, method);

};
