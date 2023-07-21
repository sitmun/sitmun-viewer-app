/*function ajustarPanell() {
    if (!$('#bms').hasClass("tc-collapsed") && !$('#catalog').hasClass("tc-collapsed")){
        $('#arbol').css("height", "calc(100vh - " + ($('#links').outerHeight() + $('#bms').outerHeight() + $('#catalog').children("h2").outerHeight() + $('#xdata').children("h2").outerHeight() + $('#toc').children("h2").outerHeight() + ($('#mapa').outerHeight() - $('#tools-panel').children(".panel-content").outerHeight())) + "px)");
        $('.tc-ctl-lcat-search').css("height", "calc(100vh - " + ($('#links').outerHeight() + $('#bms').outerHeight() + $('#catalog').children("h2").outerHeight() + $('#xdata').children("h2").outerHeight() + $('#toc').children("h2").outerHeight() + ($('#mapa').outerHeight() - $('#tools-panel').children(".panel-content").outerHeight())) + "px)");
    }else if (!$('#xdata').hasClass("tc-collapsed") && !$('#catalog').hasClass("tc-collapsed")){
        $('#arbol').css("height", "calc(100vh - " + ($('#links').outerHeight() + $('#bms').children("h2").outerHeight() + $('#catalog').children("h2").outerHeight() + $('#xdata').outerHeight() + $('#toc').children("h2").outerHeight() + ($('#mapa').outerHeight() - $('#tools-panel').children(".panel-content").outerHeight())) + "px)");
        $('.tc-ctl-lcat-search').css("height", "calc(100vh - " + ($('#links').outerHeight() + $('#bms').children("h2").outerHeight() + $('#catalog').children("h2").outerHeight() + $('#xdata').outerHeight() + $('#toc').children("h2").outerHeight() + ($('#mapa').outerHeight() - $('#tools-panel').children(".panel-content").outerHeight())) + "px)");
    }else if (!$('#toc').hasClass("tc-collapsed") && !$('#catalog').hasClass("tc-collapsed")){
        $('#arbol').css("height", "calc(100vh - " + ($('#links').outerHeight() + $('#bms').children("h2").outerHeight() + $('#catalog').children("h2").outerHeight() +
        $('#xdata').children("h2").outerHeight() + $('#toc').outerHeight() + ($('#mapa').outerHeight() - $('#tools-panel').children(".panel-content").outerHeight())) + "px)");
        $('.tc-ctl-lcat-search').css("height", "calc(100vh - " + ($('#links').outerHeight() + $('#bms').children("h2").outerHeight() + $('#catalog').children("h2").outerHeight() +
        $('#xdata').children("h2").outerHeight() + $('#toc').outerHeight() + ($('#mapa').outerHeight() - $('#tools-panel').children(".panel-content").outerHeight())) + "px)");
    }else{
        $('#arbol').css("height", "calc(100vh - " + ($('#links').outerHeight() + $('#bms').children("h2").outerHeight() + $('#catalog').children("h2").outerHeight() +
        $('#xdata').children("h2").outerHeight() + $('#toc').children("h2").outerHeight() + ($('#mapa').outerHeight() - $('#tools-panel').children(".panel-content").outerHeight())) + "px)");
        $('.tc-ctl-lcat-search').css("height", "calc(100vh - " + ($('#links').outerHeight() + $('#bms').children("h2").outerHeight() + $('#catalog').children("h2").outerHeight() +
        $('#xdata').children("h2").outerHeight() + $('#toc').children("h2").outerHeight() + ($('#mapa').outerHeight() - $('#tools-panel').children(".panel-content").outerHeight())) + "px)");
    }
}*/

var silmeAddWkt = function (
  wktString,
  label,
  stroke,
  fill,
  attributes,
  srs,
  clearLayer
) {
  var wktArray = new Array();
  wktArray.push(wktString);

  var promiseCheckLayerMarkers = new Array();
  var prom = checkLayerMarkers();
  promiseCheckLayerMarkers.push(prom);
  Promise.all(promiseCheckLayerMarkers).then(function (features) {
    var format = new ol.format.WKT();
    var features = [];

    wktArray.forEach((wkt) => {
      features.push(format.readFeature(wkt));
    });

    //var feature = format.readFeature(wktArray);
    if (srs == null) srs = 'EPSG:4326';
    features.forEach((feature) => {
      feature.getGeometry().transform(srs, SITNA.Cfg.crs);
    });
    var featurePromise = features;

    var arrPromises = new Array();
    arrPromises.push(featurePromise);
    Promise.all(arrPromises).then(function (features) {
      features[0].forEach((feature) => {
        //Atributs
        var options = null;
        if (attributes != null) {
          options = new Object();
          data = new Object();
          var matDades = attributes.split('#');
          if (matDades.length > 0) {
            for (var i = 0; i < matDades.length; i++) {
              data[matDades[i].split(':')[0]] = matDades[i].split(':')[1];
            }
            options.data = data;
          }
        }
        //Estil
        if (stroke != null && stroke != '') options['strokeColor'] = stroke;
        if (fill != null && fill != '') options['fillColor'] = stroke;
        if (label != null && label != '') options['label'] = label;
        //Funcions segons geometria
        if (feature.getGeometry().getType() == 'MultiPolygon')
          silmeMap.parent.layers
            .find((layer) => layer.id == 'layerMarkers')
            .addMultiPolygon(feature.getGeometry().getCoordinates(), options);
        if (feature.getGeometry().getType() == 'Polygon')
          silmeMap.parent.layers
            .find((layer) => layer.id == 'layerMarkers')
            .addPolygon(feature.getGeometry().getCoordinates(), options);
        if (feature.getGeometry().getType() == 'LineString')
          silmeMap.parent.layers
            .find((layer) => layer.id == 'layerMarkers')
            .addPolyline(feature.getGeometry().getCoordinates(), options);
      });
      //Zoom a la capa
      setTimeout(function () {
        zoomToLayer('layerMarkers');
      }, 500);
    });
  });
};

function zoomToLayer(layerName) {
  for (var i = 0; i < silmeMap.map.getLayers().getArray().length; i++) {
    try {
      if (
        silmeMap.map.getLayers().getArray()[i].values_.source._tcLayer.id ==
        layerName
      ) {
        var layerMarkers = silmeMap.map.getLayers().getArray()[i];
        var extent = layerMarkers.getSource().getExtent();
        silmeMap.map.getView().fit(extent, silmeMap.map.getSize());
        break;
      }
    } catch (Err) {}
  }
}

function removeLayerFeatures(layerName) {
  for (var i = 0; i < silmeMap.map.getLayers().getArray().length; i++) {
    try {
      if (
        silmeMap.map.getLayers().getArray()[i].values_.source._tcLayer.id ==
        layerName
      ) {
        var layerMarkers = silmeMap.map.getLayers().getArray()[i];
        layerMarkers.getSource().clear();
        break;
      }
    } catch (Err) {}
  }
}

function gup(name, url) {
  if (!url) url = location.href;
  name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
  var regexS = '[\\?&]' + name + '=([^&#]*)';
  var regex = new RegExp(regexS);
  var results = regex.exec(url);
  return results == null ? null : results[1];
}

var ajustarPanell = function () {
  var arrControlsActius = [];
  var heightControlsActiusMenysControlObert = 0;
  var controlObert = null;
  var tocElm = document.getElementById('toc');
  var arbolElm = document.getElementById('arbol');
  var mapaElm = document.getElementById('mapa');
  var toolsPanelElm = document.getElementById('tools-panel');
  var toolsPanelElmContent = toolsPanelElm.querySelector('.panel-content');
  var bmsElmTree = document.querySelector('.tc-ctl-bms-tree');
  var wlmElmContent = document.querySelector('.tc-ctl-wlm-content');

  tocHeightBefore = tocHeightBefore ? tocHeightBefore : 0;

  bmsElmTree.style.height = null;
  bmsElmTree.style.maxHeight = null;
  bmsElmTree.querySelector('ul').style.maxHeight = null;
  wlmElmContent.style.maxHeight = null;
  wlmElmContent.querySelector('ul').style.maxHeight = null;

  if (tocHeightBefore != tocElm.offsetHeight) {
    arbolElm.scrollTop =
      arbolElm.scroll + (tocElm.offsetHeight - tocHeightBefore);
    tocHeightBefore = tocElm.offsetHeight;
  }

  var controls = {
    toc: document.getElementById('toc'),
    links: document.getElementById('links'),
    bms: document.getElementById('bms'),
    catalog: document.getElementById('catalog'),
    xdata: document.getElementById('xdata')
  };

  Object.entries(controls).forEach(([key, value]) => {
    //Agafem el control actiu en aquest moment
    if (
      !value.classList.contains(TC.Consts.classes.COLLAPSED) &&
      value != controls.catalog &&
      value != controls.links
    )
      controlObert = value;
    else value.style.height = null;
    //Agafem els controls que s'han carregat
    if (value.querySelector('h2') != null || value == controls.links) {
      arrControlsActius.push(value);
    }
  });

  if (!controls.catalog.classList.contains(TC.Consts.classes.COLLAPSED)) {
    //Sumem les altures dels controls excepte el que està actiu en aquest moment
    arrControlsActius.forEach((obj) => {
      if (obj == controls.links)
        heightControlsActiusMenysControlObert += obj.offsetHeight;
      else if (obj != controlObert)
        heightControlsActiusMenysControlObert +=
          obj.querySelector('h2').offsetHeight;
      else heightControlsActiusMenysControlObert += obj.offsetHeight;
    });

    arbolElm.style.height =
      window.innerHeight -
      (heightControlsActiusMenysControlObert +
        (mapaElm.offsetHeight - toolsPanelElmContent.offsetHeight)) +
      'px';

    document.querySelector('.tc-ctl-lcat-search').style.height =
      window.innerHeight -
      (heightControlsActiusMenysControlObert +
        (mapaElm.offsetHeight - toolsPanelElmContent.offsetHeight)) +
      'px';
  } else if (controlObert != null) {
    //Sumem les altures dels controls excepte el que està actiu en aquest moment
    arrControlsActius.forEach((obj) => {
      if (obj == controls.links)
        heightControlsActiusMenysControlObert += obj.offsetHeight;
      else if (obj != controlObert)
        heightControlsActiusMenysControlObert +=
          obj.querySelector('h2').offsetHeight;
    });

    controlObert.style.height =
      window.innerHeight -
      (heightControlsActiusMenysControlObert +
        (mapaElm.offsetHeight - toolsPanelElmContent.offsetHeight)) +
      'px';

    switch (true) {
      case controlObert == controls.bms:
        bmsElmTree.style.height = 'unset';
        //bmsElmTree.style.maxHeight = 'unset';
        bmsElmTree.style.maxHeight =
          toolsPanelElmContent.offsetHeight -
          (controls.toc.offsetHeight +
            controls.catalog.offsetHeight +
            controls.xdata.offsetHeight +
            controls.links.offsetHeight +
            controls.bms.querySelector('h2').offsetHeight +
            20) +
          'px';

        bmsElmTree.querySelector('ul').style.maxHeight = 'unset';
        return;
      case controlObert == controls.toc:
        wlmElmContent.style.maxHeight = 'unset';
        wlmElmContent.querySelector('ul').style.maxHeight = 'unset';
        return;
      case controlObert == controls.xdata:
        return;
    }
  }
  //40 és el height en px del header h2, lo que passa que si el header està collapsed dóna 0 i per açò no ho fem per codi
  if (document.querySelector('.tc-ctl-legend-tree') != null) {
    document.querySelector('.tc-ctl-legend-tree').style.height =
      document.querySelector('.tc-ctl-legend-tree').parentElement.parentElement
        .offsetHeight -
      40 +
      'px';
  }
};

var ajustarPanellSilme = function () {
  var arrControlsActius = [];
  var heightControlsActiusMenysControlObert = 0;
  var controlObert = null;
  var mapaElm = document.getElementById('mapa');
  var toolsPanelElm = document.getElementById('silme-panel');

  var controls = {
    localitzar: document.getElementById('localitzar'),
    reports: document.getElementById('reports'),
    measure: document.getElementById('measure'),
    print: document.getElementById('print'),
    share: document.getElementById('share'),
    downloadSilme: document.getElementById('downloadSilme'),
    geolocation: document.getElementById('geolocation')
  };

  Object.entries(controls).forEach(([key, value]) => {
    value.style.height = null;
    //Agafem els controls que s'han carregat
    if (value.querySelector('h2') != null) {
      arrControlsActius.push(value);
    }
    //Agafem el control actiu en aquest moment
    if (!value.classList.contains(TC.Consts.classes.COLLAPSED))
      controlObert = value;
  });

  //Sumem les altures dels controls excepte el que està actiu en aquest moment
  arrControlsActius.forEach((obj) => {
    if (obj != controlObert)
      heightControlsActiusMenysControlObert +=
        obj.querySelector('h2').offsetHeight;
  });

  if (controlObert) {
    //Assignem el height necessàri al control actiu perque ocupi tota l'alçada del panell tinguent en compte els headers dels altres controls
    controlObert.style.height =
      window.innerHeight -
      (heightControlsActiusMenysControlObert +
        (mapaElm.offsetHeight -
          toolsPanelElm.querySelector('.panel-content').offsetHeight)) +
      'px';
  }
};

function matches(el, selector) {
  return (
    el.matches ||
    el.matchesSelector ||
    el.msMatchesSelector ||
    el.mozMatchesSelector ||
    el.webkitMatchesSelector ||
    el.oMatchesSelector
  ).call(el, selector);
}

function getCssProperty(elmId, property) {
  var elem = document.getElementById(elmId);
  return window.getComputedStyle(elem, null).getPropertyValue(property);
}

function amagaPanellEsquerra() {
  document
    .querySelector('#silme-panel')
    .classList.remove('left-collapsed-silme');
  document.querySelector('#silme-panel').classList.add('left-collapsed');
  document.querySelector('#tools-panel').classList.remove('right-opacity');

  document.querySelector('#legend-tab').style.visibility = 'visible';
  document.querySelector('#ovmap-tab').style.visibility = 'visible';
  document.querySelector('#silme-tab').style.visibility = 'visible';
  document.querySelector('#nav').style.visibility = 'visible';
  document.querySelector('#BirdEye').style.visibility = 'visible';
  document.querySelector('#FuScreen').style.visibility = 'visible';
  document.querySelector('.tc-ctl-nav-home').style.visibility = 'visible';
  document.querySelector('.tc-ctl-sv').style.visibility = 'visible';
  document.querySelector('.tc-ctl-sv').style.left = getCssProperty(
    'nav',
    'left'
  );

  if (document.querySelector('.tc-ctl-sb'))
    document.querySelector('.tc-ctl-sb').style.visibility = 'visible';
  if (document.querySelector('.tc-ctl-scl'))
    document.querySelector('.tc-ctl-scl').style.visibility = 'visible';
}
