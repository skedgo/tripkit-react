import Util from "./Util";
var LatLng = google.maps.LatLng;
var Map = google.maps.Map;
var Size = google.maps.Size;
var ImageMapType = google.maps.ImageMapType;
var MapTypeId = google.maps.MapTypeId;
import NetworkUtil from "./NetworkUtil";
var GMapUtil = /** @class */ (function () {
    function GMapUtil() {
    }
    GMapUtil.initMap = function () {
        var _this = this;
        // Extract latLng and zoom from url with form /@/LAT,LONG,ZOOMz
        var urlLatLng = null;
        var urlMapZoom = null;
        var pathname = window.location.pathname;
        if (pathname.includes("/@/")) {
            var mapPositionString = pathname.substring(pathname.indexOf("/@/") + "/@/".length, pathname.length);
            if (mapPositionString.includes("z")) {
                mapPositionString = mapPositionString.substring(0, mapPositionString.indexOf("z"));
                var data = mapPositionString.split(",");
                urlLatLng = new LatLng(Number(data[0]), Number(data[1]));
                urlMapZoom = Number(data[2]);
            }
        }
        var mapContainer = document.getElementById('map-canvas');
        if (!mapContainer) {
            return;
        }
        var panoramaOptions = {
            addressControlOptions: { position: google.maps.ControlPosition.BOTTOM_LEFT },
            zoomControlOptions: { position: google.maps.ControlPosition.RIGHT_TOP },
            enableCloseButton: true,
            visible: false // set to false so streetview is not triggered on the initial map load
        };
        var panorama = new google.maps.StreetViewPanorama(mapContainer, panoramaOptions);
        var mapZoom = GMapUtil.isShowWorld || urlMapZoom === null ? 2 : urlMapZoom; // Fit world if urlLatLng is unknown and try to geolocate.
        var mapCenter = GMapUtil.isShowWorld || urlMapZoom === null ? new LatLng(10, 0) : urlLatLng;
        var mapTypePosition = GMapUtil.isWidget && !GMapUtil.isComWidget ? google.maps.ControlPosition.RIGHT_BOTTOM : google.maps.ControlPosition.RIGHT_TOP;
        var mapOptions = {
            zoom: mapZoom,
            minZoom: 2,
            center: mapCenter,
            panControl: false,
            mapTypeControl: false,
            mapTypeControlOptions: {
                position: mapTypePosition
            },
            zoomControl: false,
            zoomControlOptions: {
                style: google.maps.ZoomControlStyle.SMALL,
                position: google.maps.ControlPosition.RIGHT_CENTER
            },
            streetViewControl: false,
            fullscreenControl: false,
            styles: [
                {
                    featureType: "transit.station",
                    elementType: "all",
                    stylers: [
                        { visibility: "off" }
                    ]
                },
                {
                    featureType: "poi",
                    elementType: "labels",
                    stylers: [
                        { visibility: "off" }
                    ]
                }
            ],
            streetView: panorama
        };
        if (GMapUtil.isCityStats) {
            mapOptions.styles.push({
                featureType: "road",
                elementType: "labels",
                stylers: [
                    { visibility: "off" }
                ]
            });
        }
        this.preloadedMap = new Map(mapContainer, mapOptions);
        mapContainer.style.height = window.innerHeight + 'px';
        google.maps.event.addListener(this.preloadedMap, 'center_changed', function () {
            _this.restrictToWorld(_this.preloadedMap);
        });
        google.maps.event.addListener(this.preloadedMap, 'zoom_changed', function () {
            _this.restrictToWorld(_this.preloadedMap);
        });
        if (urlLatLng == null && !GMapUtil.isShowWorld) {
            // Fallback to HTML5 geolocation (potentially asking user permission) just if not on widget.
            this.getCurrentLocation(true, !GMapUtil.isWidget, function (coords) {
                _this.initialUserPosition = coords;
                _this.fitMap(coords);
            });
        }
    };
    // If the map position is out of range, move it back
    GMapUtil.restrictToWorld = function (map) {
        if (map.getBounds() == null) {
            return;
        }
        var latNorth = map.getBounds().getNorthEast().lat();
        var latSouth = map.getBounds().getSouthWest().lat();
        var newLat;
        var tolerance = 2; // Set tolerance to avoid too much recursion due to correcting less than needed. That may
        // happen since due to map projection, the difference calculated at higher latitudes is not
        // enough to properly correct center which is at lower latitudes.
        if (latNorth < 85 && latSouth > -85) { /* in both side -> it's ok */
            return;
        }
        else if (latNorth > 85 && latSouth < -85) { /* out both side -> it's ok */
            return;
        }
        else if (latNorth > 85) {
            newLat = map.getCenter().lat() - (latNorth - 85) - tolerance;
            /* too north, centering */
        }
        else if (latSouth < -85) {
            newLat = map.getCenter().lat() - (latSouth + 85) + tolerance;
            /* too south, centering */
        }
        if (newLat) {
            var newCenter = new LatLng(newLat, map.getCenter().lng());
            map.setCenter(newCenter);
        }
    };
    GMapUtil.addOsmMapType = function (map) {
        var osmName = "OSM";
        var url = "	http://otile1.mqcdn.com/tiles/1.0.0/map/";
        var mapTypeIds = [];
        // OSM Type
        var osmTypeOptions = {
            getTileUrl: function (coord, zoom) {
                return url + zoom + "/" + coord.x + "/" + coord.y + ".jpg";
            },
            tileSize: new Size(256, 256),
            name: osmName,
            maxZoom: 18
        };
        var osmMapType = new ImageMapType(osmTypeOptions);
        map.mapTypes.set(osmName, osmMapType);
        for (var type in MapTypeId) {
            if (MapTypeId.hasOwnProperty(type)) {
                mapTypeIds.push(MapTypeId[type]);
            }
        }
        mapTypeIds.push(osmName);
        map.setOptions({ mapTypeControlOptions: { mapTypeIds: mapTypeIds, position: google.maps.ControlPosition.RIGHT_TOP } });
    };
    GMapUtil.getCurrentLocation = function (gmaps, fallback, callback) {
        var _this = this;
        if (gmaps) {
            fetch("https://www.googleapis.com/geolocation/v1/geolocate?key=" + "AIzaSyBNHDLhhQ3XCeu-mD8CsVqH1woeMncu7Ao", {
                method: 'post'
            })
                .then(NetworkUtil.jsonCallback)
                .then(function (jsonData) {
                callback({ latitude: jsonData.location.lat, longitude: jsonData.location.lng });
            })
                .catch(function (reason) {
                if (fallback) {
                    _this.getCurrentLocation(false, false, callback);
                }
            });
        }
        else {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function (result) {
                    callback(result.coords);
                }, function (error) {
                    if (fallback) {
                        _this.getCurrentLocation(true, false, callback);
                    }
                });
            }
        }
    };
    GMapUtil.fitMapWidget = function (position) {
        this.preloadedMap.setZoom(12);
        this.setCenter(new google.maps.LatLng(position.latitude, position.longitude), 400, 0, 0, 0);
        this.alreadyFitWidget = true;
    };
    GMapUtil.fitMap = function (position) {
        var _this = this;
        if (window.location.pathname.includes("widget/com")) {
            if (typeof this.preloadedMap.getBounds() === undefined) {
                var listenerHandle_1 = google.maps.event.addListener(this.preloadedMap, 'bounds_changed', function () {
                    google.maps.event.removeListener(listenerHandle_1);
                    _this.fitMapWidget(position);
                });
                return;
            }
            this.fitMapWidget(position);
            return;
        }
        this.preloadedMap.setZoom(11);
        this.preloadedMap.setCenter(new google.maps.LatLng(position.latitude, position.longitude));
    };
    GMapUtil.setCenter = function (latLng, paddingLeft, paddingRight, paddingTop, paddingBottom) {
        var offsetX = (paddingRight - paddingLeft) / 2;
        var offsetY = (paddingTop - paddingBottom) / 2;
        var center = this.movePointInPixels(latLng, offsetX, offsetY, window.innerWidth, window.innerHeight, this.preloadedMap.getBounds());
        this.preloadedMap.setCenter(center);
    };
    GMapUtil.movePointInPixels = function (latlng, offsetX, offsetY, width, height, bounds) {
        var westLong = bounds.getSouthWest().lng();
        var eastLong = bounds.getNorthEast().lng();
        var northLat = bounds.getNorthEast().lat();
        var southLat = bounds.getSouthWest().lat();
        var diffLong = eastLong >= westLong ? eastLong - westLong : eastLong - westLong + 360;
        var diffLat = northLat >= southLat ? northLat - southLat : northLat - southLat + 180;
        var pixelsPerLongDegree = width / diffLong;
        var pixelsPerLatDegree = height / diffLat;
        var newCenterLong = latlng.lng() + (offsetX / pixelsPerLongDegree);
        var newCenterLat = latlng.lat() + (offsetY / pixelsPerLatDegree);
        return new google.maps.LatLng(newCenterLat, newCenterLong);
    };
    GMapUtil.getPreloadedMap = function () {
        return GMapUtil.preloadedMap;
    };
    GMapUtil.isAlreadyFitWidget = function () {
        return GMapUtil.alreadyFitWidget;
    };
    GMapUtil.getInitialUserPosition = function () {
        return GMapUtil.initialUserPosition;
    };
    GMapUtil.isGoogleMapsLoaded = function () {
        return (typeof google === 'object' && typeof google.maps === 'object');
    };
    GMapUtil.alreadyFitWidget = false;
    GMapUtil.initialUserPosition = null;
    GMapUtil.pathname = window.location.pathname;
    GMapUtil.hostname = window.location.hostname;
    GMapUtil.isWidget = GMapUtil.pathname.includes("/widget") || GMapUtil.hostname.includes("widget");
    GMapUtil.isFullWidget = GMapUtil.pathname.includes("/widget/full") || GMapUtil.hostname.includes("full.widget");
    GMapUtil.isComWidget = GMapUtil.pathname.includes("/widget/com") || GMapUtil.hostname.includes("com.widget");
    GMapUtil.isCityStats = GMapUtil.pathname.includes("/citystats");
    GMapUtil.isShowWorld = GMapUtil.pathname.includes("/world") || GMapUtil.isCityStats;
    return GMapUtil;
}());
Util.global.getPreloadedMap = GMapUtil.getPreloadedMap;
Util.global.isAlreadyFitWidget = GMapUtil.isAlreadyFitWidget;
Util.global.getInitialUserPosition = GMapUtil.getInitialUserPosition;
Util.global.addOsmMapType = GMapUtil.addOsmMapType;
Util.global.isGoogleMapsLoaded = GMapUtil.isGoogleMapsLoaded;
export default GMapUtil;
//# sourceMappingURL=GMapUtil.js.map