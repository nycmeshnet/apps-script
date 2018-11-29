var config = {
  mapsApiKey: '<your-api-key>',
  osticket: '<your-api-key>',
  webhooks: {
    change: [
      '<netlify-build-hook>'
    ]
  },
  networks: {
    _default_: {
      nodes: 'Form Responses 1',
      links: 'Links',
      sectors: 'Sectors',
      view: 'https://nycmesh.net/panorama/$id.jpg'
    }
  },
  colors: {
    active: '#F00',
    inactive: '#CCC'
  }
}

