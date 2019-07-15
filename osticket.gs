function respondToJoinFormSubmit(e) {
  //get sheetname from config
  var sheet = SpreadsheetApp.getActiveSheet();
  var sheetName = sheet.getName();
  for (var key in config.networks) {
    var network = config.networks[key];
    if (network.nodes === sheetName) {
      var thisSheet = sheet;
    }
  }

  // This logs the value in the very last cell of this sheet
  var lastRow = thisSheet.getLastRow() - 1;

  //get question fields by column header name
  //colName cannot contain spaces
  var node = lastRow;
  var name = getByName("Name", lastRow);
  var email = getByName("Email", lastRow);
  var phone = getByName("Phone", lastRow);
  var location = getByName("Location", lastRow);
  var rooftop = getByName("Rooftop Access", lastRow);
  var ncl = getByName("I agree to the Network Commons License", lastRow);
  var timestamp = getByName("Timestamp", lastRow);
  var id = getByName("ID", lastRow);

  Logger.log("name pre-check: " + name);
  //set blank name to email
  if (name === undefined) {
    name = email;
  }

  //build email subject
  if (rooftop === "I have Rooftop access") {
    rooftop = "Rooftop install";
    var emailTitle = "NYC Mesh Rooftop Install " + lastRow;
  } else {
    rooftop = "Standard install";
    var emailTitle = "NYC Mesh Install " + lastRow;
  }

  //set field values
  var message = "timestamp: " + timestamp + "\r\n";
  message += "node: " + id + "\r\n";
  message += "name: " + name + "\r\n";
  message += "email: " + email + "\r\n";
  message += "phone: " + phone + "\r\n";
  message += "location: " + location + "\r\n";
  message += "rooftop: " + rooftop + "\r\n";
  message += "agree to ncl: " + ncl;
  var subject = emailTitle;

  //json setup for post
  var url = "https://support.nycmesh.net/api/http.php/tickets.json";
  var data = {
    node: id,
    userNode: id,
    email: email,
    name: name,
    subject: subject,
    message: message,
    phone: phone,
    location: location,
    rooftop: rooftop,
    ncl: ncl,
    ip: "*.*.*.*"
  };
  var payload = JSON.stringify(data);

  var header = {
    "X-API-Key": config.osticket.APIKey
  };

  var options = {
    method: "POST",
    headers: header,
    muteHttpExceptions: true,
    payload: payload
  };

  try {
    //osticket api call
    var response = UrlFetchApp.fetch(url, options);

    //API error reporting
    if (/API/.test(response)) {
      //regex search
      MailApp.sendEmail(
        config.osticket.Admin,
        "API Error - New Node - osticket.gs",
        "API problem: " + response
      );
    }
    //general exception reporting
  } catch (e) {
    MailApp.sendEmail(
      config.osticket.Admin,
      "Error caught - New Node: osticket.gs",
      e
    );
  }

  // Slack join request webhook
  slackWebhook({
    location: location,
    rooftop: rooftop,
    id: id
  });
}

function slackWebhook(params) {
  const location = params.location;
  const rooftop = params.rooftop;
  const id = params.id;

  try {
    const body = {
      text: "New join request!",
      attachments: [
        {
          fallback:
            "New join request! " +
            location +
            " - https://www.nycmesh.net/map/nodes/",
          title: location,
          title_link: "https://www.nycmesh.net/map/nodes/" + id,
          fields: [
            {
              title: "Roof Access",
              value: "Yes"
            }
          ],
          color: "#777777"
        }
      ]
    };

    const slackURL =
      "https://hooks.slack.com/services/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";

    const slackOptions = {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      muteHttpExceptions: true,
      payload: JSON.stringify(body)
    };

    const slackResponse = UrlFetchApp.fetch(slackURL, slackOptions);
  } catch (error) {
    console.error(error);
  }
}

//calls value per column header name
//colName cannot contain spaces
function getByName(colName, row) {
  var sheet = SpreadsheetApp.getActiveSheet();
  var data = sheet.getDataRange().getValues();
  var col = data[0].indexOf(colName);
  if (col != -1) {
    Logger.log(colName + ": " + data[row - 1][col]);
    return data[row - 1][col];
  }
}
