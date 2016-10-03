(function() {
    if (!L.Edit) {
        // Leaflet.Draw not available.
        return;
    }

    L.Draw.forbiddenAreaMarker = L.Draw.Marker.extend({
        forbiddenArea: false,
        options: {
            distanceForbiddenArea: 60,
            msgForbidden: 'Other marker are too close !',
            forbiddenIcon: undefined
        },

        initialize: function(map, options) {
            // Save the type so super can fire, need to do this as cannot do this.TYPE :(
            this.type = L.Draw.Marker.TYPE;
            this._guides = [];
            L.Draw.Feature.prototype.initialize.call(this, map, options);
            // Save the type so super can fire, need to do this as cannot do this.TYPE :(
        },

        _onMouseMove: function(e) {

            var latlng = e.latlng;
            this._tooltip.updatePosition(latlng);
            this._mouseMarker.setLatLng(latlng);

            if (!this._marker) {
                this._marker = new L.Marker(latlng, {
                    icon: this.options.icon,
                    zIndexOffset: this.options.zIndexOffset
                });
                // Bind to both marker and map to make sure we get the click event.
                this._marker.on('click', this._onClick, this);
                this._map
                    .on('click', this._onClick, this)
                    .addLayer(this._marker);
            } else {
                latlng = this._mouseMarker.getLatLng();
                this._marker.setLatLng(latlng);
            }
            this._forbiddenAreaMarker(this._mouseMarker);
        },
        _onClick: function() {
            if (!this.forbiddenArea) {
                this._fireCreatedEvent();

                this.disable();
                if (this.options.repeatMode) {
                    this.enable();
                }
            }
        },

        addGuideLayer: function(layer) {
            for (var i = 0, n = this._guides.length; i < n; i++)
                if (L.stamp(layer) === L.stamp(this._guides[i]))
                    return;
            this._guides.push(layer);
        },

        _forbiddenAreaMarker: function(e) {
            var marker = e,
                latlng = marker.getLatLng();
            var closest = geomFunction.findClosestLayer(this._map,
                this.options.guideLayers,
                latlng,
                this.options.distanceForbiddenArea,
                false, true);

            closest = closest || { layer: null, latlng: null };

            this.forbiddenArea = closest.layer && closest.latlng;

            if ( this.forbiddenArea) {
              this._tooltip.updateContent({ text: this.options.msgForbidden })
              if (marker._icon) {
                marker.setOpacity(1);
                marker.setIcon(this.options.forbiddenIcon);
              }
            } else {
                marker.setOpacity(0);
                this._tooltip.updateContent({ text: 'Click map to place marker' });
            }
        },

        _fireCreatedEvent: function() {
            var marker = new L.Marker.Touch(this._marker.getLatLng(), { icon: this.options.icon, forbiddenArea: true, guides: this.options.guideLayers, distanceForbiddenArea: this.options.distanceForbiddenArea, forbiddenIcon: this.options.forbiddenIcon });
            L.Draw.Feature.prototype._fireCreatedEvent.call(this, marker);
        }
    });


    L.DrawToolbar.include({
        getModeHandlers: function(map) {
            return [{
                    enabled: this.options.polyline,
                    handler: new L.Draw.Polyline(map, this.options.polyline),
                    title: L.drawLocal.draw.toolbar.buttons.polyline
                },
                {
                    enabled: this.options.polygon,
                    handler: new L.Draw.Polygon(map, this.options.polygon),
                    title: L.drawLocal.draw.toolbar.buttons.polygon
                },
                {
                    enabled: this.options.rectangle,
                    handler: new L.Draw.Rectangle(map, this.options.rectangle),
                    title: L.drawLocal.draw.toolbar.buttons.rectangle
                },
                {
                    enabled: this.options.circle,
                    handler: new L.Draw.Circle(map, this.options.circle),
                    title: L.drawLocal.draw.toolbar.buttons.circle
                },
                {
                    enabled: this.options.marker,
                    handler: new L.Draw.Marker(map, this.options.marker),
                    title: L.drawLocal.draw.toolbar.buttons.marker
                },
                {
                    enabled: this.options.forbiddenAreaMarker,
                    handler: new L.Draw.forbiddenAreaMarker(map, this.options.forbiddenAreaMarker),
                    title: 'Forbidden Area Marker'
                }
            ];
        }
    });

    L.Edit.Marker = L.Handler.extend({

        initialize: function(marker, options) {
            this._marker = marker;
            L.setOptions(this, options);
        },

        addHooks: function() {
            var marker = this._marker;

            marker.dragging.enable();
            marker.on('dragend', this._onDragEnd);
            marker.on('dragstart', this._onDragStart);
            if (marker.options.forbiddenArea) {
              marker.on('move', L.bind(this._onDragMove, null, marker, marker.options.forbiddenIcon.options));
            }
            this._toggleMarkerHighlight();
        },

        removeHooks: function() {
            var marker = this._marker;

            marker.dragging.disable();
            marker.off('dragend', this._onDragEnd, marker);
            marker.off('dragstart', this._onDragStart, marker);
            if (marker.options.forbiddenArea) {
               marker.off('move');
            }
            this._toggleMarkerHighlight();
        },
        _onDragStart: function(e) {
            // save initial position
            this.initialLatLng = e.target._latlng;
        },
        _onDragMove: function(e, defaultIcon) {
            //change icon if marker is in forbidden area else default icon
            var marker = e,
                latlng = marker.getLatLng();
            var guides = [];
            marker.options.guides.getLayers().forEach(function(position) {
                position._leaflet_id !== marker._leaflet_id ? guides.push(position) : null;
            })

            var closest = geomFunction.findClosestLayer(marker._map,
                guides,
                latlng,
                marker.options.distanceForbiddenArea,
                false, false);

            closest = closest || { layer: null, latlng: null };

            this.forbiddenArea = closest.layer && closest.latlng;
            if (this.forbiddenArea) {
               L.DomUtil.addClass(marker._icon, defaultIcon.className);
            } else {
               L.DomUtil.removeClass(marker._icon, defaultIcon.className);
            }
        },
        _onDragEnd: function(e) {
            var marker = e.target ? e.target : e,
                latlng = marker.getLatLng();
            // set latlng initial position if forbidden area
            if (marker.options.forbiddenArea) {

                var guides = [];
                marker.options.guides.getLayers().forEach(function(position) {
                    position._leaflet_id !== marker._leaflet_id ? guides.push(position) : null;
                })

                var closest = geomFunction.findClosestLayer(marker._map,
                    guides,
                    latlng,
                    marker.options.distanceForbiddenArea,
                    false, false);

                closest = closest || { layer: null, latlng: null };
                this.forbiddenArea = closest.layer && closest.latlng;
                if (this.forbiddenArea) {
                    marker.setLatLng(marker.initialLatLng);
                    return;
                }
            }
            marker.edited = true;
            this._map.fire('draw:editmove', { layer: marker });
        },

        _toggleMarkerHighlight: function() {
            var icon = this._marker._icon;

            // Don't do anything if this layer is a marker but doesn't have an icon. Markers
            // should usually have icons. If using Leaflet.draw with Leaflet.markercluster there
            // is a chance that a marker doesn't.
            if (!icon) {
                return;
            }

            // This is quite naughty, but I don't see another way of doing it. (short of setting a new icon)
            icon.style.display = 'none';

            if (L.DomUtil.hasClass(icon, 'leaflet-edit-marker-selected')) {
                L.DomUtil.removeClass(icon, 'leaflet-edit-marker-selected');
                // Offset as the border will make the icon move.
                this._offsetMarker(icon, -4);

            } else {
                L.DomUtil.addClass(icon, 'leaflet-edit-marker-selected');
                // Offset as the border will make the icon move.
                this._offsetMarker(icon, 4);
            }

            icon.style.display = '';
        },

        _offsetMarker: function(icon, offset) {
            var iconMarginTop = parseInt(icon.style.marginTop, 10) - offset,
                iconMarginLeft = parseInt(icon.style.marginLeft, 10) - offset;

            icon.style.marginTop = iconMarginTop + 'px';
            icon.style.marginLeft = iconMarginLeft + 'px';
        }
    });

    L.Marker.addInitHook(function() {
        if (L.Edit.Marker) {
            this.editing = new L.Edit.Marker(this);

            if (this.options.editable) {
                this.editing.enable();
            }
        }
    });

    geomFunction = {
        findClosestLayer: function(map, layers, latlng, tolerance, withVertices, group) {
            var closestLayer = group ? L.GeometryUtil.closestLayer(map, layers.getLayers(), latlng) :  L.GeometryUtil.closestLayer(map, layers, latlng);
            return closestLayer && L.GeometryUtil.length([closestLayer.latlng, latlng]) < tolerance ? closestLayer : null;
        }
    }
})();
