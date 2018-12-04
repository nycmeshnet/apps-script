var httpApi = {
  geography: {
    GET: function (req) {
      var spreadsheet = SpreadsheetApp.getActiveSpreadsheet()
      var networkId = req.parameter.network
      var network = null
      if (networkId) {
        network = config.networks[networkId]
        if (!network) {
          network = {
            nodes: networkId,
            links: networkId + '-links'
          }
        }
      } else {
        network = config.networks._default_
      }
      if (req.parameter.links) {
        network.links = req.parameter.links
      }
      var nodes = getObjects(
        spreadsheet.getSheetByName(network.nodes),
        req.parameter.limit,
        req.parameter.offset
      )
      var links = getObjects(
        spreadsheet.getSheetByName(network.links)
      )
      for (var id in links) {
        var link = links[id]
        if (link.status === 'dead') {
          delete links[id]
        }
      }
      for (var id in nodes) {
        id = id + ''
        var node = nodes[id]
        if (node.status === 'Abandoned' ||
            node.status === 'Not Interested' ||
            node.status === 'Unsubscribe') {
          delete nodes[id]
          continue
        }
        if (!req.parameter.sparse) {
          continue
        }
        var isLinked = false
        for (var linkId in links) {
          var link = links[linkId]
          var from = link.from + ''
          var to = link.to + ''
          if (from === id || to === id) {
            isLinked = true
            break
          }
        }
        if (!isLinked) {
          delete nodes[id]
        }
      }
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
  },
  data: {
    GET: function (req) {
      if (req.parameter.secret !== 'c886e13a852bd9f6a8e3af59e1b2e601') {
        return respond('Unauthorized')
      }
      var spreadsheet = SpreadsheetApp.getActiveSpreadsheet()
      var rows = getObjects(
        spreadsheet.getSheetByName(req.parameter.sheet),
        req.parameter.limit,
        req.parameter.offset
      )
      return respond(JSON.stringify(rows, null, 2))
    }
  },
  nodes: {
    GET: function (req) {
      const spreadsheet = SpreadsheetApp.getActiveSpreadsheet()
      const network = config.networks._default_
     
      const nodeSheet = spreadsheet.getSheetByName(network.nodes)
      const linkSheet = spreadsheet.getSheetByName(network.links)
      const sectorSheet = spreadsheet.getSheetByName(network.sectors)
      
      const nodes = getObjects(nodeSheet)
      const links = getObjects(linkSheet)
      const sectors = getObjects(sectorSheet)

      const response = {
        nodes: nodesToJSON(nodes),
        links: linksToJSON(links),
        sectors: sectorsToJSON(sectors)
      }
      
      return respond(JSON.stringify(response, null, 2))
    }
  }
}

function respond (object) {
  return ContentService.createTextOutput(object)
}
