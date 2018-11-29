function nodesToGeography (nodes, opts) {
  var features = []
  var properties = [ 'id', 'status', 'notes' ]
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
    feature.properties.name = node.id
    feature.properties.roofAccess = !!node['rooftop access']
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
  var properties = [ 'status', 'from', 'to' ]
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
    feature.properties['fill-opacity'] = 0.3
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

function nodesToJSON(nodes) {
  var json = []
  for (var id in nodes) {
    var node = nodes[id]
    json.push({
      id: node.id,
      name: node.nodename,
      status: node.status,
      notes: node.notes,
      roofAccess: !!node['rooftop access'],
      requestDate: node.timestamp && node.timestamp.getTime ? node.timestamp.getTime() : undefined,
      installDate: node.installdate && node.installdate.getTime ? node.installdate.getTime() : undefined,
      abandonDate: node.abandondate && node.abandondate.getTime ? node.abandondate.getTime() : undefined,
      coordinates: [
        node.longitude,
        node.latitude,
        node.altitude || 5
      ],
    })
  }
  return json
}


function linksToJSON(links) {
  var json = []
  for (var id in links) {
    var link = links[id]
    json.push({
      from: link.from,
      to: link.to,
      status: link.status,
      installDate: link.installdate && link.installdate.getTime ? link.installdate.getTime() : undefined,
      abandonDate: link.abandondate && link.abandondate.getTime ? link.abandondate.getTime() : undefined,
    })
  }
  return json
}

function sectorsToJSON(sectors) {
  var json = []
  for (var id in sectors) {
    var sector = sectors[id]
    json.push({
      nodeId: sector.nodeid,
      radius: sector.radius,
      azimuth: sector.azimuth,
      width: sector.width,
      status: sector.status,
      device: sector.device,
      installDate: sector.installdate && sector.installdate.getTime ? sector.installdate.getTime() : undefined,
      abandonDate: sector.abandondate && sector.abandondate.getTime ? sector.abandondate.getTime() : undefined,
    })
  }
  return json
}

function getTallestEnd (link) {
  var n1 = link.geometry.coordinates[0][2]
  var n2 = link.geometry.coordinates[1][2]
  return Math.max(n1, n2)
}
