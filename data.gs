function getKeys (sheet) {
  var keys = {
    keysByIndex: [],
    indexesByKey: {}
  }
  sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].forEach(function (key, i) {
    key = key.toLowerCase()
    keys.keysByIndex[i] = key
    keys.indexesByKey[key] = i
  })
  return keys
}

function getValues (sheet, limit, offset) {
  if (!limit) limit = sheet.getLastRow() - 1
  if (!offset) offset = 0
  return sheet.getRange(offset + 2, 1, limit, sheet.getLastColumn()).getValues()
}

function getObjects (sheet, limit, offset) {
  var name = sheet.getName()
  var keys = getKeys(sheet)
  var values = getValues(sheet, limit, offset)
  var objects = {}
  values.forEach(function (row, i) {
    var object = {}
    var empty = true
    row.forEach(function (column, n) {
      if (isEmpty(column)) return
      var key = keys.keysByIndex[n]
      object[key] = column
      empty = false
    })
    if (empty) return
    object.index = (offset || 0) + i
    if (!object.id) {
      object.id = name + '-' + object.index
    }
    objects[object.id] = object
    Object.defineProperty(object, 'setField', {
      value: setField,
      enumerable: false
    })
  })
  Object.defineProperty(objects, 'keys', {
    get: function () { return keys },
    enumerable: false
  })
  function setField (field, value) {
    sheet.getRange(this.index + 2, keys.indexesByKey[field] + 1).setValue(value)
  }
  return objects
}
