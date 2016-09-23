var assert = chai.assert;
var guideLayers;
var markerForbidden;

describe('Start', function() {
    before(function() {
          var editableMarkers = new L.FeatureGroup();

        var osm = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: 'Map data &copy; 2013 OpenStreetMap contributors',
        });

        var map = L.map('map')
            .setView([48.49, 1.4], 16)
            .addLayer(osm);

        var marker = L.marker([48.488, 1.395]).addTo(map);
        markerForbidden = L.marker([48.492, 1.395]).addTo(map);;
        
        var groupMarkers = [marker];
        editableMarkers.addLayer(marker);
        editableMarkers.addLayer(markerForbidden);
        map.addLayer(editableMarkers);     
        
        var options = {
            position: 'topright',
            draw: {
                polyline: false,
                polygon: false,
                circle: false,
                rectangle: false,
                marker: true,
                forbiddenAreaMarker: {
                    guideLayers: groupMarkers,
                    distanceForbiddenArea: 300,
                    msgForbidden: 'Other marker are too close !'
                },
            },
            edit: {
                featureGroup: editableMarkers,
                remove: false
            }
        };

        var drawControl = new L.Control.Draw(options);
        map.addControl(drawControl);

        markerForbidden.options.forbiddenArea = true;
        markerForbidden.options.guides = groupMarkers;
        markerForbidden.options.distanceForbiddenArea = 150;
        markerForbidden.options.verticl = 150;
        markerForbidden.initialLatLng = [48.492, 1.395];

        map.on('draw:created', function(e) {
            var layer = e.layer;
            map.addLayer(layer);
            groupMarkers.push(layer);
            editableMarkers.addLayer(layer);
        });
        

    });


    beforeEach(function() {
    });

    afterEach(function() {
        // takeScreenshot()
    });

    // TEST
    describe('Test forbidden area', function() {
        it("Should not validate the new latlng", function(done) {
            markerForbidden.editing.enable();
            markerForbidden.setLatLng([48.488, 1.395]);
            var newLatLng = markerForbidden.getLatLng();
            markerForbidden.editing._onDragEnd(markerForbidden);
            assert.isTrue(markerForbidden.getLatLng() !==  newLatLng);
            done();
        });
    });

});

function takeScreenshot() {
  if (window.callPhantom) {
    var date = new Date()
    var filename = "screenshots/" + date.getTime()
    console.log("Taking screenshot " + filename)
    callPhantom({'screenshot': filename})
  }
}