var secondBaseLayer = false;
var activeBaseLayer = 0;
var capa1;
var capa2;
var capa1Layer;
var capa2Layer;

async function addSecondBaseLayer() {
  //var IDEmenorca_MapaBlanc = silmeMap.parent.baseLayers.filter(function (el) { return el.layerNames == "base_referencia:mapa_blanc" });
  var secondBaseLayerSource;
  var layerToAdd;
  var addedLayer;
  var workingMap = TC.Map.get(document.querySelector('.tc-map'));

  for (var i = 0; i < silmeMap.parent.baseLayers.length; i++) {
    var found = silmeMap.map
      .getLayers()
      .array_.some((e) => e._wrap.parent === silmeMap.parent.baseLayers[i]);
    // Si no el troba vol dir que no està dins el map, per tant el podem afegir com a segona capa de fons
    if (!found) {
      secondBaseLayerSource = silmeMap.parent.baseLayers[i];
      secondBaseLayer = true;
      break;
    }
  }

  if (secondBaseLayer) {
    //silmeMap.map.getLayers().insertAt(0, secondBaseLayerSource.wrap.layer);
    secondBaseLayerSource.options.stealth = true;
    layerToAdd = {
      format: secondBaseLayerSource.format,
      hideTitle: false,
      hideTree: false,
      stealth: secondBaseLayerSource.options.stealth,
      id: 'second-1',
      layerNames: secondBaseLayerSource.layerNames,
      title: secondBaseLayerSource.title,
      type: secondBaseLayerSource.type,
      uid: secondBaseLayerSource.id,
      matrixSet: secondBaseLayerSource.matrixSet,
      url: secondBaseLayerSource.url
    };

    //addedLayer = await workingMap.addLayer(layerToAdd).then(function () {
    addedLayer = await workingMap
      .addLayer(layerToAdd)
      .then(function () {
        console.info('ok');
        setSpan(2);
        setSpan(1);
        selectB1();
      })
      .catch(function (errData) {
        console.error(errData);
      });

    var idx = 0;
    for (var i = 0; i < workingMap.layers.length; i++) {
      if (!workingMap.layers[i].isBase) break;
      else idx++;
    }

    workingMap.insertLayer(
      workingMap.getLayer('second-1'),
      getLastBaseMapIndex()
    );
  }
}

function setSpan1() {
  setSpan(1);

  //var branch = document.querySelector('.tc-ctl-bms-branch');
  //for (var i = 0; i < branch.children.length; i++) {
  //    branch.children[i].children[0].children[1].style.borderColor = "rgba(255, 0, 0, 0)";
  //    branch.children[i].children[0].children[1].style.backgroundColor = "";
  //    branch.children[i].children[0].children[0].disabled = false;
  //    branch.children[i].children[0].style.cursor = "pointer";
  //}

  //capa1 = silmeMap.map.getLayers().array_[0];
  //capa1Layer = getLayerName(capa1);

  //capa2 = silmeMap.map.getLayers().array_[1];
  //capa2Layer = getLayerName(capa2);

  //for (var i = 0; i < branch.children.length; i++) {
  //    if (branch.children[i].attributes[1].value == capa1Layer) {
  //        document.querySelector('#lbl_baseLayer1').innerHTML = branch.children[i].children[1].children[0].innerText;
  //        branch.children[i].children[0].children[1].style.backgroundColor = "rgba(122, 133, 0, 0.5)";
  //        branch.children[i].children[0].children[0].disabled = true;
  //        branch.children[i].children[0].style.cursor = "default";
  //        break;
  //    }
  //}

  ////Deshabilitem 2a capa base
  //for (var i = 0; i < branch.children.length; i++) {
  //    if (branch.children[i].attributes[1].value == capa2Layer) {
  //        branch.children[i].children[0].children[1].style.backgroundColor = "rgba(0,124,206,0.2)";
  //        branch.children[i].children[0].children[0].disabled = true;
  //        branch.children[i].children[0].style.cursor = "default";
  //        break;
  //    }
  //}

  //document.querySelector('#rangeTransparency').value = 0;
  //capa1.setOpacity(1);
  //capa2.setOpacity(0);
  //silmeMap.map.render();
}

function setSpan2() {
  setSpan(2);

  //var branch = document.querySelector('.tc-ctl-bms-branch');

  //for (var i = 0; i < branch.children.length; i++) {
  //    branch.children[i].children[0].children[1].style.borderColor = "rgba(255, 0, 0, 0)";
  //    branch.children[i].children[0].children[1].style.backgroundColor = "";
  //    branch.children[i].children[0].children[0].disabled = false;
  //    branch.children[i].children[0].style.cursor = "pointer";

  //}

  //capa1 = silmeMap.map.getLayers().array_[0];
  //capa1Layer = getLayerName(capa1);

  //capa2 = silmeMap.map.getLayers().array_[1];
  //capa2Layer = getLayerName(capa2);

  //for (var i = 0; i < branch.children.length; i++) {
  //    if (branch.children[i].attributes[1].value == capa2Layer) {
  //        document.querySelector('#lbl_baseLayer2').innerHTML = branch.children[i].children[1].children[0].innerText;
  //        branch.children[i].children[0].children[1].style.backgroundColor = "rgba(0,124,206,0.58)"
  //        branch.children[i].children[0].children[0].disabled = true;
  //        branch.children[i].children[0].style.cursor = "default";
  //        break;
  //    }
  //}

  ////Deshabilitem 1a capa base
  //for (var i = 0; i < branch.children.length; i++) {
  //    if (branch.children[i].attributes[1].value == capa1Layer) {
  //        branch.children[i].children[0].children[1].style.backgroundColor = "rgba(122, 133, 0,0.2)";
  //        branch.children[i].children[0].children[0].disabled = true;
  //        branch.children[i].children[0].style.cursor = "default";
  //        break;
  //    }
  //}

  ////$("#rangeTransparency").val(100);
  //document.querySelector('#rangeTransparency').value = 100;
  //capa1.setOpacity(1);
  //capa2.setOpacity(1);
  //silmeMap.map.render();
}

function selectB1() {
  var branch = document.querySelector('.tc-ctl-bms-branch');
  for (var i = 0; i < branch.children.length; i++) {
    branch.children[i].children[0].children[1].style.borderColor =
      'rgba(255, 0, 0, 0)';
    branch.children[i].children[0].children[1].style.backgroundColor = '';
    branch.children[i].children[0].children[0].disabled = false;
    branch.children[i].children[0].style.cursor = 'pointer';
  }

  capa1 = silmeMap.map.getLayers().array_[0];
  capa1Layer = getLayerName(capa1);

  //capa2 = silmeMap.map.getLayers().array_[1];
  capa2 = TC.Map.get(document.querySelector('.tc-map')).getLayer('second-1')
    .wrap.layer;
  capa2Layer = getLayerName(capa2);

  for (var i = 0; i < branch.children.length; i++) {
    if (branch.children[i].attributes[1].value == capa1Layer) {
      document.querySelector('#lbl_baseLayer1').innerHTML =
        branch.children[i].children[1].children[0].innerText;
      branch.children[i].children[0].children[1].style.backgroundColor =
        'rgba(122, 133, 0, 0.5)';
      branch.children[i].children[0].children[0].disabled = true;
      branch.children[i].children[0].style.cursor = 'default';
      break;
    }
  }

  //Deshabilitem 2a capa base
  for (var i = 0; i < branch.children.length; i++) {
    if (branch.children[i].attributes[1].value == capa2Layer) {
      branch.children[i].children[0].children[1].style.backgroundColor =
        'rgba(0,124,206,0.2)';
      branch.children[i].children[0].children[0].disabled = true;
      branch.children[i].children[0].style.cursor = 'default';
      break;
    }
  }

  document.querySelector('#td_baseLayer1').classList.add('activo');
  document.querySelector('#td_baseLayer2').classList.remove('activo');
  activeBaseLayer = 0;
  document.querySelector('#td_baseLayer1').style.backgroundColor =
    'rgb(142,154,4)';
  document.querySelector('#td_baseLayer2').style.backgroundColor =
    'rgb(166,166,167)';
}

function selectB2() {
  var branch = document.querySelector('.tc-ctl-bms-branch');
  for (var i = 0; i < branch.children.length; i++) {
    branch.children[i].children[0].children[1].style.borderColor =
      'rgba(255, 0, 0, 0)';
    branch.children[i].children[0].children[1].style.backgroundColor = '';
    branch.children[i].children[0].children[0].disabled = false;
    branch.children[i].children[0].style.cursor = 'pointer';
  }

  capa1 = silmeMap.map.getLayers().array_[0];
  capa1Layer = getLayerName(capa1);

  //capa2 = silmeMap.map.getLayers().array_[1];
  capa2 = TC.Map.get(document.querySelector('.tc-map')).getLayer('second-1')
    .wrap.layer;
  capa2Layer = getLayerName(capa2);

  for (var i = 0; i < branch.children.length; i++) {
    if (branch.children[i].attributes[1].value == capa2Layer) {
      document.querySelector('#lbl_baseLayer2').innerHTML =
        branch.children[i].children[1].children[0].innerText;
      branch.children[i].children[0].children[1].style.backgroundColor =
        'rgba(0,124,206,0.58)';
      branch.children[i].children[0].children[0].disabled = true;
      branch.children[i].children[0].style.cursor = 'default';
      break;
    }
  }

  //Deshabilitem 1a capa base
  for (var i = 0; i < branch.children.length; i++) {
    if (branch.children[i].attributes[1].value == capa1Layer) {
      branch.children[i].children[0].children[1].style.backgroundColor =
        'rgba(122, 133, 0,0.2)';
      branch.children[i].children[0].children[0].disabled = true;
      branch.children[i].children[0].style.cursor = 'default';
      break;
    }
  }

  document.querySelector('#td_baseLayer2').classList.add('activo');
  document.querySelector('#td_baseLayer1').classList.remove('activo');
  activeBaseLayer = 1;
  document.querySelector('#td_baseLayer2').style.backgroundColor =
    'rgb(0,124,206)';
  document.querySelector('#td_baseLayer1').style.backgroundColor =
    'rgb(166,166,167)';
}

function getLayerName(layer) {
  var layerName = layer.getSource().layer_;
  if (!layerName) layerName = layer.getSource().params_?.LAYERS; // *
  return layerName;
}

// *
// antes se hacía doble comprovación así:
// (capa2.type == "IMAGE" && branch.children[i].attributes[1].value == capa2.getSource().params_.LAYERS)) {
// en SITMUN se permiten WMS como basemaps y por lo tanto el "capa2.type == "IMAGE"" no nos sirve

function setSpan(color) {
  var branch = document.querySelector('.tc-ctl-bms-branch');
  var colorActiu;
  var colorInactiu;
  var capaLayerActiu;
  var capaLayerInactiu;
  var labelId;

  resetInputsFromBranch(branch);

  capa1 = silmeMap.map.getLayers().array_[0];
  //capa2 = silmeMap.map.getLayers().array_[1];
  capa2 = TC.Map.get(document.querySelector('.tc-map')).getLayer('second-1')
    .wrap.layer;

  capaLayer1 = getLayerName(capa1);
  capaLayer2 = getLayerName(capa2);

  if (color == 1) {
    colorActiu = 'rgba(122, 133, 0, 0.5)';
    colorInactiu = 'rgba(0, 124, 206, 0.2)';
    capaLayerActiu = capaLayer1;
    capaLayerInactiu = capaLayer2;
    labelId = '#lbl_baseLayer1';
  } else {
    colorActiu = 'rgba(0,124,206,0.58)';
    colorInactiu = 'rgba(122, 133, 0,0.2)';
    capaLayerActiu = capaLayer2;
    capaLayerInactiu = capaLayer1;
    labelId = '#lbl_baseLayer2';
  }

  styleInputBasemap(branch, capaLayerActiu, colorActiu, labelId);
  styleInputBasemap(branch, capaLayerInactiu, colorInactiu);

  if (color == 1) {
    document.querySelector('#rangeTransparency').value = 0;
    capa1.setOpacity(1);
    capa2.setOpacity(0);
  } else {
    document.querySelector('#rangeTransparency').value = 100;
    capa1.setOpacity(1);
    capa2.setOpacity(1);
  }

  silmeMap.map.render();
}

function resetInputsFromBranch(branch) {
  for (var i = 0; i < branch.children.length; i++) {
    var label = branch.children[i].children[0];
    label.children[1].style.borderColor = 'rgba(255, 0, 0, 0)';
    label.children[1].style.backgroundColor = '';
    label.children[0].disabled = false;
    label.style.cursor = 'pointer';
  }
}

function styleInputBasemap(branch, capaLayer, color, labelId) {
  var lblBasemap;
  if (labelId) lblBasemap = document.querySelector(labelId);
  for (var i = 0; i < branch.children.length; i++) {
    if (branch.children[i].attributes[1].value == capaLayer) {
      var label = branch.children[i].children[0];
      if (labelId)
        lblBasemap.innerHTML =
          branch.children[i].children[1].children[0].innerText;
      label.children[1].style.backgroundColor = color;
      label.children[0].disabled = true;
      label.style.cursor = 'default';
      break;
    }
  }
}
