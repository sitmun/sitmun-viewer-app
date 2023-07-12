// document.getElementById("logoImg").src = "../assets/IDEMenorca/img/logo_sitmun.svg";
// document.getElementById("logoIns").src = "../assets/IDEMenorca/img/DIBA-logo-300x169.jpg";
function layerCatalogCarregat() {}
var ajustarPanell = function () {
  var arrControlsActius = [];
  var heightControlsActiusMenysControlObert = 0;
  var controlObert = null;
  var tocElm = document.getElementById('toc');
  //var arbolElm = document.getElementById('arbol');
  var mapaElm = document.getElementById('mapa');
  // Si no hay mapa, esto no tiene sentido.
  if (mapaElm) {
    var toolsPanelElm = document.getElementById('tools-panel');
    var toolsPanelElmContent = toolsPanelElm
      ? toolsPanelElm.querySelector('.panel-content')
      : null;
    var bmsElmTree = document.querySelector('.tc-ctl-bms-tree');
    var wlmElmContent = document.querySelector('.tc-ctl-wlm-content');
    var navBar = document.getElementsByClassName('nav-bar')[0];

    tocHeightBefore = tocHeightBefore ? tocHeightBefore : 0;

    bmsElmTree.style.height = null;
    bmsElmTree.style.maxHeight = null;
    bmsElmTree.querySelector('ul').style.maxHeight = null;
    if (wlmElmContent != null) {
      //TODO - DELETE
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
      wlm: document.getElementById('wlm'),
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

      //arbolElm.style.height = window.innerHeight -
      //    (heightControlsActiusMenysControlObert +
      //        (mapaElm.offsetHeight - toolsPanelElmContent.offsetHeight)) +
      //    'px';

      const selector = document.querySelector('.tc-ctl-lcat-search');
      if (selector) {
        selector.style.height =
          window.innerHeight -
          (heightControlsActiusMenysControlObert +
            (mapaElm.offsetHeight - toolsPanelElmContent.offsetHeight)) +
          'px';
      }
    } else if (controlObert != null) {
      //Sumem les altures dels controls excepte el que està actiu en aquest moment
      arrControlsActius.forEach((obj) => {
        if (obj == controls.links)
          heightControlsActiusMenysControlObert += obj.offsetHeight;
        else if (obj != controlObert)
          heightControlsActiusMenysControlObert +=
            obj.querySelector('h2').offsetHeight;
      });
      if (navBar) {
        controlObert.style.height =
          window.innerHeight -
          (heightControlsActiusMenysControlObert +
            (mapaElm.offsetHeight - toolsPanelElmContent.offsetHeight)) -
          navBar.offsetHeight +
          'px';
      }
      const selector = document.querySelector('.tc-ctl-lcat-search');
      if (selector) {
        selector.style.height =
          window.innerHeight -
          (heightControlsActiusMenysControlObert +
            (mapaElm.offsetHeight - toolsPanelElmContent.offsetHeight)) +
          'px';
      }
    } else if (controlObert != null) {
      //Sumem les altures dels controls excepte el que està actiu en aquest moment
      arrControlsActius.forEach((obj) => {
        if (obj == controls.links)
          heightControlsActiusMenysControlObert += obj.offsetHeight;
        else if (obj != controlObert)
          heightControlsActiusMenysControlObert +=
            obj.querySelector('h2').offsetHeight;
      });

      if (navBar) {
        controlObert.style.height =
          window.innerHeight -
          (heightControlsActiusMenysControlObert +
            (mapaElm.offsetHeight - toolsPanelElmContent.offsetHeight)) -
          navBar.offsetHeight +
          'px';
      } else {
        controlObert.style.height =
          window.innerHeight -
          (heightControlsActiusMenysControlObert +
            (mapaElm.offsetHeight - toolsPanelElmContent.offsetHeight)) +
          'px';
      }

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
        document.querySelector('.tc-ctl-legend-tree').parentElement
          .parentElement.offsetHeight -
        40 +
        'px';
    }
  }
  if (document.getElementById('wlm').classList.value == 'tc-ctl tc-ctl-wlm') {
    document
      .getElementById('catalog')
      .classList.add(TC.Consts.classes.COLLAPSED);
    document.getElementById('bms').classList.add(TC.Consts.classes.COLLAPSED);
  }

  if (document.getElementById('bms').classList.value == 'tc-ctl tc-ctl-bms') {
    document
      .getElementById('catalog')
      .classList.add(TC.Consts.classes.COLLAPSED);
    document.getElementById('wlm').classList.add(TC.Consts.classes.COLLAPSED);
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

var ajustarPanellSilme = function () {
  var arrControlsActius = [];
  var heightControlsActiusMenysControlObert = 0;
  var controlObert = null;
  var mapaElm = document.getElementById('mapa');
  var toolsPanelElm = document.getElementById('silme-panel');
  var navBar = document.getElementsByClassName('nav-bar')[0];
  var multiFeatureInfo = document.getElementById('multifeatureinfo');
  var controls = {
    localitzar: document.getElementById('localitzar'),
    reports: document.getElementById('reports'),
    measure: document.getElementById('measure'),
    print: document.getElementById('print'),
    share: document.getElementById('shared'),
    download: document.getElementById('download'),
    dataloader: document.getElementById('dataloader'),
    downloadSilme: document.getElementById('downloadSilme'),
    geolocation: document.getElementById('geolocation'),
    wfsedit: document.getElementById('wfsedit'),
    drawmeasuremodify: document.getElementById('drawmeasuremodify')
  };

  Object.entries(controls).forEach(([key, value]) => {
    if (value != null) {
      value.style.height = null;

      //Agafem els controls que s'han carregat
      if (value.querySelector('h2') != null) {
        arrControlsActius.push(value);
      }
      //Agafem el control actiu en aquest moment
      if (!value.classList.contains(TC.Consts.classes.COLLAPSED))
        controlObert = value;
    }
  });

  //Sumem les altures dels controls excepte el que està actiu en aquest moment
  arrControlsActius.forEach((obj) => {
    if (obj != controlObert)
      heightControlsActiusMenysControlObert +=
        obj.querySelector('h2').offsetHeight;
  });

  if (controlObert) {
    //Assignem el height necessàri al control actiu perque ocupi tota l'alçada del panell tinguent en compte els headers dels altres controls
    if (navBar) {
      controlObert.style.height =
        window.innerHeight -
        (heightControlsActiusMenysControlObert +
          (mapaElm.offsetHeight -
            toolsPanelElm.querySelector('.panel-content').offsetHeight +
            navBar.offsetHeight +
            multiFeatureInfo.offsetHeight)) +
        'px';
    } else {
      controlObert.style.height =
        window.innerHeight -
        (heightControlsActiusMenysControlObert +
          (mapaElm.offsetHeight -
            toolsPanelElm.querySelector('.panel-content').offsetHeight +
            multiFeatureInfo.offsetHeight)) +
        'px';
    }
  }
};

function getCssProperty(elmId, property) {
  var elem = document.getElementById(elmId);
  return window.getComputedStyle(elem, null).getPropertyValue(property);
}

var tocHeightBefore;
var silmeOpacity = 1; //Silme
var ovPanel = document.querySelector('.ovmap-panel');
var ovmap;
var ctlLcatNum = -1; //mv
var cookiesPolicy = 'cookiesPolicy';
var cookiesAccepted = 'accepted';
var cookiesShowPanel = 'cookiesShowPanel';

if (window.innerWidth < 760) {
  document.querySelector('#tools-panel').classList.add('right-collapsed');
}

document.querySelectorAll('.tc-map').forEach(function (elm) {
  //SILME MV 20211021
  const map = TC.Map.get(elm);

  if (map && !map._layoutDone) {
    // En pantalla estrecha cambiamos el método de mostrar GFI.
    if (
      window.matchMedia(
        'screen and (max-width: 40em), screen and (max-height: 40em)'
      ).matches
    ) {
      map.defaultInfoContainer = TC.Consts.infoContainer.RESULTS_PANEL;
    }
  }
});

//Welcome
if (getCookie(cookiesShowPanel) == cookiesAccepted) {
  document
    .querySelector('.welcome-panel')
    .classList.add(TC.Consts.classes.HIDDEN);
  document
    .querySelector('#background-cover')
    .classList.remove('background-cover');
} else {
  document
    .querySelector('.welcome-btn')
    .addEventListener(TC.Consts.event.CLICK, function (e) {
      document
        .querySelector('.welcome-panel')
        .classList.add(TC.Consts.classes.HIDDEN);
      document
        .querySelector('#background-cover')
        .classList.remove('background-cover');
      if (document.querySelector('#welcome-chk').checked) {
        var d = new Date();
        var year = d.getFullYear();
        var month = d.getMonth();
        var day = d.getDate();
        var c = new Date(year + 1, month, day);
        document.cookie =
          cookiesShowPanel +
          '=' +
          cookiesAccepted +
          '; expires=' +
          c.toString() +
          ';SameSite=None;Secure';
      }
    });
}

//Panell ajuda
document
  .querySelector('.help-link')
  .addEventListener(TC.Consts.event.CLICK, function (e) {
    document
      .querySelector('.tc-help-panel-back')
      .classList.toggle(TC.Consts.classes.HIDDEN);
    document
      .querySelector('.tc-help-panel-back')
      .classList.toggle('background-cover');
    document
      .querySelector('.tc-help-panel-close')
      .addEventListener(TC.Consts.event.CLICK, function (e) {
        document
          .querySelector('.tc-help-panel-back')
          .classList.add(TC.Consts.classes.HIDDEN);
        document
          .querySelector('.tc-help-panel-back')
          .classList.remove('background-cover');
      });
  });

document
  .querySelector('.right-panel > h1')
  .addEventListener(TC.Consts.event.CLICK, function (e) {
    e.preventDefault();
    e.stopPropagation();
    var tab = e.target;
    var panel = e.target.parentElement;

    panel.classList.toggle('right-collapsed');

    if (
      (window.innerWidth < 930 || window.innerHeight < 550) &&
      !document
        .querySelector('#silme-panel')
        .classList.contains('left-collapsed')
    ) {
      document.querySelector('#silme-panel').classList.toggle('left-collapsed');
      document
        .querySelector('#silme-panel')
        .classList.remove('left-collapsed-silme');
      document
        .querySelector('#silme-panel')
        .classList.remove('left-collapsed-legend');
      document
        .querySelector('#silme-panel')
        .classList.remove('left-collapsed-ovmap');
      //document.querySelector('.tc-ctl-sv').classList.remove('tc-ctl-sv-exp');
      //document.querySelector('.tc-ctl-sv').classList.add('tc-ctl-sv-coll');
      document
        .querySelector('.tc-ctl-nav-home')
        .classList.remove('tc-ctl-nav-home-exp');
      document
        .querySelector('.tc-ctl-nav-home')
        .classList.add('tc-ctl-nav-home-coll');
      document.querySelector('.tc-ctl-3d').classList.remove('tc-ctl-3d-exp');
      document.querySelector('.tc-ctl-3d').classList.add('tc-ctl-3d-coll');
    }

    if (window.innerWidth < 760 || window.innerHeight < 550) {
      if (
        !document
          .querySelector('#silme-panel')
          .classList.contains('left-collapsed')
      ) {
        document
          .querySelector('#silme-panel')
          .classList.toggle('left-collapsed');
        document
          .querySelector('#silme-panel')
          .classList.remove('left-collapsed-silme');
        document
          .querySelector('#silme-panel')
          .classList.remove('left-collapsed-legend');
        document
          .querySelector('#silme-panel')
          .classList.remove('left-collapsed-ovmap');
      }

      if (panel.classList.contains('right-collapsed')) {
        document.querySelector('#silme-panel').classList.remove('left-opacity');
        document
          .querySelector('.tc-ctl-nav-home')
          .classList.remove(TC.Consts.classes.HIDDEN);
        document
          .querySelector('.tc-ctl-3d')
          .classList.remove(TC.Consts.classes.HIDDEN);
        //document.querySelector('.tc-ctl-sv-btn').classList.remove(TC.Consts.classes.HIDDEN);
        if (document.querySelector('.tc-ctl-sb'))
          document.querySelector('.tc-ctl-sb').style.visibility = 'visible';
        if (document.querySelector('.tc-ctl-scl'))
          document.querySelector('.tc-ctl-scl').style.visibility = 'visible';
      } else {
        document.querySelector('#silme-panel').classList.add('left-opacity');
        document
          .querySelector('.tc-ctl-nav-home')
          .classList.add(TC.Consts.classes.HIDDEN);
        document
          .querySelector('.tc-ctl-3d')
          .classList.add(TC.Consts.classes.HIDDEN);
        //if (window.innerWidth < 760)
        //document.querySelector('.tc-ctl-sv-btn').classList.add(TC.Consts.classes.HIDDEN);
        if (document.querySelector('.tc-ctl-sb'))
          document.querySelector('.tc-ctl-sb').style.visibility = 'hidden';
        if (document.querySelector('.tc-ctl-scl'))
          document.querySelector('.tc-ctl-scl').style.visibility = 'hidden';
      }
    }
  });

var h1ImLeftPanel = document.querySelectorAll('.left-panel > h1');

h1ImLeftPanel.forEach((item) =>
  item.addEventListener(TC.Consts.event.CLICK, function (e) {
    e.preventDefault();
    e.stopPropagation();

    //var sv = document.querySelector('.tc-ctl-sv');
    var navHome = document.querySelector('.tc-ctl-nav-home');
    var Component3d = document.querySelector('.tc-ctl-3d');
    var geolocationTrackCenter = document.querySelector(
      '.tc-ctl-geolocation-track-center'
    );
    var tab = e.target;
    var panel = tab.parentElement;

    if (
      (window.innerWidth < 930 || window.innerHeight < 550) &&
      !document
        .querySelector('.right-panel > h1')
        .parentElement.classList.contains('right-collapsed')
    )
      document
        .querySelector('.right-panel > h1')
        .parentElement.classList.add('right-collapsed');

    if (panel.classList.contains('left-collapsed')) {
      if (window.innerWidth < 760) {
        document.querySelector('#legend-tab').style.visibility = 'collapse';
        document.querySelector('#ovmap-tab').style.visibility = 'collapse';
        document.querySelector('#silme-tab').style.visibility = 'collapse';
        document.querySelector('#nav').style.visibility = 'collapse';
        document.querySelector('#BirdEye').style.visibility = 'collapse';
        document.querySelector('#FuScreen').style.visibility = 'collapse';
        document.querySelector('#StreetView').style.visibility = 'collapse';
        document.querySelector('.tc-ctl-nav-home').style.visibility =
          'collapse';
        document.querySelector('.tc-ctl-3d').style.visibility = 'collapse';
        //document.querySelector(".tc-ctl-sv").style.visibility = "collapse";
      }

      document.querySelector('.tc-ctl-cctr-right').style.left = '376px';
      if (document.querySelector('.silme-control-flotant') != null) {
        document.querySelectorAll('.silme-control-flotant').forEach((item) => {
          if (window.innerWidth < 760) item.style.left = '100vw';
          else item.style.left = '328px';
        });
      }

      if (this.id == 'silme-tab') {
        document.querySelector('#silme-tab').style.visibility = 'unset';
        panel.classList.add('left-collapsed-silme');
        panel.classList.remove('left-collapsed-legend');
        panel.classList.remove('left-collapsed-ovmap');
        document
          .querySelector('.ol-overviewmap-map')
          ?.classList.add(TC.Consts.classes.HIDDEN);
        document.querySelector('#ovmap').style.display = 'none';
      }

      if (this.id == 'legend-tab') {
        document.querySelector('#legend-tab').style.visibility = 'unset';
        panel.classList.add('left-collapsed-legend');
        panel.classList.remove('left-collapsed-silme');
        panel.classList.remove('left-collapsed-ovmap');
        document
          .querySelector('.ol-overviewmap-map')
          ?.classList.add(TC.Consts.classes.HIDDEN);
        document.querySelector('#ovmap').style.display = 'none';
      }

      if (this.id == 'ovmap-tab') {
        document.querySelector('#ovmap-tab').style.visibility = 'unset';
        panel.classList.add('left-collapsed-ovmap');
        panel.classList.remove('left-collapsed-legend');
        panel.classList.remove('left-collapsed-silme');
        setTimeout(function () {
          document
            .querySelector('.ol-overviewmap-map')
            ?.classList.remove(TC.Consts.classes.HIDDEN);
          document.querySelector('#ovmap').style.display = 'unset';
        }, 250);
      }
      panel.classList.toggle('left-collapsed');
      //sv.classList.add('tc-ctl-sv-exp');
      //sv.classList.remove('tc-ctl-sv-coll');
      //sv.style.left = getCssProperty('nav', 'left');
      //if (geolocationTrackCenter) {
      //    geolocationTrackCenter.classList.add('tc-ctl-sv-exp');
      //    geolocationTrackCenter.classList.remove('tc-ctl-sv-coll');
      //}
      if (navHome && navHome != undefined) {
        navHome.classList.add('tc-ctl-nav-home-exp');
        navHome.classList.remove('tc-ctl-nav-home-coll');
        navHome.style.left = getCssProperty('nav', 'left');
      }
      if (Component3d && Component3d != undefined) {
        Component3d.classList.add('tc-ctl-3d-exp');
        Component3d.classList.remove('tc-ctl-3d-coll');
        Component3d.style.left = getCssProperty('nav', 'left');
      }
      document
        .querySelector('#search')
        .classList.toggle('search-left-collapsed');
      document.querySelector('#links').classList.toggle('links-collapsed');
    } else {
      if (window.innerWidth < 760) {
        document.querySelector('#silme-tab').style.visibility = 'unset';
        document.querySelector('#legend-tab').style.visibility = 'unset';
        document.querySelector('#ovmap-tab').style.visibility = 'unset';
        //document.querySelector("#nav").style.visibility = "unset";
        document.querySelector('#BirdEye').style.visibility = 'unset';
        document.querySelector('#FuScreen').style.visibility = 'unset';
        document.querySelector('#StreetView').style.visibility = 'unset';
        document.querySelector('.tc-ctl-nav-home').style.visibility = 'unset';
        document.querySelector('.tc-ctl-3d').style.visibility = 'unset';
        //document.querySelector(".tc-ctl-sv").style.visibility = "unset";
      }

      if (
        this.id == 'silme-tab' &&
        panel.classList.contains('left-collapsed-silme')
      ) {
        panel.classList.toggle('left-collapsed');
        document
          .querySelector('#search')
          .classList.toggle('search-left-collapsed');
        document.querySelector('#links').classList.toggle('links-collapsed');
        panel.classList.toggle('left-collapsed-silme');
        document
          .querySelector('.ol-overviewmap-map')
          ?.classList.add(TC.Consts.classes.HIDDEN);
        document.querySelector('#ovmap').style.display = 'none';
      } else if (
        this.id == 'legend-tab' &&
        panel.classList.contains('left-collapsed-legend')
      ) {
        panel.classList.toggle('left-collapsed');
        document
          .querySelector('#search')
          .classList.toggle('search-left-collapsed');
        document.querySelector('#links').classList.toggle('links-collapsed');
        panel.classList.toggle('left-collapsed-legend');
        document
          .querySelector('.ol-overviewmap-map')
          ?.classList.add(TC.Consts.classes.HIDDEN);
        document.querySelector('#ovmap').style.display = 'none';
      } else if (
        this.id == 'ovmap-tab' &&
        panel.classList.contains('left-collapsed-ovmap')
      ) {
        panel.classList.toggle('left-collapsed');
        document
          .querySelector('#search')
          .classList.toggle('search-left-collapsed');
        document.querySelector('#links').classList.toggle('links-collapsed');
        panel.classList.toggle('left-collapsed-ovmap');
        setTimeout(function () {
          document
            .querySelector('.ol-overviewmap-map')
            ?.classList.remove(TC.Consts.classes.HIDDEN);
          document.querySelector('#ovmap').style.display = 'unset';
        }, 250);
      } else {
        if (this.id == 'silme-tab') {
          panel.classList.add('left-collapsed-silme');
          panel.classList.remove('left-collapsed-legend');
          panel.classList.remove('left-collapsed-ovmap');
          document
            .querySelector('.ol-overviewmap-map')
            ?.classList.add(TC.Consts.classes.HIDDEN);
          document.querySelector('#ovmap').style.display = 'none';
        }
        if (this.id == 'legend-tab') {
          panel.classList.add('left-collapsed-legend');
          panel.classList.remove('left-collapsed-silme');
          panel.classList.remove('left-collapsed-ovmap');
          document
            .querySelector('.ol-overviewmap-map')
            ?.classList.add(TC.Consts.classes.HIDDEN);
          document.querySelector('#ovmap').style.display = 'none';
        }
        if (this.id == 'ovmap-tab') {
          panel.classList.add('left-collapsed-ovmap');
          panel.classList.remove('left-collapsed-legend');
          panel.classList.remove('left-collapsed-silme');
          setTimeout(function () {
            document
              .querySelector('.ol-overviewmap-map')
              ?.classList.remove(TC.Consts.classes.HIDDEN);
            document.querySelector('#ovmap').style.display = 'unset';
          }, 250);
        }
      }

      if (panel.classList.contains('left-collapsed')) {
        //Silme mv
        document.querySelector('.tc-ctl-cctr-right').style.left = '';
        if (document.querySelector('.silme-control-flotant') != null) {
          document
            .querySelectorAll('.silme-control-flotant')
            .forEach((item) => {
              item.style.left = '';
            });
        }
        //sv.classList.remove('tc-ctl-sv-exp');
        //sv.classList.add('tc-ctl-sv-coll');
        //if (geolocationTrackCenter) {
        //    geolocationTrackCenter.classList.remove('tc-ctl-sv-exp');
        //    geolocationTrackCenter.classList.add('tc-ctl-sv-coll');
        //}
        if (navHome && navHome != undefined) {
          navHome.classList.remove('tc-ctl-nav-home-exp');
          navHome.classList.add('tc-ctl-nav-home-coll');
          navHome.style.left = '';
        }
        if (Component3d && Component3d != undefined) {
          Component3d.classList.remove('tc-ctl-3d-exp');
          Component3d.classList.add('tc-ctl-3d-coll');
          Component3d.style.left = '';
        }
        //sv.style.left = "";
        //
      }
    }

    if (window.innerWidth < 760) {
      if (
        !document
          .querySelector('#tools-panel')
          .classList.contains('right-collapsed')
      ) {
        document
          .querySelector('#tools-panel')
          .classList.toggle('right-collapsed');
      }
      if (panel.classList.contains('left-collapsed')) {
        document
          .querySelector('#tools-panel')
          .classList.remove('right-opacity');
        if (document.querySelector('.tc-ctl-sb'))
          document.querySelector('.tc-ctl-sb').style.visibility = 'visible';
        if (document.querySelector('.tc-ctl-scl'))
          document.querySelector('.tc-ctl-scl').style.visibility = 'visible';
      } else {
        document.querySelector('#tools-panel').classList.add('right-opacity');
        if (document.querySelector('.tc-ctl-sb'))
          document.querySelector('.tc-ctl-sb').style.visibility = 'hidden';
        if (document.querySelector('.tc-ctl-scl'))
          document.querySelector('.tc-ctl-scl').style.visibility = 'hidden';
      }
    }
  })
);

document
  .querySelector('.tools-panel')
  .addEventListener(TC.Consts.event.CLICK, function (e) {
    var tab = e.target;
    //var sv = document.querySelector('.tc-ctl-sv');//Silme mv
    var navHome = document.querySelector('.tc-ctl-nav-home'); //Silme mv
    var Component3d = document.querySelector('.tc-ctl-3d'); //Silme mv

    //Silme
    if (window.innerWidth > 760) {
      // Si la mida de la pantalla és inferior a 760px d'ample amagam el layerCatalog quan obrim un altre menú
      if (ctlLcatNum == -1) {
        //Silme si es -1 es que fem click per primera vegada
        var childs = e.target.parentElement.parentElement.children;
        for (var i = 0; i < childs.length; i++) {
          if (childs[i].classList.contains('tc-ctl-lcat')) ctlLcatNum = i;
        }
      }
    }

    if (matches(tab, 'h2')) {
      var ctl = tab.parentElement;

      if (ctl.classList.contains(TC.Consts.classes.COLLAPSED)) {
        var ctlsTmp = this.querySelectorAll('h2');
        var ctls = [];
        for (let item of ctlsTmp) {
          if (!item.parentElement.classList.contains('.tc-ctl-search'))
            if (
              item.parentElement !==
              e.target.parentElement.parentElement.children[ctlLcatNum]
            )
              ctls.push(item.parentElement);
        }

        for (let item of ctls) {
          if (item !== ctl) item.classList.add(TC.Consts.classes.COLLAPSED);
        }
      }
      ctl.classList.toggle(TC.Consts.classes.COLLAPSED);

      //Silme redimensionam controls
      ajustarPanell();
    }

    if (
      matches(tab, '.tc-ctl-wlm-del') ||
      matches(tab, '.tc-ctl-wlm-del-all')
    ) {
      if (
        !document
          .querySelector('.tc-ctl-wlm-empty')
          .classList.contains(TC.Consts.classes.HIDDEN) &&
        document
          .querySelector('#silme-panel')
          .classList.contains('left-collapsed-legend')
      ) {
        document
          .querySelector('#silme-panel')
          .classList.remove('left-collapsed-legend');
        document.querySelector('#silme-panel').classList.add('left-collapsed');
        //Silme mv
        //sv.classList.add('tc-ctl-sv-coll');
        //sv.classList.remove('tc-ctl-sv-exp');
        navHome.classList.add('tc-ctl-nav-home-coll');
        navHome.classList.remove('tc-ctl-nav-home-exp');
        Component3d.classList.add('tc-ctl-3d-coll');
        Component3d.classList.remove('tc-ctl-3d-exp');
        //
        document
          .querySelector('#search')
          .classList.toggle('search-left-collapsed');
        document.querySelector('#links').classList.toggle('links-collapsed');
      }
      //Silme redimensionam controls
      ajustarPanell();
    }
  });

document
  .querySelector('.silme-panel')
  .addEventListener(TC.Consts.event.CLICK, function (e) {
    var tab = e.target;
    if (matches(tab, 'h2')) {
      var ctl = tab.parentElement;
      if (ctl.classList.contains(TC.Consts.classes.COLLAPSED)) {
        var ctlsTmp = this.querySelectorAll('h2');
        for (let item of ctlsTmp) {
          if (!item.parentElement.classList.contains('.tc-ctl-search'))
            if (item.parentElement !== ctl)
              item.parentElement.classList.add(TC.Consts.classes.COLLAPSED);
        }

        if (
          ctl.id != 'localitzar' &&
          document.querySelector('.tc-ctl-loc-btn-clr') != null
        )
          document.querySelector('.tc-ctl-loc-btn-clr').style.display = 'none';
      }
      ctl.classList.toggle(TC.Consts.classes.COLLAPSED);
      //Silme redimensionam controls
      ajustarPanellSilme();
    }
  });

/**
 * Array de condiciones para distintas resoluciones de pantalla. La estructura del array que recibe como parámetro es es:
 *  - screenCondition (string): media query que debe evaluarse a true para que se apliquen los cambios.
 *  - apply:
 *      - event (string): evento que debe producirse para que se lleve a cabo la acción.
 *      - elements (array o string): selectores CSS de los elementos sobre los que se debe producir el evento anterior.
 *      - changes:
 *          - targets (array o string): selectores CSS de los elementos a los que se aplicarán las clases CSS siguientes
 *          - classes (array o string): clases CSS a aplicar
 */

// TODO 20210730 mirar si aquest codi s'empra, sinó DELETE
TC.Cfg.applyChanges = function (configArray) {
  var changes = $.isArray(configArray) ? configArray : [configArray];

  if (changes) {
    changes.forEach(function (item) {
      var elem = item.apply;
      var clickedElems = $.isArray(elem.elements)
        ? elem.elements
        : [elem.elements];

      $(map._$div).on(elem.event, clickedElems.join(), function () {
        if (window.matchMedia(item.screenCondition).matches) {
          // si es una pantalla estrecha
          elem.changes.forEach(function (change) {
            var targets = $.isArray(change.targets)
              ? change.targets
              : [change.targets];
            var classes = $.isArray(change.classes)
              ? change.classes
              : [change.classes];

            $(targets.join()).toggleClass(classes.join(' '), true);
          });
        }
      });
    });
  }
};

if (TC.browserFeatures.touch()) {
  const addSwipe = function (direction) {
    const selector = '.' + direction + '-panel';
    const className = direction + '-collapsed';
    const options = { noSwipe: 'li,a' };
    options[direction] = function () {
      this.classList.add(className);
    };
    document.querySelectorAll(selector).forEach(function (panel) {
      TC.Util.swipe(panel, options);
    });
  };
  /*
   * SILME MV 20211027 Hem tret açò ja que donava problemes amb tema de mostrar/ocultar botons, etc.
   * Si es vol posar en un futur s'han de descomentar aquestes dues línies
   */

  //addSwipe('right');
  //addSwipe('left');
}

//switchery
(function () {
  function require(name) {
    var module = require.modules[name];
    if (!module) throw new Error('failed to require "' + name + '"');
    if (!('exports' in module) && typeof module.definition === 'function') {
      module.client = module.component = true;
      module.definition.call(this, (module.exports = {}), module);
      delete module.definition;
    }
    return module.exports;
  }
  require.loader = 'component';
  require.helper = {};
  require.helper.semVerSort = function (a, b) {
    var aArray = a.version.split('.');
    var bArray = b.version.split('.');
    for (var i = 0; i < aArray.length; ++i) {
      var aInt = parseInt(aArray[i], 10);
      var bInt = parseInt(bArray[i], 10);
      if (aInt === bInt) {
        var aLex = aArray[i].substr(('' + aInt).length);
        var bLex = bArray[i].substr(('' + bInt).length);
        if (aLex === '' && bLex !== '') return 1;
        if (aLex !== '' && bLex === '') return -1;
        if (aLex !== '' && bLex !== '') return aLex > bLex ? 1 : -1;
        continue;
      } else if (aInt > bInt) {
        return 1;
      } else {
        return -1;
      }
    }
    return 0;
  };
  require.latest = function (name, returnPath) {
    function showError(name) {
      throw new Error('failed to find latest module of "' + name + '"');
    }
    var versionRegexp = /(.*)~(.*)@v?(\d+\.\d+\.\d+[^\/]*)$/;
    var remoteRegexp = /(.*)~(.*)/;
    if (!remoteRegexp.test(name)) showError(name);
    var moduleNames = Object.keys(require.modules);
    var semVerCandidates = [];
    var otherCandidates = [];
    for (var i = 0; i < moduleNames.length; i++) {
      var moduleName = moduleNames[i];
      if (new RegExp(name + '@').test(moduleName)) {
        var version = moduleName.substr(name.length + 1);
        var semVerMatch = versionRegexp.exec(moduleName);
        if (semVerMatch != null) {
          semVerCandidates.push({ version: version, name: moduleName });
        } else {
          otherCandidates.push({ version: version, name: moduleName });
        }
      }
    }
    if (semVerCandidates.concat(otherCandidates).length === 0) {
      showError(name);
    }
    if (semVerCandidates.length > 0) {
      var module = semVerCandidates.sort(require.helper.semVerSort).pop().name;
      if (returnPath === true) {
        return module;
      }
      return require(module);
    }
    var module = otherCandidates.sort(function (a, b) {
      return a.name > b.name;
    })[0].name;
    if (returnPath === true) {
      return module;
    }
    return require(module);
  };
  require.modules = {};
  require.register = function (name, definition) {
    require.modules[name] = { definition: definition };
  };
  require.define = function (name, exports) {
    require.modules[name] = { exports: exports };
  };
  require.register('abpetkov~transitionize@0.0.3', function (exports, module) {
    module.exports = Transitionize;
    function Transitionize(element, props) {
      if (!(this instanceof Transitionize))
        return new Transitionize(element, props);
      this.element = element;
      this.props = props || {};
      this.init();
    }
    Transitionize.prototype.isSafari = function () {
      return (
        /Safari/.test(navigator.userAgent) &&
        /Apple Computer/.test(navigator.vendor)
      );
    };
    Transitionize.prototype.init = function () {
      var transitions = [];
      for (var key in this.props) {
        transitions.push(key + ' ' + this.props[key]);
      }
      this.element.style.transition = transitions.join(', ');
      if (this.isSafari())
        this.element.style.webkitTransition = transitions.join(', ');
    };
  });
  require.register('ftlabs~fastclick@v0.6.11', function (exports, module) {
    function FastClick(layer) {
      'use strict';
      var oldOnClick,
        self = this;
      this.trackingClick = false;
      this.trackingClickStart = 0;
      this.targetElement = null;
      this.touchStartX = 0;
      this.touchStartY = 0;
      this.lastTouchIdentifier = 0;
      this.touchBoundary = 10;
      this.layer = layer;
      if (!layer || !layer.nodeType) {
        throw new TypeError('Layer must be a document node');
      }
      this.onClick = function () {
        return FastClick.prototype.onClick.apply(self, arguments);
      };
      this.onMouse = function () {
        return FastClick.prototype.onMouse.apply(self, arguments);
      };
      this.onTouchStart = function () {
        return FastClick.prototype.onTouchStart.apply(self, arguments);
      };
      this.onTouchMove = function () {
        return FastClick.prototype.onTouchMove.apply(self, arguments);
      };
      this.onTouchEnd = function () {
        return FastClick.prototype.onTouchEnd.apply(self, arguments);
      };
      this.onTouchCancel = function () {
        return FastClick.prototype.onTouchCancel.apply(self, arguments);
      };
      if (FastClick.notNeeded(layer)) {
        return;
      }
      if (this.deviceIsAndroid) {
        layer.addEventListener('mouseover', this.onMouse, true);
        layer.addEventListener('mousedown', this.onMouse, true);
        layer.addEventListener('mouseup', this.onMouse, true);
      }
      layer.addEventListener('click', this.onClick, true);
      layer.addEventListener('touchstart', this.onTouchStart, false);
      layer.addEventListener('touchmove', this.onTouchMove, false);
      layer.addEventListener('touchend', this.onTouchEnd, false);
      layer.addEventListener('touchcancel', this.onTouchCancel, false);
      if (!Event.prototype.stopImmediatePropagation) {
        layer.removeEventListener = function (type, callback, capture) {
          var rmv = Node.prototype.removeEventListener;
          if (type === 'click') {
            rmv.call(layer, type, callback.hijacked || callback, capture);
          } else {
            rmv.call(layer, type, callback, capture);
          }
        };
        layer.addEventListener = function (type, callback, capture) {
          var adv = Node.prototype.addEventListener;
          if (type === 'click') {
            adv.call(
              layer,
              type,
              callback.hijacked ||
                (callback.hijacked = function (event) {
                  if (!event.propagationStopped) {
                    callback(event);
                  }
                }),
              capture
            );
          } else {
            adv.call(layer, type, callback, capture);
          }
        };
      }
      if (typeof layer.onclick === 'function') {
        oldOnClick = layer.onclick;
        layer.addEventListener(
          'click',
          function (event) {
            oldOnClick(event);
          },
          false
        );
        layer.onclick = null;
      }
    }
    FastClick.prototype.deviceIsAndroid =
      navigator.userAgent.indexOf('Android') > 0;
    FastClick.prototype.deviceIsIOS = /iP(ad|hone|od)/.test(
      navigator.userAgent
    );
    FastClick.prototype.deviceIsIOS4 =
      FastClick.prototype.deviceIsIOS &&
      /OS 4_\d(_\d)?/.test(navigator.userAgent);
    FastClick.prototype.deviceIsIOSWithBadTarget =
      FastClick.prototype.deviceIsIOS &&
      /OS ([6-9]|\d{2})_\d/.test(navigator.userAgent);
    FastClick.prototype.needsClick = function (target) {
      'use strict';
      switch (target.nodeName.toLowerCase()) {
        case 'button':
        case 'select':
        case 'textarea':
          if (target.disabled) {
            return true;
          }
          break;
        case 'input':
          if ((this.deviceIsIOS && target.type === 'file') || target.disabled) {
            return true;
          }
          break;
        case 'label':
        case 'video':
          return true;
      }
      return /\bneedsclick\b/.test(target.className);
    };
    FastClick.prototype.needsFocus = function (target) {
      'use strict';
      switch (target.nodeName.toLowerCase()) {
        case 'textarea':
          return true;
        case 'select':
          return !this.deviceIsAndroid;
        case 'input':
          switch (target.type) {
            case 'button':
            case 'checkbox':
            case 'file':
            case 'image':
            case 'radio':
            case 'submit':
              return false;
          }
          return !target.disabled && !target.readOnly;
        default:
          return /\bneedsfocus\b/.test(target.className);
      }
    };
    FastClick.prototype.sendClick = function (targetElement, event) {
      'use strict';
      var clickEvent, touch;
      if (document.activeElement && document.activeElement !== targetElement) {
        document.activeElement.blur();
      }
      touch = event.changedTouches[0];
      clickEvent = document.createEvent('MouseEvents');
      clickEvent.initMouseEvent(
        this.determineEventType(targetElement),
        true,
        true,
        window,
        1,
        touch.screenX,
        touch.screenY,
        touch.clientX,
        touch.clientY,
        false,
        false,
        false,
        false,
        0,
        null
      );
      clickEvent.forwardedTouchEvent = true;
      targetElement.dispatchEvent(clickEvent);
    };
    FastClick.prototype.determineEventType = function (targetElement) {
      'use strict';
      if (
        this.deviceIsAndroid &&
        targetElement.tagName.toLowerCase() === 'select'
      ) {
        return 'mousedown';
      }
      return 'click';
    };
    FastClick.prototype.focus = function (targetElement) {
      'use strict';
      var length;
      if (
        this.deviceIsIOS &&
        targetElement.setSelectionRange &&
        targetElement.type.indexOf('date') !== 0 &&
        targetElement.type !== 'time'
      ) {
        length = targetElement.value.length;
        targetElement.setSelectionRange(length, length);
      } else {
        targetElement.focus();
      }
    };
    FastClick.prototype.updateScrollParent = function (targetElement) {
      'use strict';
      var scrollParent, parentElement;
      scrollParent = targetElement.fastClickScrollParent;
      if (!scrollParent || !scrollParent.contains(targetElement)) {
        parentElement = targetElement;
        do {
          if (parentElement.scrollHeight > parentElement.offsetHeight) {
            scrollParent = parentElement;
            targetElement.fastClickScrollParent = parentElement;
            break;
          }
          parentElement = parentElement.parentElement;
        } while (parentElement);
      }
      if (scrollParent) {
        scrollParent.fastClickLastScrollTop = scrollParent.scrollTop;
      }
    };
    FastClick.prototype.getTargetElementFromEventTarget = function (
      eventTarget
    ) {
      'use strict';
      if (eventTarget.nodeType === Node.TEXT_NODE) {
        return eventTarget.parentNode;
      }
      return eventTarget;
    };
    FastClick.prototype.onTouchStart = function (event) {
      'use strict';
      var targetElement, touch, selection;
      if (event.targetTouches.length > 1) {
        return true;
      }
      targetElement = this.getTargetElementFromEventTarget(event.target);
      touch = event.targetTouches[0];
      if (this.deviceIsIOS) {
        selection = window.getSelection();
        if (selection.rangeCount && !selection.isCollapsed) {
          return true;
        }
        if (!this.deviceIsIOS4) {
          if (touch.identifier === this.lastTouchIdentifier) {
            event.preventDefault();
            return false;
          }
          this.lastTouchIdentifier = touch.identifier;
          this.updateScrollParent(targetElement);
        }
      }
      this.trackingClick = true;
      this.trackingClickStart = event.timeStamp;
      this.targetElement = targetElement;
      this.touchStartX = touch.pageX;
      this.touchStartY = touch.pageY;
      if (event.timeStamp - this.lastClickTime < 200) {
        event.preventDefault();
      }
      return true;
    };
    FastClick.prototype.touchHasMoved = function (event) {
      'use strict';
      var touch = event.changedTouches[0],
        boundary = this.touchBoundary;
      if (
        Math.abs(touch.pageX - this.touchStartX) > boundary ||
        Math.abs(touch.pageY - this.touchStartY) > boundary
      ) {
        return true;
      }
      return false;
    };
    FastClick.prototype.onTouchMove = function (event) {
      'use strict';
      if (!this.trackingClick) {
        return true;
      }
      if (
        this.targetElement !==
          this.getTargetElementFromEventTarget(event.target) ||
        this.touchHasMoved(event)
      ) {
        this.trackingClick = false;
        this.targetElement = null;
      }
      return true;
    };
    FastClick.prototype.findControl = function (labelElement) {
      'use strict';
      if (labelElement.control !== undefined) {
        return labelElement.control;
      }
      if (labelElement.htmlFor) {
        return document.getElementById(labelElement.htmlFor);
      }
      return labelElement.querySelector(
        'button, input:not([type=hidden]), keygen, meter, output, progress, select, textarea'
      );
    };
    FastClick.prototype.onTouchEnd = function (event) {
      'use strict';
      var forElement,
        trackingClickStart,
        targetTagName,
        scrollParent,
        touch,
        targetElement = this.targetElement;
      if (!this.trackingClick) {
        return true;
      }
      if (event.timeStamp - this.lastClickTime < 200) {
        this.cancelNextClick = true;
        return true;
      }
      this.cancelNextClick = false;
      this.lastClickTime = event.timeStamp;
      trackingClickStart = this.trackingClickStart;
      this.trackingClick = false;
      this.trackingClickStart = 0;
      if (this.deviceIsIOSWithBadTarget) {
        touch = event.changedTouches[0];
        targetElement =
          document.elementFromPoint(
            touch.pageX - window.pageXOffset,
            touch.pageY - window.pageYOffset
          ) || targetElement;
        targetElement.fastClickScrollParent =
          this.targetElement.fastClickScrollParent;
      }
      targetTagName = targetElement.tagName.toLowerCase();
      if (targetTagName === 'label') {
        forElement = this.findControl(targetElement);
        if (forElement) {
          this.focus(targetElement);
          if (this.deviceIsAndroid) {
            return false;
          }
          targetElement = forElement;
        }
      } else if (this.needsFocus(targetElement)) {
        if (
          event.timeStamp - trackingClickStart > 100 ||
          (this.deviceIsIOS &&
            window.top !== window &&
            targetTagName === 'input')
        ) {
          this.targetElement = null;
          return false;
        }
        this.focus(targetElement);
        if (!this.deviceIsIOS4 || targetTagName !== 'select') {
          this.targetElement = null;
          event.preventDefault();
        }
        return false;
      }
      if (this.deviceIsIOS && !this.deviceIsIOS4) {
        scrollParent = targetElement.fastClickScrollParent;
        if (
          scrollParent &&
          scrollParent.fastClickLastScrollTop !== scrollParent.scrollTop
        ) {
          return true;
        }
      }
      if (!this.needsClick(targetElement)) {
        event.preventDefault();
        this.sendClick(targetElement, event);
      }
      return false;
    };
    FastClick.prototype.onTouchCancel = function () {
      'use strict';
      this.trackingClick = false;
      this.targetElement = null;
    };
    FastClick.prototype.onMouse = function (event) {
      'use strict';
      if (!this.targetElement) {
        return true;
      }
      if (event.forwardedTouchEvent) {
        return true;
      }
      if (!event.cancelable) {
        return true;
      }
      if (!this.needsClick(this.targetElement) || this.cancelNextClick) {
        if (event.stopImmediatePropagation) {
          event.stopImmediatePropagation();
        } else {
          event.propagationStopped = true;
        }
        event.stopPropagation();
        event.preventDefault();
        return false;
      }
      return true;
    };
    FastClick.prototype.onClick = function (event) {
      'use strict';
      var permitted;
      if (this.trackingClick) {
        this.targetElement = null;
        this.trackingClick = false;
        return true;
      }
      if (event.target.type === 'submit' && event.detail === 0) {
        return true;
      }
      permitted = this.onMouse(event);
      if (!permitted) {
        this.targetElement = null;
      }
      return permitted;
    };
    FastClick.prototype.destroy = function () {
      'use strict';
      var layer = this.layer;
      if (this.deviceIsAndroid) {
        layer.removeEventListener('mouseover', this.onMouse, true);
        layer.removeEventListener('mousedown', this.onMouse, true);
        layer.removeEventListener('mouseup', this.onMouse, true);
      }
      layer.removeEventListener('click', this.onClick, true);
      layer.removeEventListener('touchstart', this.onTouchStart, false);
      layer.removeEventListener('touchmove', this.onTouchMove, false);
      layer.removeEventListener('touchend', this.onTouchEnd, false);
      layer.removeEventListener('touchcancel', this.onTouchCancel, false);
    };
    FastClick.notNeeded = function (layer) {
      'use strict';
      var metaViewport;
      var chromeVersion;
      if (typeof window.ontouchstart === 'undefined') {
        return true;
      }
      chromeVersion = +(/Chrome\/([0-9]+)/.exec(navigator.userAgent) || [
        ,
        0
      ])[1];
      if (chromeVersion) {
        if (FastClick.prototype.deviceIsAndroid) {
          metaViewport = document.querySelector('meta[name=viewport]');
          if (metaViewport) {
            if (metaViewport.content.indexOf('user-scalable=no') !== -1) {
              return true;
            }
            if (
              chromeVersion > 31 &&
              window.innerWidth <= window.screen.width
            ) {
              return true;
            }
          }
        } else {
          return true;
        }
      }
      if (layer.style.msTouchAction === 'none') {
        return true;
      }
      return false;
    };
    FastClick.attach = function (layer) {
      'use strict';
      return new FastClick(layer);
    };
    if (typeof define !== 'undefined' && define.amd) {
      define(function () {
        'use strict';
        return FastClick;
      });
    } else if (typeof module !== 'undefined' && module.exports) {
      module.exports = FastClick.attach;
      module.exports.FastClick = FastClick;
    } else {
      window.FastClick = FastClick;
    }
  });
  require.register('component~indexof@0.0.3', function (exports, module) {
    module.exports = function (arr, obj) {
      if (arr.indexOf) return arr.indexOf(obj);
      for (var i = 0; i < arr.length; ++i) {
        if (arr[i] === obj) return i;
      }
      return -1;
    };
  });
  require.register('component~classes@1.2.1', function (exports, module) {
    var index = require('component~indexof@0.0.3');
    var re = /\s+/;
    var toString = Object.prototype.toString;
    module.exports = function (el) {
      return new ClassList(el);
    };
    function ClassList(el) {
      if (!el) throw new Error('A DOM element reference is required');
      this.el = el;
      this.list = el.classList;
    }
    ClassList.prototype.add = function (name) {
      if (this.list) {
        this.list.add(name);
        return this;
      }
      var arr = this.array();
      var i = index(arr, name);
      if (!~i) arr.push(name);
      this.el.className = arr.join(' ');
      return this;
    };
    ClassList.prototype.remove = function (name) {
      if ('[object RegExp]' == toString.call(name)) {
        return this.removeMatching(name);
      }
      if (this.list) {
        this.list.remove(name);
        return this;
      }
      var arr = this.array();
      var i = index(arr, name);
      if (~i) arr.splice(i, 1);
      this.el.className = arr.join(' ');
      return this;
    };
    ClassList.prototype.removeMatching = function (re) {
      var arr = this.array();
      for (var i = 0; i < arr.length; i++) {
        if (re.test(arr[i])) {
          this.remove(arr[i]);
        }
      }
      return this;
    };
    ClassList.prototype.toggle = function (name, force) {
      if (this.list) {
        if ('undefined' !== typeof force) {
          if (force !== this.list.toggle(name, force)) {
            this.list.toggle(name);
          }
        } else {
          this.list.toggle(name);
        }
        return this;
      }
      if ('undefined' !== typeof force) {
        if (!force) {
          this.remove(name);
        } else {
          this.add(name);
        }
      } else {
        if (this.has(name)) {
          this.remove(name);
        } else {
          this.add(name);
        }
      }
      return this;
    };
    ClassList.prototype.array = function () {
      var str = this.el.className.replace(/^\s+|\s+$/g, '');
      var arr = str.split(re);
      if ('' === arr[0]) arr.shift();
      return arr;
    };
    ClassList.prototype.has = ClassList.prototype.contains = function (name) {
      return this.list
        ? this.list.contains(name)
        : !!~index(this.array(), name);
    };
  });
  require.register('component~event@0.1.4', function (exports, module) {
    var bind = window.addEventListener ? 'addEventListener' : 'attachEvent',
      unbind = window.removeEventListener
        ? 'removeEventListener'
        : 'detachEvent',
      prefix = bind !== 'addEventListener' ? 'on' : '';
    exports.bind = function (el, type, fn, capture) {
      el[bind](prefix + type, fn, capture || false);
      return fn;
    };
    exports.unbind = function (el, type, fn, capture) {
      el[unbind](prefix + type, fn, capture || false);
      return fn;
    };
  });
  require.register('component~query@0.0.3', function (exports, module) {
    function one(selector, el) {
      return el.querySelector(selector);
    }
    exports = module.exports = function (selector, el) {
      el = el || document;
      return one(selector, el);
    };
    exports.all = function (selector, el) {
      el = el || document;
      return el.querySelectorAll(selector);
    };
    exports.engine = function (obj) {
      if (!obj.one) throw new Error('.one callback required');
      if (!obj.all) throw new Error('.all callback required');
      one = obj.one;
      exports.all = obj.all;
      return exports;
    };
  });
  require.register(
    'component~matches-selector@0.1.5',
    function (exports, module) {
      var query = require('component~query@0.0.3');
      var proto = Element.prototype;
      var vendor =
        proto.matches ||
        proto.webkitMatchesSelector ||
        proto.mozMatchesSelector ||
        proto.msMatchesSelector ||
        proto.oMatchesSelector;
      module.exports = match;
      function match(el, selector) {
        if (!el || el.nodeType !== 1) return false;
        if (vendor) return vendor.call(el, selector);
        var nodes = query.all(selector, el.parentNode);
        for (var i = 0; i < nodes.length; ++i) {
          if (nodes[i] == el) return true;
        }
        return false;
      }
    }
  );
  require.register('component~closest@0.1.4', function (exports, module) {
    var matches = require('component~matches-selector@0.1.5');
    module.exports = function (element, selector, checkYoSelf, root) {
      element = checkYoSelf ? { parentNode: element } : element;
      root = root || document;
      while ((element = element.parentNode) && element !== document) {
        if (matches(element, selector)) return element;
        if (element === root) return;
      }
    };
  });
  require.register('component~delegate@0.2.3', function (exports, module) {
    var closest = require('component~closest@0.1.4'),
      event = require('component~event@0.1.4');
    exports.bind = function (el, selector, type, fn, capture) {
      return event.bind(
        el,
        type,
        function (e) {
          var target = e.target || e.srcElement;
          e.delegateTarget = closest(target, selector, true, el);
          if (e.delegateTarget) fn.call(el, e);
        },
        capture
      );
    };
    exports.unbind = function (el, type, fn, capture) {
      event.unbind(el, type, fn, capture);
    };
  });
  require.register('component~events@1.0.9', function (exports, module) {
    var events = require('component~event@0.1.4');
    var delegate = require('component~delegate@0.2.3');
    module.exports = Events;
    function Events(el, obj) {
      if (!(this instanceof Events)) return new Events(el, obj);
      if (!el) throw new Error('element required');
      if (!obj) throw new Error('object required');
      this.el = el;
      this.obj = obj;
      this._events = {};
    }
    Events.prototype.sub = function (event, method, cb) {
      this._events[event] = this._events[event] || {};
      this._events[event][method] = cb;
    };
    Events.prototype.bind = function (event, method) {
      var e = parse(event);
      var el = this.el;
      var obj = this.obj;
      var name = e.name;
      var method = method || 'on' + name;
      var args = [].slice.call(arguments, 2);
      function cb() {
        var a = [].slice.call(arguments).concat(args);
        obj[method].apply(obj, a);
      }
      if (e.selector) {
        cb = delegate.bind(el, e.selector, name, cb);
      } else {
        events.bind(el, name, cb);
      }
      this.sub(name, method, cb);
      return cb;
    };
    Events.prototype.unbind = function (event, method) {
      if (0 == arguments.length) return this.unbindAll();
      if (1 == arguments.length) return this.unbindAllOf(event);
      var bindings = this._events[event];
      if (!bindings) return;
      var cb = bindings[method];
      if (!cb) return;
      events.unbind(this.el, event, cb);
    };
    Events.prototype.unbindAll = function () {
      for (var event in this._events) {
        this.unbindAllOf(event);
      }
    };
    Events.prototype.unbindAllOf = function (event) {
      var bindings = this._events[event];
      if (!bindings) return;
      for (var method in bindings) {
        this.unbind(event, method);
      }
    };
    function parse(event) {
      var parts = event.split(/ +/);
      return { name: parts.shift(), selector: parts.join(' ') };
    }
  });
  require.register('switchery', function (exports, module) {
    var transitionize = require('abpetkov~transitionize@0.0.3'),
      fastclick = require('ftlabs~fastclick@v0.6.11'),
      classes = require('component~classes@1.2.1'),
      events = require('component~events@1.0.9');
    module.exports = Switchery;
    var defaults = {
      color: '#64bd63',
      secondaryColor: '#dfdfdf',
      jackColor: '#fff',
      jackSecondaryColor: null,
      className: 'switchery',
      disabled: false,
      disabledOpacity: 0.5,
      speed: '0.4s',
      size: 'default'
    };
    function Switchery(element, options) {
      if (!(this instanceof Switchery)) return new Switchery(element, options);
      this.element = element;
      this.options = options || {};
      for (var i in defaults) {
        if (this.options[i] == null) {
          this.options[i] = defaults[i];
        }
      }
      if (this.element != null && this.element.type == 'checkbox') this.init();
      if (this.isDisabled() === true) this.disable();
    }
    Switchery.prototype.hide = function () {
      this.element.style.display = 'none';
    };
    Switchery.prototype.show = function () {
      var switcher = this.create();
      this.insertAfter(this.element, switcher);
    };
    Switchery.prototype.create = function () {
      this.switcher = document.createElement('span');
      this.jack = document.createElement('small');
      this.switcher.appendChild(this.jack);
      this.switcher.className = this.options.className;
      this.events = events(this.switcher, this);
      return this.switcher;
    };
    Switchery.prototype.insertAfter = function (reference, target) {
      reference.parentNode.insertBefore(target, reference.nextSibling);
    };
    Switchery.prototype.setPosition = function (clicked) {
      var checked = this.isChecked(),
        switcher = this.switcher,
        jack = this.jack;
      if (clicked && checked) checked = false;
      else if (clicked && !checked) checked = true;
      if (checked === true) {
        this.element.checked = true;
        if (window.getComputedStyle)
          jack.style.left =
            parseInt(window.getComputedStyle(switcher).width) -
            parseInt(window.getComputedStyle(jack).width) +
            'px';
        else
          jack.style.left =
            parseInt(switcher.currentStyle['width']) -
            parseInt(jack.currentStyle['width']) +
            'px';
        if (this.options.color) this.colorize();
        this.setSpeed();
      } else {
        jack.style.left = 0;
        this.element.checked = false;
        this.switcher.style.boxShadow =
          'inset 0 0 0 0 ' + this.options.secondaryColor;
        this.switcher.style.borderColor = this.options.secondaryColor;
        this.switcher.style.backgroundColor =
          this.options.secondaryColor !== defaults.secondaryColor
            ? this.options.secondaryColor
            : '#fff';
        this.jack.style.backgroundColor =
          this.options.jackSecondaryColor !== this.options.jackColor
            ? this.options.jackSecondaryColor
            : this.options.jackColor;
        this.setSpeed();
      }
    };
    Switchery.prototype.setSpeed = function () {
      var switcherProp = {},
        jackProp = {
          'background-color': this.options.speed,
          left: this.options.speed.replace(/[a-z]/, '') / 2 + 's'
        };
      if (this.isChecked()) {
        switcherProp = {
          border: this.options.speed,
          'box-shadow': this.options.speed,
          'background-color': this.options.speed.replace(/[a-z]/, '') * 3 + 's'
        };
      } else {
        switcherProp = {
          border: this.options.speed,
          'box-shadow': this.options.speed
        };
      }
      transitionize(this.switcher, switcherProp);
      transitionize(this.jack, jackProp);
    };
    Switchery.prototype.setSize = function () {
      var small = 'switchery-small',
        normal = 'switchery-default',
        large = 'switchery-large';
      switch (this.options.size) {
        case 'small':
          classes(this.switcher).add(small);
          break;
        case 'large':
          classes(this.switcher).add(large);
          break;
        default:
          classes(this.switcher).add(normal);
          break;
      }
    };
    Switchery.prototype.colorize = function () {
      var switcherHeight = this.switcher.offsetHeight / 2;
      this.switcher.style.backgroundColor = this.options.color;
      this.switcher.style.borderColor = this.options.color;
      this.switcher.style.boxShadow =
        'inset 0 0 0 ' + switcherHeight + 'px ' + this.options.color;
      this.jack.style.backgroundColor = this.options.jackColor;
    };
    Switchery.prototype.handleOnchange = function (state) {
      if (document.dispatchEvent) {
        var event = document.createEvent('HTMLEvents');
        event.initEvent('change', true, true);
        this.element.dispatchEvent(event);
      } else {
        this.element.fireEvent('onchange');
      }
    };
    Switchery.prototype.handleChange = function () {
      var self = this,
        el = this.element;
      if (el.addEventListener) {
        el.addEventListener('change', function () {
          self.setPosition();
        });
      } else {
        el.attachEvent('onchange', function () {
          self.setPosition();
        });
      }
    };
    Switchery.prototype.handleClick = function () {
      var switcher = this.switcher;
      fastclick(switcher);
      this.events.bind('click', 'bindClick');
    };
    Switchery.prototype.bindClick = function () {
      var parent = this.element.parentNode.tagName.toLowerCase(),
        labelParent = parent === 'label' ? false : true;
      this.setPosition(labelParent);
      this.handleOnchange(this.element.checked);
    };
    Switchery.prototype.markAsSwitched = function () {
      this.element.setAttribute('data-switchery', true);
    };
    Switchery.prototype.markedAsSwitched = function () {
      return this.element.getAttribute('data-switchery');
    };
    Switchery.prototype.init = function () {
      this.hide();
      this.show();
      this.setSize();
      this.setPosition();
      this.markAsSwitched();
      this.handleChange();
      this.handleClick();
    };
    Switchery.prototype.isChecked = function () {
      return this.element.checked;
    };
    Switchery.prototype.isDisabled = function () {
      return (
        this.options.disabled || this.element.disabled || this.element.readOnly
      );
    };
    Switchery.prototype.destroy = function () {
      this.events.unbind();
    };
    Switchery.prototype.enable = function () {
      if (this.options.disabled) this.options.disabled = false;
      if (this.element.disabled) this.element.disabled = false;
      if (this.element.readOnly) this.element.readOnly = false;
      this.switcher.style.opacity = 1;
      this.events.bind('click', 'bindClick');
    };
    Switchery.prototype.disable = function () {
      if (this.options.disabled) this.options.disabled = true;
      if (this.element.disabled) this.element.disabled = true;
      if (this.element.readOnly) this.element.readOnly = true;
      this.switcher.style.opacity = this.options.disabledOpacity;
      this.destroy();
    };
  });
  if (typeof exports == 'object') {
    module.exports = require('switchery');
  } else if (typeof define == 'function' && define.amd) {
    define('Switchery', [], function () {
      return require('switchery');
    });
  } else {
    (this || window)['Switchery'] = require('switchery');
  }
})();

/*
var ajustarPanell = function () {
    var tocElm = document.getElementById('toc');
    var arbolElm = document.getElementById('arbol');
    var bmsElm = document.getElementById('bms');
    var catalogElm = document.getElementById('catalog');
    var linksElm = document.getElementById('links');
    var xdataElm = document.getElementById('xdata');
    var mapaElm = document.getElementById('mapa');
    var toolsPanelElm = document.getElementById('tools-panel');

    tocHeightBefore = tocHeightBefore ? tocHeightBefore : 0;

    if (tocHeightBefore != tocElm.offsetHeight) {
        arbolElm.scrollTop = arbolElm.scroll + (tocElm.offsetHeight - tocHeightBefore);
        tocHeightBefore = tocElm.offsetHeight;
    }
    if (!bmsElm.classList.contains(TC.Consts.classes.COLLAPSED) && !catalogElm.classList.contains(TC.Consts.classes.COLLAPSED)) {
        arbolElm.style.height = 'calc(' +
            window.innerHeight + 'px - ' + (
                linksElm.offsetHeight +
                bmsElm.offsetHeight +
                catalogElm.querySelector('h2').offsetHeight +
                xdataElm.querySelector('h2').offsetHeight +
                tocElm.querySelector('h2').offsetHeight + (
                    mapaElm.offsetHeight -
                    toolsPanelElm.querySelector('.panel-content').offsetHeight)) +
            'px)';

        document.querySelector('.tc-ctl-lcat-search').style.height = 'calc(' +
            window.innerHeight + 'px - ' + (
                linksElm.offsetHeight +
                bmsElm.offsetHeight +
                catalogElm.querySelector('h2').offsetHeight +
                xdataElm.querySelector('h2').offsetHeight +
                tocElm.querySelector('h2').offsetHeight + (
                    mapaElm.offsetHeight -
                    toolsPanelElm.querySelector('.panel-content').offsetHeight)) +
            'px)';
    } else if (!xdataElm.classList.contains(TC.Consts.classes.COLLAPSED) && !catalogElm.classList.contains(TC.Consts.classes.COLLAPSED)) {
        arbolElm.style.height = 'calc(' +
            window.innerHeight + 'px - ' + (
                linksElm.offsetHeight +
                bmsElm.querySelector('h2').offsetHeight +
                catalogElm.querySelector('h2').offsetHeight +
                xdataElm.offsetHeight +
                tocElm.querySelector('h2').offsetHeight + (
                    mapaElm.offsetHeight -
                    toolsPanelElm.querySelector('.panel-content').offsetHeight)) +
            'px)';

        document.querySelector('.tc-ctl-lcat-search').style.height = 'calc(' +
            window.innerHeight + 'px - ' + (
                linksElm.offsetHeight +
                bmsElm.querySelector('h2').offsetHeight +
                catalogElm.querySelector('h2').offsetHeight +
                xdataElm.offsetHeight +
                tocElm.querySelector('h2').offsetHeight + (
                    mapaElm.offsetHeight -
                    toolsPanelElm.querySelector('.panel-content').offsetHeight)) +
            'px)';
    } else if (!tocElm.classList.contains(TC.Consts.classes.COLLAPSED) && !catalogElm.classList.contains(TC.Consts.classes.COLLAPSED)) {
        arbolElm.style.height = 'calc(' +
            window.innerHeight + 'px - ' + (
                linksElm.offsetHeight +
                bmsElm.querySelector('h2').offsetHeight +
                catalogElm.querySelector('h2').offsetHeight +
                xdataElm.offsetHeight +
                tocElm.offsetHeight + (
                    mapaElm.offsetHeight -
                    toolsPanelElm.querySelector('.panel-content').offsetHeight)) +
            'px)';

        document.querySelector('.tc-ctl-lcat-search').style.height = 'calc(' +
            window.innerHeight + 'px - ' + (
                linksElm.offsetHeight +
                bmsElm.querySelector('h2').offsetHeight +
                catalogElm.querySelector('h2').offsetHeight +
                xdataElm.querySelector('h2').offsetHeight +
                tocElm.offsetHeight + (
                    mapaElm.offsetHeight -
                    toolsPanelElm.querySelector('.panel-content').offsetHeight)) +
            'px)';
    } else {
        arbolElm.style.height = 'calc(' +
            window.innerHeight + 'px - ' + (
                linksElm.offsetHeight +
                bmsElm.querySelector('h2').offsetHeight +
                catalogElm.querySelector('h2').offsetHeight +
                xdataElm.querySelector('h2').offsetHeight +
                tocElm.querySelector('h2').offsetHeight + (
                    mapaElm.offsetHeight -
                    toolsPanelElm.querySelector('.panel-content').offsetHeight)) +
            'px)';

        document.querySelector('.tc-ctl-lcat-search').style.height = 'calc(' +
            window.innerHeight + 'px - ' + (
                linksElm.offsetHeight +
                bmsElm.querySelector('h2').offsetHeight +
                catalogElm.querySelector('h2').offsetHeight +
                xdataElm.querySelector('h2').offsetHeight +
                tocElm.querySelector('h2').offsetHeight + (
                    mapaElm.offsetHeight -
                    toolsPanelElm.querySelector('.panel-content').offsetHeight)) +
            'px)';
    }

    document.querySelector('.tc-ctl-legend-tree').style.height = 'calc(' + (window.innerHeight * 0, 85) + 'px';
}
*/

function getCookie(cname) {
  var name = cname + '=';
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return '';
}

function checkCookie() {
  var username = getCookie('username');
  if (username != '') {
    alert('Welcome again ' + username);
  } else {
    username = prompt('Please enter your name:', '');
    if (username != '' && username != null) {
      setCookie('username', username, 365);
    }
  }
}

window.onresize = ajustarPanell;

/*
function getCssProperty(elmId, property) {
    var elem = document.getElementById(elmId);
    return window.getComputedStyle(elem, null).getPropertyValue(property);
}

function matches(el, selector) {
    return (el.matches || el.matchesSelector || el.msMatchesSelector || el.mozMatchesSelector || el.webkitMatchesSelector || el.oMatchesSelector).call(el, selector);
};
*/

function vanillaNot(listTmp, element) {
  const list = Array.from(listTmp);
  const index = list.indexOf(element[0]);
  list.splice(index, 1);
  return list;
}

//# sourceURL=script_layout.js
