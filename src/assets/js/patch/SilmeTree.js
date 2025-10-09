var treeLayers;
var initLayers = new Array();

// Funció recursiva que recorre tot l'arbre
function cercaNode(rama, layerUid) {
  if (rama != null) {
    if (rama.children.length > 0) {
      for (const m in rama.children) {
        if (m.uid === layerUid) {
          ret = true;
          break;
        } else if (m.children.length < 0) {
          // Do nothing...
        } else if (m.children.length > 0) {
          cercaNode(m, layerUid);
        }
      }
    }
  } else {
    const err = '';
  }
}

// Funció recursiva que recorre tot l'arbre
function cercaNodePerNom(rama, layerName) {
  if (rama.children.length > 0) {
    for (const m in rama.children) {
      if (m.name === layerName) {
        ret = true;
        break;
      } else if (m.children.length < 0) {
        // Do nothing...
      } else if (m.children.length > 0) {
        cercaNodePerNom(m, layerName);
      }
    }
    return null;
  }
}

// TODO: Documentar
function isEmpty(obj) {
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) return false;
  }
  return true;
}

// TODO: Documentar
function cercaLayers(layers, uid) {
  if (layers.tree) {
    if (layers.tree.children) {
      for (var i = 0; i < layers.tree.children.length; i++) {
        if (layers.tree.children[i].uid == uid) {
          // trobat
          return layers.tree.children[i];
        } else {
          var tmpLayer = cercaLayers(layers.tree.children[i], uid);
          if (tmpLayer != null) return tmpLayer;
        }
      }
    }
  } else if (layers.children) {
    for (var i = 0; i < layers.children.length; i++) {
      if (layers.children[i].uid == uid) {
        // trobat
        return layers.children[i];
      } else {
        var tmpLayer = cercaLayers(layers.children[i], uid);
        if (tmpLayer != null) return tmpLayer;
      }
    }
  } else if (layers.length) {
    for (var i = 0; i < layers.length; i++) {
      if (layers[i].uid == uid) {
        // trobat
        return layers[i];
      } else {
        var tmpLayer = cercaLayers(layers[i], uid);
        if (tmpLayer != null) return tmpLayer;
      }
    }
  } else {
    //no trobat
    return null;
  }
}


// TODO: Documentar
function cercaLayersPerLayerName(layers, layerName) {
  if (layers.tree) {
    if (layers.tree.children) {
      for (var i = 0; i < layers.tree.children.length; i++) {
        if (layers.tree.children[i].name == layerName) {
          //trobat
          return layers.tree.children[i];
        } else {
          var tmpLayer = cercaLayersPerLayerName(
            layers.tree.children[i],
            layerName
          );
          if (tmpLayer != null) return tmpLayer;
        }
      }
    }
  } else if (layers.children) {
    for (var i = 0; i < layers.children.length; i++) {
      if (layers.children[i].name == layerName) {
        //trobat
        return layers.children[i];
      } else {
        var tmpLayer = cercaLayersPerLayerName(layers.children[i], layerName);
        if (tmpLayer != null) return tmpLayer;
      }
    }
  } else if (layers.length) {
    for (var i = 0; i < layers.length; i++) {
      if (layers[i].name == layerName) {
        //trobat
        return layers[i];
      } else {
        var tmpLayer = cercaLayersPerLayerName(layers[i], layerName);
        if (tmpLayer != null) return tmpLayer;
      }
    }
  } else {
    //no trobat
    return null;
  }
}


// TODO: Documentar
function setLayerUid(layer) {
  for (const treeLayer in treeLayers) {
    let titol = '';
    if (layer.tree == null) {
      titol = layer.title;
    } else {
      titol = layer.tree.title;
    }

    if (treeLayer.title === titol) {
      try {
        for (const j = 0; j < treeLayer.tree.children.length; j++) {
          if (layer.uid != null) break;
          try {
            if (treeLayer.tree.children[j].children.length > 0) {
              for (
                const k = 0;
                k < treeLayer.tree.children[j].children.length;
                k++
              ) {
                if (layer.uid != null) break;

                try {
                  if (
                    treeLayer.tree.children[j].children[k].children.length > 0
                  ) {
                    try {
                      for (
                        const n = 0;
                        n <
                        treeLayer.tree.children[j].children[k].children.length;
                        k++
                      ) {
                        if (
                          treeLayer.tree.children[j].children[k].children[n]
                            .name === layer.names[0]
                        ) {
                          layer.uid =
                            treeLayer.tree.children[j].children[k].children[
                              n
                            ].uid;
                          break;
                        }
                      }
                    } catch (err) {}
                  } else {
                    if (
                      treeLayer.tree.children[j].children[k].name ===
                      layer.names[0]
                    ) {
                      layer.uid = treeLayer.tree.children[j].children[k].uid;
                      break;
                    }
                  }
                } catch (err) {}
              }
            } else {
              if (treeLayer.tree.children[j].name === layer.names[0]) {
                layer.uid = treeLayer.tree.children[j].uid;
                break;
              }
            }
          } catch (err) {}
        }
      } catch (err) {}
    }
  }

  return layer.uid;
}
