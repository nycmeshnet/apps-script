var httpApi = {
  geography: {
    GET: function (req) {
      var spreadsheet = SpreadsheetApp.getActiveSpreadsheet()
      var nodes = getObjects(
        spreadsheet.getSheetByName(config.sheets.nodes),
        req.parameter.limit,
        req.parameter.offset
      )
      var links = getObjects(
        spreadsheet.getSheetByName(config.sheets.links)
      )
      var featureCollection = {
        type: 'FeatureCollection',
        features: nodesToGeography(nodes).concat(linksToGeography(links, nodes))
      }
      var format = req.parameter.format
      if (format === 'kml') {
        return respond(toKml(featureCollection))
      }
      return respond(JSON.stringify(featureCollection, null, 2))
    }
  }
}

function respond (object) {
  return ContentService.createTextOutput(object)
}
