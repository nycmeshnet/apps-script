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

function reverseGeocode (position) {
  var url = 'https://maps.googleapis.com/maps/api/geocode/json?&key=' + config.mapsApiKey + '&latlng=' + position.latitude + ',' + position.longitude
  try {
    var response = JSON.parse(UrlFetchApp.fetch(url, {
      method: 'GET'
    }))
  } catch (err) {
    Logger.log(err)
  }
  return response && response.results && response.results[0]
}

function convertAddressToLatLong (address) {
  var location = geocode(address)
  return location.lat.toFixed(6) + ', ' + location.lng.toFixed(6)
}

function isEmpty (value) {
  return !value && value !== 0
}

if (!Array.prototype.find) {
  Array.prototype.find = function (itr) {
    for (var i = 0; i < this.length; i++) {
      var object = this[i]
      if (itr(object, i)) return object
    }
  }
}
