// onEdit handlers
// https://developers.google.com/apps-script/guides/triggers

function onEdit (evt) {
  var sheet = SpreadsheetApp.getActiveSheet()
  const network = config.networks._default_
  const nodes = network.nodes
  const links = network.links
  const sectors = network.sectors
  
  if ([nodes, links, sectors].indexOf(sheet.getName()) === -1) {
    return
  } 
  //var keys = getKeys(sheet).indexesByKey
  //if (keys.location === undefined) return
  //if (keys.latitude === undefined) return
  //if (keys.longitude === undefined) return
  evt.sheet = sheet
  onnodeChange(evt)
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
      node.setField('id', node.index + 2)
    }
    if (isEmpty(node.latitude) || isEmpty(node.longitude)) {
      var oldLatLng = node['lat/lng']
      if (!isEmpty(oldLatLng)) {
        var parts = oldLatLng.split(',').map(function (part) {
          return parseFloat(part, 10)
        })
        if (parts.length === 2) {
          node.setField('latitude', parts[0])
          node.setField('longitude', parts[1])
        }
      } else if (!isEmpty(node.location)) {
        var location = geocode(node.location)
        if (location) {
          node.setField('latitude', location.lat)
          node.setField('longitude', location.lng)
        }
      }
    }
    if (isEmpty(node.neighborhood) && !isEmpty(node.latitude) && !isEmpty(node.longitude)) {
      var address = reverseGeocode(node)
      if (address) {
        var neighborhood = address.address_components.find(function (component) {
          return component.types.find(function (fieldName) {
            return fieldName === 'neighborhood'
          })
        })
        if (neighborhood) {
          node.setField('neighborhood', neighborhood.long_name)
        }
      }
    }
  }
  var cache = CacheService.getDocumentCache()
  cache.put('changed', true, 60 * 35)
}

function oneveryTenMintues () {
  var cache = CacheService.getDocumentCache()
  var changed = cache.get('changed')
  if (changed) {
    cache.remove('changed')
    webhooks.dispatch('change')
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
