// onEdit handlers
// https://developers.google.com/apps-script/guides/triggers

function onEdit (evt) {
  var sheet = SpreadsheetApp.getActiveSheet()
  var row = evt.range.getRow() - 2
  var height = evt.range.getHeight()
  if (row < 0) {
    row = 0
    height -= 1
  }
  evt = {
    keys: getKeys(sheet).indexesByKey,
    objects: getObjects(sheet, height, row)
  }

  // ensure ids
  if (!isEmpty(evt.keys.id)) {
    checkId(evt)
  }

  // ensure lat / lng
  if (!isEmpty(evt.keys.location) && !isEmpty(evt.keys.latitude) && !isEmpty(evt.keys.longitude)) {
    checkGeocode(evt)
  }

  // set changed flag to trigger website deploy
  const network = config.networks._default_
  const nodes = network.nodes
  const links = network.links
  const sectors = network.sectors
  if ([nodes, links, sectors].indexOf(sheet.getName()) > -1) {
    var cache = CacheService.getDocumentCache()
    cache.put('changed', true, 60 * 35)
  }
}

function checkId (evt) {
  for (var id in evt.objects) {
    var object = evt.objects[id]
    var empty = true
    for (var prop in object) {
      if (!isEmpty(object[prop])) {
        empty = false
        break
      }
    }
    if (!empty && isNaN(parseInt(object.id, 10))) {
      object.setField('id', object.index + 2)
    }
  }
}

function checkGeocode (evt) {
  for (var id in evt.objects) {
    var node = evt.objects[id]
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
    if (!isEmpty(evt.keys.neighborhood) && isEmpty(node.neighborhood) && !isEmpty(node.latitude) && !isEmpty(node.longitude)) {
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
