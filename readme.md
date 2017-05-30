# nycmesh-apps-script
Apps Script for NYC Mesh spreadsheet database.

## Events
* The [`onEdit`](https://developers.google.com/apps-script/guides/triggers) handler is implemented which ensures each node's ID field is populated and geocodes its addresses if possible.

## HTTP API
Note `<script-id>` will be generated after publishing as a web app.
* GET `https://script.google.com/macros/s/<script-id>/exec?method=geography&format=json|kml`

## Google Earth
To use with Google Earth, make sure the script is published as a web app, then paste or import the following KML file into "My Places" (make sure to replace `<script-id>`):
``` xml
<NetworkLink>
  <name>NYC Mesh</name>
  <flyToView>0</flyToView>
  <Link>
    <href>https://script.google.com/macros/s/<script-id>/exec?method=geography&amp;format=kml</href>
    <viewRefreshMode>onRequest</viewRefreshMode>
  </Link>
</NetworkLink>
```
