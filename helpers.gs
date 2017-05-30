var project = 'xxx'
var secret = 'xxx'
var sheetId = 'xxx'
var folderId = 'xxx'
var watchers = [ 'xxx' ]

function onEdit () {
  var data = read()
  var payload = {
    name: project,
    secret: secret,
    data: data
  }
  watchers.forEach(function (watcher) {
    try {
      UrlFetchApp.fetch(watcher, {
        method: 'POST',
        payload: JSON.stringify(payload)
      })
    } catch (err) {
      Logger.log(err)
    }
  })
}

function doGet () {
  return ContentService.createTextOutput(
    JSON.stringify(read(), null, 2)
  )
}

function read () {
  var ctx = {
    spreadSheet: SpreadsheetApp.openByUrl('https://docs.google.com/spreadsheets/d/' + sheetId + '/edit'),
    assets: DriveApp.getFolderById(folderId),
    objects: {}
  }

  ctx.spreadSheet.getSheets()
    .forEach(eachSheet.bind(ctx))

  return ctx.objects
}

function eachSheet (sheet) {
  this.sheet = sheet
  this.type = sheet.getName()
  sheet.getDataRange().getValues()
    .forEach(eachRow.bind(this))
}

function eachRow (row, y) {
  if (y === 0) {
    this.fields = row
  } else {
    this.object = {}
    this.y = y
    row.forEach(eachColumn.bind(this))
    var id = this.object.id
    if (!id && id !== 0) {
      id = genId()
    }
    this.object.type = this.type
    this.objects[id] = this.object
  }
}

function eachColumn (column, x) {
  var key = this.fields[x]
  if (key === 'id') {
    if (!column && column !== 0) {
      column = genId()
      this.sheet.getRange(this.y + 1, x + 1)
        .setValue(column)
    }
    column = String(column)
  } else if (/^(\w|-){1,}\.\w{2,}$/.test(column)) {
    var extension = column.split('.').slice(-1)[0]
    var files = this.assets.getFilesByName(column)
    if (files.hasNext()) {
      var file = files.next()
      column = file.getId() + '.' + extension
    }
  }
  this.object[key] = column
}

function genId () {
  var d = (+new Date()).toString(16)
  var r = parseInt((Math.random() + '').slice(2, 7)).toString(16)
  return d + r
}
