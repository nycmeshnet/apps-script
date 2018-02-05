function nodesToGeography (nodes, opts) {
  var features = []
  var properties = [ 'id', 'status' ]
  for (var id in nodes) {
    var node = nodes[id]
    if (!node.latitude || !node.longitude) continue
    var feature = {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [
          node.longitude,
          node.latitude,
          node.altitude || 5
        ]
      },
      properties: {}
    }
    if (!node.name) {
      feature.properties.name = node.id
    }
    feature.properties['marker-color'] = node.status === 'Installed' ? config.colors.active : config.colors.inactive
    if (opts && opts.view) {
      feature.properties.view = opts.view.replace(/\$id/g, node.id)
    }
    properties.forEach(function (key) {
      feature.properties[key] = node[key]
    })
    features.push(feature)
  }
  return features
}

function linksToGeography (links, nodes) {
  var features = []
  var properties = [ 'status' ]
  for (var id in links) {
    var link = links[id]
    var upstream = nodes[link['from']]
    var downstream = nodes[link['to']]
    if (!upstream || !upstream.latitude || !upstream.longitude) continue
    if (!downstream || !downstream.latitude || !downstream.longitude) continue
    var feature = {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [
          [ upstream.longitude, upstream.latitude, upstream.altitude || 5 ],
          [ downstream.longitude, downstream.latitude, downstream.altitude || 5 ]
        ]
      },
      properties: {}
    }
    feature.properties.name = link.id
    feature.properties.stroke = link.status === 'active' ? config.colors.active : config.colors.inactive
    feature.properties.fill = '#000000'
    feature.properties['fill-opacity'] = 0.25
    properties.forEach(function (key) {
      feature.properties[key] = link[key]
    })
    features.push(feature)
  }
  features.sort(function (a, b) {
    return getTallestEnd(a) - getTallestEnd(b)
  })
  return features
}

function getTallestEnd (link) {
  var n1 = link.geometry.coordinates[0][2]
  var n2 = link.geometry.coordinates[1][2]
  return Math.max(n1, n2)
}
