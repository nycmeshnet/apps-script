var httpApi = {
  geography: {
    GET: function (req) {
      var spreadsheet = SpreadsheetApp.getActiveSpreadsheet()
      var networkId = req.parameter.network
      var network = config.networks[networkId || '_default_']
      var nodes = getObjects(
        spreadsheet.getSheetByName(network.nodes),
        req.parameter.limit,
        req.parameter.offset
      )
      var links = getObjects(
        spreadsheet.getSheetByName(network.links)
      )
      var featureCollection = {
        type: 'FeatureCollection',
        features: nodesToGeography(nodes, network).concat(linksToGeography(links, nodes))
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
