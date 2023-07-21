var ajustarPanell = function () {
    var arrControlsActius = [];
    var heightControlsActiusMenysControlObert = 0;
    var controlObert = null;
    var tocElm = document.getElementById('toc');
    //var arbolElm = document.getElementById('arbol');
    var mapaElm = document.getElementById('mapa');
    var toolsPanelElm = document.getElementById('tools-panel');
    var toolsPanelElmContent = toolsPanelElm.querySelector('.panel-content');
    var bmsElmTree = document.querySelector('.tc-ctl-bms-tree');
    var wlmElmContent = document.querySelector('.tc-ctl-wlm-content');

    tocHeightBefore = tocHeightBefore ? tocHeightBefore : 0;

    bmsElmTree.style.height = null;
    bmsElmTree.style.maxHeight = null;
    bmsElmTree.querySelector('ul').style.maxHeight = null;
    if (wlmElmContent != null) {//TODO - DELETE
        wlmElmContent.style.maxHeight = null;
        wlmElmContent.querySelector('ul').style.maxHeight = null;
    }

    if (tocHeightBefore != tocElm.offsetHeight) {
        //arbolElm.scrollTop = arbolElm.scroll + (tocElm.offsetHeight - tocHeightBefore);
        tocHeightBefore = tocElm.offsetHeight;
    }

    var controls = {
        toc: document.getElementById('toc'),
        links: document.getElementById('links'),
        bms: document.getElementById('bms'),
        catalog: document.getElementById('catalog'),
        xdata: document.getElementById('xdata')
    }

    Object.entries(controls).forEach(([key, value]) => {
        //Agafem el control actiu en aquest moment
        if (!value.classList.contains(TC.Consts.classes.COLLAPSED) && value != controls.catalog && value != controls.links) controlObert = value;
        else value.style.height = null;
        //Agafem els controls que s'han carregat
        if (value.querySelector('h2') != null || value == controls.links) {
            arrControlsActius.push(value);
        }
    });

    if (!controls.catalog.classList.contains(TC.Consts.classes.COLLAPSED)) {
        //Sumem les altures dels controls excepte el que està actiu en aquest moment
        arrControlsActius.forEach(obj => {
            if (obj == controls.links) heightControlsActiusMenysControlObert += obj.offsetHeight;
            else if (obj != controlObert) heightControlsActiusMenysControlObert += obj.querySelector('h2').offsetHeight;
            else heightControlsActiusMenysControlObert += obj.offsetHeight;
        });

        //arbolElm.style.height = window.innerHeight -
        //    (heightControlsActiusMenysControlObert +
        //        (mapaElm.offsetHeight - toolsPanelElmContent.offsetHeight)) +
        //    'px';

        document.querySelector('.tc-ctl-lcat-search').style.height = window.innerHeight -
            (heightControlsActiusMenysControlObert +
                (mapaElm.offsetHeight - toolsPanelElmContent.offsetHeight)) +
            'px';
    } else if (controlObert != null) {
        //Sumem les altures dels controls excepte el que està actiu en aquest moment
        arrControlsActius.forEach(obj => {
            if (obj == controls.links) heightControlsActiusMenysControlObert += obj.offsetHeight;
            else if (obj != controlObert) heightControlsActiusMenysControlObert += obj.querySelector('h2').offsetHeight;
        });

        controlObert.style.height = window.innerHeight -
            (heightControlsActiusMenysControlObert +
                (mapaElm.offsetHeight - toolsPanelElmContent.offsetHeight)) +
            'px';

        switch (true) {
            case (controlObert == controls.bms):
                bmsElmTree.style.height = 'unset';
                //bmsElmTree.style.maxHeight = 'unset';
                bmsElmTree.style.maxHeight = toolsPanelElmContent.offsetHeight - (controls.toc.offsetHeight +
                    controls.catalog.offsetHeight +
                    controls.xdata.offsetHeight +
                    controls.links.offsetHeight + controls.bms.querySelector('h2').offsetHeight + 20) + 'px';

                bmsElmTree.querySelector('ul').style.maxHeight = 'unset';
                return;
            case (controlObert == controls.toc):
                wlmElmContent.style.maxHeight = 'unset';
                wlmElmContent.querySelector('ul').style.maxHeight = 'unset'
                return;
            case (controlObert == controls.xdata):
                return;
        }
    }
    //40 és el height en px del header h2, lo que passa que si el header està collapsed dóna 0 i per açò no ho fem per codi
    if (document.querySelector('.tc-ctl-legend-tree') != null) {
        document.querySelector('.tc-ctl-legend-tree').style.height =
            (document.querySelector('.tc-ctl-legend-tree').parentElement.parentElement.offsetHeight - 40) + 'px';
    }
}

function matches(el, selector) {
    return (el.matches || el.matchesSelector || el.msMatchesSelector || el.mozMatchesSelector || el.webkitMatchesSelector || el.oMatchesSelector).call(el, selector);
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
    }

    Object.entries(controls).forEach(([key, value]) => {
        value.style.height = null;
        //Agafem els controls que s'han carregat
        if (value.querySelector('h2') != null) {
            arrControlsActius.push(value);
        }
        //Agafem el control actiu en aquest moment
        if (!value.classList.contains(TC.Consts.classes.COLLAPSED)) controlObert = value;
    });

    //Sumem les altures dels controls excepte el que està actiu en aquest moment
    arrControlsActius.forEach(obj => {
        if (obj != controlObert) heightControlsActiusMenysControlObert += obj.querySelector('h2').offsetHeight
    });

    if (controlObert) {
        //Assignem el height necessàri al control actiu perque ocupi tota l'alçada del panell tinguent en compte els headers dels altres controls
        controlObert.style.height = window.innerHeight -
            (heightControlsActiusMenysControlObert +
                (mapaElm.offsetHeight - toolsPanelElm.querySelector('.panel-content').offsetHeight)) +
            'px';
    }
}

function getCssProperty(elmId, property) {
    var elem = document.getElementById(elmId);
    return window.getComputedStyle(elem, null).getPropertyValue(property);
};