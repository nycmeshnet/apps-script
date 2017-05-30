function geocode (address) {
  // Apps Script's built-in geocoding wrapper gets rate limited really quickly
  var url = 'https://maps.googleapis.com/maps/api/geocode/json?&key=' + config.mapsApiKey + '&address=' + encodeURIComponent(address)
  try {
    var response = JSON.parse(UrlFetchApp.fetch(url, {
      method: 'GET'
    }))
  } catch (err) {
    Logger.log(err)
  }
  var result = response && response.results && response.results[0]
  if (!result) return
  return response.results[0].geometry.location
}

function convertAddressToLatLong (address) {
  var location = geocode(address)
  return location.lat.toFixed(6) + ', ' + location.lng.toFixed(6)
}

function isEmpty (value) {
  return !value && value !== 0
}
