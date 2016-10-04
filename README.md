Leaflet.ForbiddenArea.js
============

Add new marker type (ForbiddenArea) to leaflet.Draw Toolbar.

Prohibit the placement of its markers if they are too close to another layer.

Check out the [demo](https://makinacorpus.github.io/Leaflet.ForbiddenArea/) !


It depends on [Leaflet.GeometryUtil](https://github.com/makinacorpus/Leaflet.GeometryUtil).

For creation and edition, it also depends on [Leaflet.draw](https://github.com/Leaflet/Leaflet.draw).

Install
-----
In order to use this plugin in your app you can either:
* install it via your favorite package manager:
    * `npm i leaflet-forbiddenarea`
    * `bower install git@github.com:makinacorpus/Leaflet.ForbiddenArea.git`
* download the repository and import the `leaflet.forbiddenarea.js` file in your app.

Usage
-----

* Add ``leaflet.forbiddenarea.js`` and ``leaflet.geometryutil.js`` and ``leaflet.draw.js``

### For markers :

```javascript

 var editableMarkers = new L.FeatureGroup();
        var osm = L.tileLayer('//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: 'Map data &copy; 2013 OpenStreetMap contributors',
        });
        var map = L.map('map')
            .setView([48.49, 1.4], 16)
            .addLayer(osm);
        var marker = L.marker([48.488, 1.395]).addTo(map);
        editableMarkers.addLayer(marker);
        map.addLayer(editableMarkers);
        
        var forbiddenIcon = L.icon({
                      iconUrl: './marker-forbidden.png',
                      iconSize: [28, 42],
                      iconAnchor: [14, 42],
                      className: 'marker-forbidden',
                    });
        var options = {
            position: 'topright',
            draw: {
                polyline: false,
                polygon: false,
                circle: false,
                rectangle: false,
                marker: true,
                forbiddenAreaMarker: {
                    guideLayers: editableMarkers,
                    distanceForbiddenArea: 300,
                    msgForbidden: 'Other marker are too close !',
                    forbiddenIcon: forbiddenIcon,
                    icon : new L.Icon.Default()
                },
            },
            edit: {
                featureGroup: editableMarkers,
                remove: false
            }
        };
        var drawControl = new L.Control.Draw(options);
        map.addControl(drawControl);
        map.on('draw:created', function(e) {
            var layer = e.layer;
            map.addLayer(layer);
            editableMarkers.addLayer(layer);
        });

```

### 0.0.3

* prohibit the placement of a marker if it is too close to another.ex

TODO
----

* Keep default icon marker for forbidden marker type, but can be cool if we can choose an other if we want (toolbar)
* Show forbidden zone around layer
Authors
-------

* Bastien Alvez

[![Makina Corpus](http://depot.makina-corpus.org/public/logo.gif)](http://makinacorpus.com)
