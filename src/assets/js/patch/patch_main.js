var arrayJsFiles = [

  // Controls
  "assets/js/patch/controls/SearchSilme.js",
  // "assets/js/patch/controls/LayerCatalogSilme.js",
  "assets/js/patch/controls/LayerCatalogSilmeFolders.js",
  "assets/js/patch/controls/WorkLayerManagerSilme.js",
  "assets/js/patch/controls/BasemapSelectorSilme.js",
  "assets/js/patch/controls/ExternalWMSSilme.js",
  "assets/js/patch/controls/StreetViewSilme.js",
  "assets/js/patch/controls/DrawMeasureModifySilme.js",
  "assets/js/patch/controls/FeatureInfoSilme.js",
  "assets/js/patch/controls/Popup.js",

  // Support
  "assets/js/patch/api_patches.js",
  "assets/js/patch/patch.js",
  "assets/js/patch/TCProjectionDataPatch.js",
  //"assets/js/patch/SigSilmeOL.js",
  "assets/js/patch/SilmeMap.js",
  "assets/js/patch/SilmeModal.js",
  "assets/js/patch/SilmeSecondBaseLayer.js",
  "assets/js/patch/SilmeUtils.js",
  "assets/js/patch/SilmeTree.js"
];

arrayJsFiles.forEach(function (jsFileSrc) {
  let script = document.createElement('script');
  script.src = jsFileSrc;
  document.head.appendChild(script)
});
