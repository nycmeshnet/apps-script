// onEdit handlers
// https://developers.google.com/apps-script/guides/triggers

function onEdit (evt) {
  var sheet = SpreadsheetApp.getActiveSheet()
  var handlers = {}
  // handler for edits to nodes table
  handlers[config.sheets.nodes] = onnodeChange
  var handler = handlers[sheet.getName()]
  if (handler) {
    evt.sheet = sheet
    handler(evt)
  }
}

function onnodeChange (evt) {
  var sheet = evt.sheet
  var nodes = getObjects(sheet, evt.range.getHeight(), evt.range.getRow() - 2)
  for (var id in nodes) {
    var node = nodes[id]
    if (!isEmpty(node.address) && isNaN(parseInt(node.id, 10))) {
      sheet.getRange(node.index + 2, nodes.keys.indexesByKey['id'] + 1).setValue(node.index + 2)
    }
    if (isEmpty(node.latitude) || isEmpty(node.longitude)) {
      if (!isEmpty(node.location)) {
        var location = geocode(node.location)
        if (location) {
          sheet.getRange(node.index + 2, nodes.keys.indexesByKey['latitude'] + 1).setValue(location.lat)
          sheet.getRange(node.index + 2, nodes.keys.indexesByKey['longitude'] + 1).setValue(location.lng)
        }
      }
    }
  }
}

// http api handlers
// https://developers.google.com/apps-script/guides/web

function doGet (req) {
  var method = httpApi[req.parameter.method]
  if (!method || !method.GET) {
    throw new Error('not found')
  }
  return method.GET(req)
}

function doPost (req) {
  var method = httpApi[req.parameter.method]
  if (!method || !method.POST) {
    throw new Error('not found')
  }
  return method.POST(req)
}
