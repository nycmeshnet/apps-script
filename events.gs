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
  var row = evt.range.getRow() - 2
  var height = evt.range.getHeight()
  if (row < 0) {
    row = 0
    height -= 1
  }
  var sheet = evt.sheet
  var nodes = getObjects(sheet, height, row)
  for (var id in nodes) {
    var node = nodes[id]
    if (!isEmpty(node.location) && isNaN(parseInt(node.id, 10))) {
      sheet.getRange(node.index + 2, nodes.keys.indexesByKey['id'] + 1).setValue(node.index + 2)
    }
    if (isEmpty(node.latitude) || isEmpty(node.longitude)) {
      var oldLatLng = node['lat/lng']
      if (!isEmpty(oldLatLng)) {
        var parts = oldLatLng.split(',').map(part => parseFloat(part, 10))
        if (parts.length === 2) {
          sheet.getRange(node.index + 2, nodes.keys.indexesByKey['latitude'] + 1).setValue(parts[0])
          sheet.getRange(node.index + 2, nodes.keys.indexesByKey['longitude'] + 1).setValue(parts[1])
        }
      } else if (!isEmpty(node.location)) {
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
