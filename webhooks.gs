var webhooks = {
  dispatch: function (name) {
    var hooks = config.webhooks && config.webhooks[name] || []
    hooks.forEach(function (url) {
      try {
        UrlFetchApp.fetch(url, { method: 'POST' })
      } catch (err) {
        Logger.log(err)
      }
    })
  }
}
