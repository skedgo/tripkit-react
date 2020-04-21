import Util from "./Util";
import LatLng = google.maps.LatLng;
import MapOptions = google.maps.MapOptions;
import Map = google.maps.Map;
import Size = google.maps.Size;
import ImageMapType = google.maps.ImageMapType;
import MapTypeId = google.maps.MapTypeId;
import NetworkUtil from "./NetworkUtil";

class GMapUtil {

    public static preloadedMap: any;
    public static alreadyFitWidget: any = false;
    public static initialUserPosition: any = null;

    public static pathname = window.location.pathname;
    public static hostname = window.location.hostname;
    public static isWidget = GMapUtil.pathname.includes("/widget") || GMapUtil.hostname.includes("widget");
    public static isFullWidget = GMapUtil.pathname.includes("/widget/full") || GMapUtil.hostname.includes("full.widget");
    public static isComWidget = GMapUtil.pathname.includes("/widget/com") || GMapUtil.hostname.includes("com.widget");
    public static isCityStats = GMapUtil.pathname.includes("/citystats");
    public static isShowWorld = GMapUtil.pathname.includes("/world") || GMapUtil.isCityStats;


    public static initMap() {
        // Extract latLng and zoom from url with form /@/LAT,LONG,ZOOMz
        let urlLatLng: LatLng | null = null;
        let urlMapZoom: Number | null = null;
        const pathname = window.location.pathname;
        if (pathname.includes("/@/")) {
            let mapPositionString = pathname.substring(pathname.indexOf("/@/") + "/@/".length, pathname.length);
            if (mapPositionString.includes("z")) {
                mapPositionString = mapPositionString.substring(0, mapPositionString.indexOf("z"));
                const data = mapPositionString.split(",");
                urlLatLng = new LatLng(Number(data[0]), Number(data[1]));
                urlMapZoom = Number(data[2]);
            }
        }

        const mapContainer = document.getElementById('map-canvas');
        if (!mapContainer) {
            return
        }

        const panoramaOptions = {
            addressControlOptions : { position : google.maps.ControlPosition.BOTTOM_LEFT },
            zoomControlOptions : { position : google.maps.ControlPosition.RIGHT_TOP},
            enableCloseButton : true,
            visible: false // set to false so streetview is not triggered on the initial map load
        };
        const panorama = new google.maps.StreetViewPanorama(mapContainer, panoramaOptions);
        const mapZoom = GMapUtil.isShowWorld || urlMapZoom === null ? 2 : urlMapZoom;  // Fit world if urlLatLng is unknown and try to geolocate.
        const mapCenter = GMapUtil.isShowWorld || urlMapZoom === null ? new LatLng(10, 0) : urlLatLng;
        const mapTypePosition = GMapUtil.isWidget && !GMapUtil.isComWidget ? google.maps.ControlPosition.RIGHT_BOTTOM : google.maps.ControlPosition.RIGHT_TOP;
        const mapOptions = {
            zoom: mapZoom,
            minZoom: 2,
            center: mapCenter,
            panControl: false,
            mapTypeControl: false, //  if (userAgent.getDeviceType() != UserAgent.DeviceType.MOBILE) { "" true "" } else { "" false "" } "",
            mapTypeControlOptions: {
                position: mapTypePosition
            },
            zoomControl: false, // "" if (userAgent.getDeviceType() != UserAgent.DeviceType.MOBILE) { "" true "" } else { "" false "" } "",
            zoomControlOptions: {
                style: google.maps.ZoomControlStyle.SMALL,
                position: google.maps.ControlPosition.RIGHT_CENTER
            },
            streetViewControl: false, // "" if (userAgent.getDeviceType() != UserAgent.DeviceType.MOBILE && !isWidget) { "" true "" } else { "" false "" } "",
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
            streetView : panorama
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
        this.preloadedMap = new Map(mapContainer, mapOptions as MapOptions);

        mapContainer.style.height = window.innerHeight +'px';

        google.maps.event.addListener(this.preloadedMap, 'center_changed', () => {
            this.restrictToWorld(this.preloadedMap);
        });
        google.maps.event.addListener(this.preloadedMap, 'zoom_changed', () => {
            this.restrictToWorld(this.preloadedMap);
        });

        if (urlLatLng == null && !GMapUtil.isShowWorld) {
            // Fallback to HTML5 geolocation (potentially asking user permission) just if not on widget.
            this.getCurrentLocation(true, !GMapUtil.isWidget, (coords: any) => {
                this.initialUserPosition = coords;
                this.fitMap(coords);
            });
        }
    }

// If the map position is out of range, move it back
    private static restrictToWorld(map: any) {
        if (map.getBounds() == null) {
            return;
        }
        const latNorth = map.getBounds().getNorthEast().lat();
        const latSouth = map.getBounds().getSouthWest().lat();
        let newLat;

        const tolerance = 2;  // Set tolerance to avoid too much recursion due to correcting less than needed. That may
        // happen since due to map projection, the difference calculated at higher latitudes is not
        // enough to properly correct center which is at lower latitudes.
        if(latNorth<85 && latSouth>-85) {     /* in both side -> it's ok */
            return;
        } else if(latNorth>85 && latSouth<-85) {   /* out both side -> it's ok */
            return;
        } else if(latNorth>85) {
            newLat = map.getCenter().lat() - (latNorth - 85) - tolerance;
            /* too north, centering */
        } else if(latSouth<-85) {
            newLat = map.getCenter().lat() - (latSouth + 85) + tolerance;
            /* too south, centering */
        }

        if(newLat) {
            const newCenter= new LatLng(newLat, map.getCenter().lng());
            map.setCenter(newCenter);
        }
    }

    public static addOsmMapType(map: any) {
        const osmName = "OSM";
        const url = "	http://otile1.mqcdn.com/tiles/1.0.0/map/";
        const mapTypeIds: any[] = [];
        // OSM Type
        const osmTypeOptions = {
            getTileUrl: (coord: any, zoom: number) => {
                return url + zoom + "/" + coord.x + "/" + coord.y + ".jpg";
            },
            tileSize: new Size(256, 256),
            name: osmName,
            maxZoom: 18
        };
        const osmMapType = new ImageMapType(osmTypeOptions);
        map.mapTypes.set(osmName, osmMapType);
        for (const type in MapTypeId) {
            if (MapTypeId.hasOwnProperty(type)) {
                mapTypeIds.push(MapTypeId[type]);
            }
        }
        mapTypeIds.push(osmName);
        map.setOptions({mapTypeControlOptions: {mapTypeIds: mapTypeIds, position: google.maps.ControlPosition.RIGHT_TOP}});
    }

    private static getCurrentLocation(gmaps: any, fallback: any, callback: any) {
        if (gmaps) {
            fetch("https://www.googleapis.com/geolocation/v1/geolocate?key=" + "AIzaSyBNHDLhhQ3XCeu-mD8CsVqH1woeMncu7Ao",
                {
                    method: 'post'
                })
                .then(NetworkUtil.jsonCallback)
                .then((jsonData) => {
                    callback({latitude: jsonData.location.lat, longitude: jsonData.location.lng});
                })
                .catch(reason => {
                    if (fallback) {
                        this.getCurrentLocation(false, false, callback);
                    }
                });
        } else {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (result) => {
                        callback(result.coords);
                    },
                    (error) => {
                        if (fallback) {
                            this.getCurrentLocation(true, false, callback);
                        }
                    });
            }
        }
    }

    private static fitMapWidget(position: any) {
        this.preloadedMap.setZoom(12);
        this.setCenter(new google.maps.LatLng(position.latitude, position.longitude), 400, 0, 0, 0);
        this.alreadyFitWidget = true;
    }

    private static fitMap(position:any) {
        if (window.location.pathname.includes("widget/com")) {
            if (typeof this.preloadedMap.getBounds() === undefined) {
                const listenerHandle = google.maps.event.addListener(this.preloadedMap, 'bounds_changed', () => {
                    google.maps.event.removeListener(listenerHandle);
                    this.fitMapWidget(position);
                });
                return;
            }
            this.fitMapWidget(position);
            return;
        }
        this.preloadedMap.setZoom(11);
        this.preloadedMap.setCenter(new google.maps.LatLng(position.latitude, position.longitude));
    }


    private static setCenter(latLng: any, paddingLeft: any, paddingRight: any, paddingTop: any, paddingBottom: any) {
        const offsetX = (paddingRight - paddingLeft)/2;
        const offsetY = (paddingTop - paddingBottom)/2;
        const center = this.movePointInPixels(latLng, offsetX, offsetY, window.innerWidth, window.innerHeight, this.preloadedMap.getBounds());
        this.preloadedMap.setCenter(center);
    }

    private static movePointInPixels(latlng: any, offsetX: number, offsetY: number, width: number, height: number, bounds: any) {
        const westLong = bounds.getSouthWest().lng();
        const eastLong = bounds.getNorthEast().lng();
        const northLat = bounds.getNorthEast().lat();
        const southLat = bounds.getSouthWest().lat();
        const diffLong = eastLong >= westLong ? eastLong - westLong : eastLong - westLong + 360;
        const diffLat = northLat >= southLat ? northLat - southLat : northLat - southLat + 180;
        const pixelsPerLongDegree = width / diffLong;
        const pixelsPerLatDegree = height / diffLat;
        const newCenterLong = latlng.lng() + (offsetX / pixelsPerLongDegree);
        const newCenterLat = latlng.lat() + (offsetY / pixelsPerLatDegree);
        return new google.maps.LatLng(newCenterLat, newCenterLong);
    }

    public static getPreloadedMap() {
        return GMapUtil.preloadedMap;
    }

    public static isAlreadyFitWidget() {
        return GMapUtil.alreadyFitWidget;
    }

    public static getInitialUserPosition() {
        return GMapUtil.initialUserPosition;
    }

    public static isGoogleMapsLoaded() {
        return (typeof google === 'object' && typeof google.maps === 'object');
    }
}

Util.global.getPreloadedMap = GMapUtil.getPreloadedMap;
Util.global.isAlreadyFitWidget = GMapUtil.isAlreadyFitWidget;
Util.global.getInitialUserPosition = GMapUtil.getInitialUserPosition;
Util.global.addOsmMapType = GMapUtil.addOsmMapType;
Util.global.isGoogleMapsLoaded = GMapUtil.isGoogleMapsLoaded;

export default GMapUtil;