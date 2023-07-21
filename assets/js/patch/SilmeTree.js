var treeLayers;
var initLayers = new Array();

function silmeTree_update() {
    if ($(".tc-ctl-lcat-tree").html() != null) {
        if (SITNA.Cfg.controls.layerCatalogSilme.layerTreeGroups != null) {
            //treeLayers = SITNA.Cfg.controls.layerCatalogSilme.layers;

            //Busquem quines capes estiren de cada layerTreeGroups

            var content = "";


            if (SITNA.Cfg.controls.layerCatalogSilme.layerTreeGroups.length > 0) {
                if (treeLayers.length > 0) {

                    var neededNode = false;
                    var z = 0;

                    for (var i = 0; i < SITNA.Cfg.controls.layerCatalogSilme.layerTreeGroups.length; i++) {
                        if (SITNA.Cfg.controls.layerCatalogSilme.layers != null) { //mv 20190307
                            for (var j = 0; j < SITNA.Cfg.controls.layerCatalogSilme.layers.length; j++) {
                                if (SITNA.Cfg.controls.layerCatalogSilme.layers[j].parentGroupNode != null) {
                                    if (SITNA.Cfg.controls.layerCatalogSilme.layers[j].parentGroupNode == SITNA.Cfg.controls.layerCatalogSilme.layerTreeGroups[i].id) {
                                        neededNode = true;
                                        break;
                                    }
                                }
                            }
                        }

                        if (neededNode == true) {
                            if (i == 0)//mv 20190404
                                content += '<ul class="tc-ctl-lcat-branch"><li class="tc-ctl-lcat-node" id="' + SITNA.Cfg.controls.layerCatalogSilme.layerTreeGroups[i].id + '"><span>' + SITNA.Cfg.controls.layerCatalogSilme.layerTreeGroups[i].title + '</span>';
                            else
                                content += '<ul class="tc-ctl-lcat-branch"><li class="tc-ctl-lcat-node tc-collapsed" id="' + SITNA.Cfg.controls.layerCatalogSilme.layerTreeGroups[i].id + '"><span>' + SITNA.Cfg.controls.layerCatalogSilme.layerTreeGroups[i].title + '</span>';

                            content += '<ul class="tc-ctl-lcat-branch tc-collapsed">';

                            //Oplim amb els nodes que toquin
                            for (var k = 0; k < treeLayers.length; k++) {
                                if (treeLayers[k].parentGroupNode != null) {
                                    if (treeLayers[k].parentGroupNode == SITNA.Cfg.controls.layerCatalogSilme.layerTreeGroups[i].id) {
                                        if (treeLayers[k].tree != null) {
                                            content += '<li class="tc-ctl-lcat-node tc-collapsed" data-tc-layer-name="' + treeLayers[k].tree.uid.toString() + '" data-tc-layer-uid="' + treeLayers[k].tree.uid + '">';
                                            //delete mv var nodeUid = "[data-tc-layer-uid=" + treeLayers[k].tree.uid + "]";
                                            var nodeUid = "[data-layer-uid=" + treeLayers[k].tree.uid + "]";
                                            content += $(nodeUid)[0].innerHTML;
                                            content += '</li>';
                                        }
                                    }
                                }
                            }
                            content += '</ul>';
                            content += '</li></ul>';
                        }

                    }

                    //Mirem si hi ha alguna capa sense layerTreeGroups

                    neededNode = false;
                    for (var k = 0; k < treeLayers.length; k++) {
                        if (treeLayers[k].parentGroupNode == null) {
                            neededNode = true;
                            break;
                        }
                    }

                    if (neededNode == true) {
                        var titleOtherLayers = "Otros servicios";
                        if (SITNA.Cfg.locale == "ca-CA") titleOtherLayers = "Altres serveis";
                        //===============================   OJO   ================================================================
                        // OJO -- S'ID D'AQUEST NODE HA DE SER ES MATEIX QUE POSEM A LayerCatalog.js --> ctlProto.getLayerRootNode i tamb� a LayerCatalog.js --> .on(TC.Consts.event.LAYERADD...
                        //========================================================================================================
                        content += '<ul class="tc-ctl-lcat-branch"><li class="tc-ctl-lcat-node" id="9999"><span><strong>' + titleOtherLayers + '</strong></span>';
                        content += '<ul class="tc-ctl-lcat-branch">';

                        //Oplim amb els nodes que toquin
                        for (var k = 0; k < treeLayers.length; k++) {
                            if (treeLayers[k].parentGroupNode == null) {
                                //if (treeLayers[k].parentGroupNode == SITNA.Cfg.controls.layerCatalog.layerTreeGroups[i].id){
                                //if (treeLayers[k].tree != null){
                                content += '<li class="tc-ctl-lcat-node tc-collapsed" data-tc-layer-name="' + treeLayers[k].tree.uid.toString() + '" data-tc-layer-uid="' + treeLayers[k].tree.uid + '">';
                                //delete mv var nodeUid = "[data-tc-layer-uid=" + treeLayers[k].tree.uid + "]";
                                var nodeUid = "[data-layer-uid=" + treeLayers[k].tree.uid + "]";
                                content += $(nodeUid)[0].innerHTML;
                                content += '</li>';
                                //}
                                //}
                            }
                        }
                        content += '</ul>';
                        content += '</li></ul>';
                    }

                    document.title = "IDEMenorca - Visor general";


                } else {
                    content += '<div style="text-align: center; margin-top: 5px"><img src="' + SITNA.Cfg.layout + '/img/spinner.gif" alt="loading" align="middle"></div>';
                }

            }

            if (content != "") {
                $(".tc-ctl-lcat-tree").html("");
                $(".tc-ctl-lcat-tree").html(content);
            }

            if ($('.tc-ctl-lcat-branch').find('ul').first().length > 0)//mv 20190404
            {
                $('.tc-ctl-lcat-branch').find('ul').first().toggleClass(TC.Consts.classes.COLLAPSED);
            }


            /*$(".tc-ctl-lcat-btn-info").click(function () {
                if (!$(this).hasClass(TC.Consts.classes.CHECKED)) {
                    customShowLayerInfo($(this));
                    $(this).addClass(TC.Consts.classes.CHECKED);

                } else {
                    $(this).removeClass(TC.Consts.classes.CHECKED);
                    self.hideLayerInfo();
                }
                //if (info!="") alert(info.title);
            });*/

            $(".tc-ctl-lcat-node").click(function (e) { //onCollapseButtonClick
                e.target.blur();
                e.stopPropagation();
                const li = e.target;
                if (li.tagName === 'LI' && !li.classList.contains(self.CLASS + '-leaf')) {
                    if (li.classList.contains(TC.Consts.classes.COLLAPSED)) {
                        li.classList.remove(TC.Consts.classes.COLLAPSED);
                    }
                    else {
                        li.classList.add(TC.Consts.classes.COLLAPSED);
                    }
                    const ul = li.querySelector('ul');
                    if (ul.classList.contains(TC.Consts.classes.COLLAPSED)) {
                        ul.classList.remove(TC.Consts.classes.COLLAPSED);
                    }
                    else {
                        ul.classList.add(TC.Consts.classes.COLLAPSED);
                    }
                }
            });

            var workLayers = $('.tc-ctl-wlm-elm');
            /*
            for (var i = 0; i < workLayers.length; i++) {
                cercaLayersPerLayerName(treeLayers, workLayers[i].dataset.tcLayerName);
                for (var k = 0; k < $('.tc-ctl-lcat-tree').find('.tc-ctl-lcat-node').find('span').length ; k++) {
                    if ($('.tc-ctl-lcat-tree').find('.tc-ctl-lcat-node').find('span')[k].dataset.tooltip != null) {
                        if(workLayers[i].dataset.tcLayerUid == $('.tc-ctl-lcat-tree').find('.tc-ctl-lcat-node').find('span')[k].parentElement.dataset.tcLayerUid) {
                            $('.tc-ctl-lcat-tree').find('.tc-ctl-lcat-node').find('span')[k].parentElement.classList.add(SITNA.Consts.classes.CHECKED);
                        }
                    }
                }
                $('[data-tc-layer-uid="' + workLayers[i].dataset.tcLayerUid + '"]')[0].classList.add(SITNA.Consts.classes.CHECKED);
            }
            */
        }
    }
    ajustarPanell();
    if (initLayers.length > 0) {
        for (var i = 0; i < initLayers.length; i++) {
            var layer = initLayers[i];
            layer.uid = setLayerUid(layer);
            if ($('.tc-ctl-lcat-tree').find("[data-tc-layer-uid='" + layer.uid + "']")[0] != undefined) {//Silme MV
                $('.tc-ctl-lcat-tree').find("[data-tc-layer-uid='" + layer.uid + "']")[0].classList.remove(TC.Consts.classes.LOADING);//Silme MV
                $('.tc-ctl-lcat-tree').find("[data-tc-layer-uid='" + layer.uid + "']")[0].classList.add(TC.Consts.classes.CHECKED);//Silme MV
            }
        }
    }
    /*
    //2 Capes de fons
    if (treeLayers.length > 0) {
        if (secondBaseLayer == false) {
            addSecondBaseLayer();
            setSpan1();
            setSpan2();
            selectB1();
            $('#rangeTransparency').change(function () {
                silmeMap.map.getLayers().array_[1].setOpacity($(this).val() / 100);
                silmeMap.map.render();
            })
        }
    }
    */
}

/*
function customShowLayerInfo(self) {
    layerName = self.parent()[0].attributes[1].value;
    layerUid = self.parent()[0].attributes[2].value;

    var layer = null;
    var info = "";

    if (!layer) {
        for (var k = 0; k < treeLayers.length; k++) {
            var rama = treeLayers[k].tree;
            cercaNode(rama, layerUid);
            if (ret) {
                layer = treeLayers[k];
                info = layer.wrap.getInfo(layerName);
                ret = false;
                break;
            }
        }
    }

    if (layerName.includes(":"))//Silme
        info.layerid = layerName.substr(layerName.indexOf(":") + 1);
    else
        info.layerid = layerName;


    var $tree = $("#catalog").find('.tc-ctl-lcat-btn-info');
    $tree.removeClass(TC.Consts.classes.CHECKED);

    var $info = $("#catalog").find('.tc-ctl-lcat-info');

    if (!self.hasClass(TC.Consts.classes.CHECKED)) {
        self.addClass(TC.Consts.classes.CHECKED);
        //showLayerInfo
        $info.removeClass(TC.Consts.classes.HIDDEN);
        //$info.html(info.abstract);
        dust.render("tc-ctl-lcat-info", info, function (err, out) {
            $info.html(out)
        });
        $info.find('.tc-ctl-lcat-info-close').on(TC.Consts.event.CLICK, function () {
            $("#catalog").find('.tc-ctl-lcat-info-close').removeClass(TC.Consts.classes.CHECKED);
            $("#catalog").find('.tc-ctl-lcat-info').addClass(TC.Consts.classes.HIDDEN);
            $("#catalog").find('.tc-ctl-lcat-btn-info, .tc-ctl-lcat-search-btn-info').removeClass(TC.Consts.classes.CHECKED);
        });

    } else {
        self.removeClass(TC.Consts.classes.CHECKED);
        $("#catalog").find('.tc-ctl-lcat-btn-info, .tc-ctl-lcat-search-btn-info').removeClass(TC.Consts.classes.CHECKED);
        $("#catalog").find('.tc-ctl-lcat-info').addClass(TC.Consts.classes.HIDDEN);
    }
};

function showLayerInfo (layer, name) {
    var self = this;
    var result = null;

    var $info = self._$div.find('.' + self.CLASS + '-info');

    var toggleInfo = function (layerName, info) {
        var result = false;
        var lName = $info.data(_dataKeys.LAYERNAME);
        //if (lName !== undefined && lName.toString() === layerName) {
        //    $info.data(_dataKeys.LAYERNAME, '');
        //    $info.removeClass(TC.Consts.classes.HIDDEN);
        //}
        //else {
        if (info) {
            result = true;
            $info.data(_dataKeys.LAYERNAME, layerName);
            $info.removeClass(TC.Consts.classes.HIDDEN);
            dust.render(self.CLASS + '-info', info, function (err, out) {
                $info.html(out);
                if (err) {
                    TC.error(err);
                }
                $info.find('.' + self.CLASS + '-info-close').on(TC.Consts.event.CLICK, function () {
                    self.hideLayerInfo();
                });
            });
        }
        //}
        return result;
    };

    self._$div.find('.' + self.CLASS + '-btn-info, .' + self.CLASS + '-search-btn-info').removeClass(TC.Consts.classes.CHECKED);

    self._$roots.each(function (idx, elm) {
        var $root = $(elm);
        if ($root.data(_dataKeys.LAYER) === layer) {
            var $as = $root.find('.' + self.CLASS + '-btn-info');
            $as.each(function (i, e) {
                var $a = $(e);
                var n = $a.parent().data(_dataKeys.LAYERNAME).toString();
                if (n === name) {
                    var info = $a.data(_dataKeys.LAYERINFO);
                    self._$div.find('li [data-tc-layer-name="' + n + '"] > button').toggleClass(TC.Consts.classes.CHECKED, toggleInfo(n, info));
                    result = info;
                    return false;
                }
            });
            return false;
        }
    });

    return result;
};

function hideLayerInfo() {
    $('.tc-ctl-lcat-info').addClass(TC.Consts.classes.HIDDEN);
    /*var self = this;
    self._$div.find('.' + self.CLASS + '-btn-info, .' + self.CLASS + '-search-btn-info').removeClass(TC.Consts.classes.CHECKED);
    self._$div.find('.' + self.CLASS + '-info').addClass(TC.Consts.classes.HIDDEN);*/
/*
};
*/
//Silme - Funci� recursiva que recorre tot l'arbre
function cercaNode(rama, layerUid) {
    if (rama != null) {
        if (rama.children.length > 0) {
            for (var m = 0; m < rama.children.length; m++) {
                if (rama.children[m].uid == layerUid) {
                    ret = true;
                    break;
                } else if (rama.children[m].children.length < 0) {
                    //
                }
                else if (rama.children[m].children.length > 0) {
                    cercaNode(rama.children[m], layerUid)
                }

            }
        }
    } else {
        var err = "";
    }
}

//Silme - Funci� recursiva que recorre tot l'arbre
function cercaNodePerNom(rama, layerName) {
    if (rama.children.length > 0) {
        for (var m = 0; m < rama.children.length; m++) {
            if (rama.children[m].name == layerName) {
                ret = true;
                break;
            } else if (rama.children[m].children.length < 0) {
                //
            }
            else if (rama.children[m].children.length > 0) {
                cercaNodePerNom(rama.children[m], layerName);
            }

        }
        return null;
    }
}

//Silme 
function isEmpty(obj) {
    for (var key in obj) {
        if (obj.hasOwnProperty(key))
            return false;
    }
    return true;
}

function cercaLayers(layers, uid) {
    if (layers.tree) {
        if (layers.tree.children) {
            for (var i = 0; i < layers.tree.children.length; i++) {
                if (layers.tree.children[i].uid == uid) {
                    //trobat
                    return layers.tree.children[i];
                    break;
                } else {
                    var tmpLayer = cercaLayers(layers.tree.children[i], uid);
                    if (tmpLayer != null)
                        return tmpLayer;
                }
            }
        }
    } else if (layers.children) {
        for (var i = 0; i < layers.children.length; i++) {
            if (layers.children[i].uid == uid) {
                //trobat
                return layers.children[i];
                break;
            } else {
                var tmpLayer = cercaLayers(layers.children[i], uid);
                if (tmpLayer != null)
                    return tmpLayer;
            }
        }
    } else if (layers.length) {
        for (var i = 0; i < layers.length; i++) {
            if (layers[i].uid == uid) {
                //trobat
                return layers[i];
                break;
            } else {
                var tmpLayer = cercaLayers(layers[i], uid);
                if (tmpLayer != null)
                    return tmpLayer;
            }
        }
    } else {
        //no trobat
        return null;
    }
}

function cercaLayersPerLayerName(layers, layerName) {
    if (layers.tree) {
        if (layers.tree.children) {
            for (var i = 0; i < layers.tree.children.length; i++) {
                if (layers.tree.children[i].name == layerName) {
                    //trobat
                    return layers.tree.children[i];
                    break;
                } else {
                    var tmpLayer = cercaLayersPerLayerName(layers.tree.children[i], layerName);
                    if (tmpLayer != null)
                        return tmpLayer;
                }
            }
        }
    } else if (layers.children) {
        for (var i = 0; i < layers.children.length; i++) {
            if (layers.children[i].name == layerName) {
                //trobat
                return layers.children[i];
                break;
            } else {
                var tmpLayer = cercaLayersPerLayerName(layers.children[i], layerName);
                if (tmpLayer != null)
                    return tmpLayer;
            }
        }
    } else if (layers.length) {
        for (var i = 0; i < layers.length; i++) {
            if (layers[i].name == layerName) {
                //trobat
                return layers[i];
                break;
            } else {
                var tmpLayer = cercaLayersPerLayerName(layers[i], layerName);
                if (tmpLayer != null)
                    return tmpLayer;
            }
        }
    } else {
        //no trobat
        return null;
    }
}

function setLayerUid(layer) {
    for (var i = 0; i < treeLayers.length; i++) {
        var titol = "";
        if (layer.tree == null) {
            titol = layer.title;
        }
        else {
            titol = layer.tree.title;
        }
        if (treeLayers[i].title == titol) {
            try {
                for (var j = 0; j < treeLayers[i].tree.children.length; j++) {
                    if (layer.uid != null) break;
                    try {
                        if (treeLayers[i].tree.children[j].children.length > 0) {
                            for (var k = 0; k < treeLayers[i].tree.children[j].children.length; k++) {
                                if (layer.uid != null) break;
                                try {
                                    if (treeLayers[i].tree.children[j].children[k].children.length > 0) {
                                        try {
                                            for (var n = 0; n < treeLayers[i].tree.children[j].children[k].children.length; k++) {
                                                if (treeLayers[i].tree.children[j].children[k].children[n].name == layer.names[0]) {
                                                    layer.uid = treeLayers[i].tree.children[j].children[k].children[n].uid;
                                                    break;
                                                }
                                            }
                                        }
                                        catch (err) { }
                                    }
                                    else {
                                        if (treeLayers[i].tree.children[j].children[k].name == layer.names[0]) {
                                            layer.uid = treeLayers[i].tree.children[j].children[k].uid;
                                            break;
                                        }
                                    }
                                }
                                catch (err) { }
                            }
                        }
                        else {
                            if (treeLayers[i].tree.children[j].name == layer.names[0]) {
                                layer.uid = treeLayers[i].tree.children[j].uid;
                                break;
                            }
                        }

                    }
                    catch (err) { }
                }
            }
            catch (err) { }

        }
    }
    return layer.uid;
}