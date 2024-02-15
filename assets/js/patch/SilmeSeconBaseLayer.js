var secondBaseLayer = false;
var activeBaseLayer = 0;
var capa1;
var capa2;
var capa1Layer;
var capa2Layer;

function addSecondBaseLayer() {

  //var IDEmenorca_MapaBlanc = silmeMap.parent.baseLayers.filter(function (el) { return el.layerNames == "base_referencia:mapa_blanc" });
  var IDEmenorca_MapaBlanc = silmeMap.parent.baseLayers.filter(function (el) { return el.layerNames == "base_referencia:base_referencia" });

  silmeMap.map.getLayers().insertAt(0, IDEmenorca_MapaBlanc[0].wrap.layer);

  secondBaseLayer = true;
  //$("lbl_baseLayer1").html();
}

function setSpan1() {
  var branch = document.querySelector('.tc-ctl-bms-branch');
  for (var i = 0; i < branch.children.length; i++) {
    branch.children[i].children[0].children[1].style.borderColor = "rgba(255, 0, 0, 0)";
    branch.children[i].children[0].children[1].style.backgroundColor = "";
    branch.children[i].children[0].children[0].disabled = false;
    branch.children[i].children[0].style.cursor = "pointer";
  }

  capa1 = silmeMap.map.getLayers().array_[0];
  capa1Layer = getLayerName(capa1);

  capa2 = silmeMap.map.getLayers().array_[1];
  capa2Layer = getLayerName(capa2);

  for (var i = 0; i < branch.children.length; i++) {
    if (branch.children[i].attributes[1].value == capa1Layer) {
      document.querySelector('#lbl_baseLayer1').innerHTML = branch.children[i].children[1].children[0].innerText;
      branch.children[i].children[0].children[1].style.backgroundColor = "rgba(122, 133, 0, 0.5)";
      branch.children[i].children[0].children[0].disabled = true;
      branch.children[i].children[0].style.cursor = "default";
      break;
    }
  }

  //Deshabilitem 2a capa base
  for (var i = 0; i < branch.children.length; i++) {
    if (branch.children[i].attributes[1].value == capa2Layer) {
      branch.children[i].children[0].children[1].style.backgroundColor = "rgba(0,124,206,0.2)";
      branch.children[i].children[0].children[0].disabled = true;
      branch.children[i].children[0].style.cursor = "default";
      break;
    }
  }

  document.querySelector('#rangeTransparency').value = 0;
  capa1.setOpacity(1);
  capa2.setOpacity(0);
  silmeMap.map.render();

}

function setSpan2() {
  var branch = document.querySelector('.tc-ctl-bms-branch');

  for (var i = 0; i < branch.children.length; i++) {
    branch.children[i].children[0].children[1].style.borderColor = "rgba(255, 0, 0, 0)";
    branch.children[i].children[0].children[1].style.backgroundColor = "";
    branch.children[i].children[0].children[0].disabled = false;
    branch.children[i].children[0].style.cursor = "pointer";

  }

  capa1 = silmeMap.map.getLayers().array_[0];
  capa1Layer = getLayerName(capa1);

  capa2 = silmeMap.map.getLayers().array_[1];
  capa2Layer = getLayerName(capa2);

  for (var i = 0; i < branch.children.length; i++) {
    if (branch.children[i].attributes[1].value == capa2Layer) {
      document.querySelector('#lbl_baseLayer2').innerHTML = branch.children[i].children[1].children[0].innerText;
      branch.children[i].children[0].children[1].style.backgroundColor = "rgba(0,124,206,0.58)"
      branch.children[i].children[0].children[0].disabled = true;
      branch.children[i].children[0].style.cursor = "default";
      break;
    }
  }

  //Deshabilitem 1a capa base
  for (var i = 0; i < branch.children.length; i++) {
    if (branch.children[i].attributes[1].value == capa1Layer) {
      branch.children[i].children[0].children[1].style.backgroundColor = "rgba(122, 133, 0,0.2)";
      branch.children[i].children[0].children[0].disabled = true;
      branch.children[i].children[0].style.cursor = "default";
      break;
    }
  }

  //$("#rangeTransparency").val(100);
  document.querySelector('#rangeTransparency').value = 100;
  capa1.setOpacity(1);
  capa2.setOpacity(1);
  silmeMap.map.render();
}

function selectB1() {
  var branch = document.querySelector('.tc-ctl-bms-branch');
  for (var i = 0; i < branch.children.length; i++) {
    branch.children[i].children[0].children[1].style.borderColor = "rgba(255, 0, 0, 0)";
    branch.children[i].children[0].children[1].style.backgroundColor = "";
    branch.children[i].children[0].children[0].disabled = false;
    branch.children[i].children[0].style.cursor = "pointer";
  }

  capa1 = silmeMap.map.getLayers().array_[0];
  capa1Layer = getLayerName(capa1);

  capa2 = silmeMap.map.getLayers().array_[1];
  capa2Layer = getLayerName(capa2);

  for (var i = 0; i < branch.children.length; i++) {
    if (branch.children[i].attributes[1].value == capa1Layer) {
      document.querySelector('#lbl_baseLayer1').innerHTML = branch.children[i].children[1].children[0].innerText;
      branch.children[i].children[0].children[1].style.backgroundColor = "rgba(122, 133, 0, 0.5)";
      branch.children[i].children[0].children[0].disabled = true;
      branch.children[i].children[0].style.cursor = "default";
      break;
    }
  }

  //Deshabilitem 2a capa base
  for (var i = 0; i < branch.children.length; i++) {
    if (branch.children[i].attributes[1].value == capa2Layer) {
      branch.children[i].children[0].children[1].style.backgroundColor = "rgba(0,124,206,0.2)";
      branch.children[i].children[0].children[0].disabled = true;
      branch.children[i].children[0].style.cursor = "default";
      break;
    }
  }

  document.querySelector('#td_baseLayer1').classList.add('activo');
  document.querySelector('#td_baseLayer2').classList.remove('activo');
  activeBaseLayer = 0;
  document.querySelector('#td_baseLayer1').style.backgroundColor = "rgb(142,154,4)";
  document.querySelector('#td_baseLayer2').style.backgroundColor = "rgb(166,166,167)";

}

function selectB2() {
  var branch = document.querySelector('.tc-ctl-bms-branch');
  for (var i = 0; i < branch.children.length; i++) {
    branch.children[i].children[0].children[1].style.borderColor = "rgba(255, 0, 0, 0)";
    branch.children[i].children[0].children[1].style.backgroundColor = "";
    branch.children[i].children[0].children[0].disabled = false;
    branch.children[i].children[0].style.cursor = "pointer";
  }

  capa1 = silmeMap.map.getLayers().array_[0];
  capa1Layer = getLayerName(capa1);

  capa2 = silmeMap.map.getLayers().array_[1];
  capa2Layer = getLayerName(capa2);

  for (var i = 0; i < branch.children.length; i++) {
    if (branch.children[i].attributes[1].value == capa2Layer) {
      document.querySelector('#lbl_baseLayer2').innerHTML = branch.children[i].children[1].children[0].innerText;
      branch.children[i].children[0].children[1].style.backgroundColor = "rgba(0,124,206,0.58)"
      branch.children[i].children[0].children[0].disabled = true;
      branch.children[i].children[0].style.cursor = "default";
      break;
    }
  }

  //Deshabilitem 1a capa base
  for (var i = 0; i < branch.children.length; i++) {
    if (branch.children[i].attributes[1].value == capa1Layer) {
      branch.children[i].children[0].children[1].style.backgroundColor = "rgba(122, 133, 0,0.2)";
      branch.children[i].children[0].children[0].disabled = true;
      branch.children[i].children[0].style.cursor = "default";
      break;
    }
  }

  document.querySelector('#td_baseLayer2').classList.add('activo');
  document.querySelector('#td_baseLayer1').classList.remove('activo');
  activeBaseLayer = 1;
  document.querySelector('#td_baseLayer2').style.backgroundColor = "rgb(0,124,206)";
  document.querySelector('#td_baseLayer1').style.backgroundColor = "rgb(166,166,167)";
}

function getLayerName(layer) {
  var layerName = layer.getSource().layer_;
  if (!layerName) layerName = layer.getSource().params_?.LAYERS;
  return layerName;
}
