// =====================================================================================================================
// Proyecciones y nueva API de EPSG.io
// =====================================================================================================================

// TODO: Refactorizar tras actualizar de versión
//       El código actual solo es efectivo para la versión 3.0.1
//       Hay que actualizarlo a la versión 4.1.0 tras la primera migración

var projectionDataCache = projectionDataCache || {};

TC.getProjectionData = function (options) {
  options = options || {};
  const crs = options.crs || '';
  const match = crs.match(/\d{4,5}$/g);
  let code = match ? match[0] : '';

  const urlProj4 = TC.Consts.url.EPSG + code + '.proj4';
  const urlJSON = TC.Consts.url.EPSG + code + '.json';

  let projData = projectionDataCache[code];
  if (projData) {
    if (options.sync) {
      return projData;
    }
    return Promise.resolve(projData);
  }

  const fetchEPSGInfo = function(url) {
    let result;
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function (e) {
      if (xhr.readyState == 4) {
        if (xhr.status == 404) {
          result = false;
        } else if (xhr.status != 200) {
          result = false;
        } else {
          result = xhr.responseText;
        }
      }
    };

    xhr.open('GET', url, false);

    try {
      xhr.send(null);
    } catch (error) {
      result = false;
    }

    return result;
  };

  if (options.sync) {
    const resultJSON = fetchEPSGInfo(urlJSON);
    const resultProj4 = fetchEPSGInfo(urlProj4);

    if (resultJSON && resultProj4) {
      const parsed = JSON.parse(resultJSON);
      return {
        "number_result": 1,
        "results": [
          {
            "authority": parsed.id.authority.toString(),
            "code": parsed.id.code.toString(),
            "name": parsed.name.toString(),
            "proj4": resultProj4.toString()
          }
        ],
        "status": "ok"
      }
    }

    return null;
  }

  return new Promise(function (resolve, reject) {
    const toolProxification = new TC.tool.Proxification(TC.proxify);
    toolProxification.fetchJSON(urlJSON, options).then(function (data) {

      const resultProj4 = fetchEPSGInfo(urlProj4);
      if (resultProj4) {
        const result = {
          "number_result": 1,
          "results": [
            {
              "authority": data.id.authority.toString(),
              "code": data.id.code.toString(),
              "name": data.name.toString(),
              "proj4": resultProj4.toString()
            }
          ],
          "status": "ok"
        };

        projectionDataCache[code] = result;
        resolve(result);
      }
      return null;
    }).catch(function (error) {
      reject(error instanceof Error ? error : Error(error));
    });
  });
};
