var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import * as React from "react";
import "./LeafletMap.css";
import { Map as RLMap, Marker, Popup, ZoomControl } from "react-leaflet";
import NetworkUtil from "../util/NetworkUtil";
import LatLng from "../model/LatLng";
import Constants from "../util/Constants";
import L from "leaflet";
import LeafletUtil from "../util/LeafletUtil";
import MapTripSegment from "./MapTripSegment";
import Util from "../util/Util";
import { MapLocationType, mapLocationTypeToGALabel, values as locTypeValues } from "../model/location/MapLocationType";
import LocationsData from "../data/LocationsData";
import OptionsData from "../data/OptionsData";
import LocationUtil from "../util/LocationUtil";
import GATracker from "../analytics/GATracker";
import MapLocationPopup from "./MapLocationPopup";
import { Visibility } from "../model/trip/SegmentTemplate";
import { default as SegmentPinIcon } from "./SegmentPinIcon";
import { default as SegmentPopup } from "./SegmentPopup";
import { default as ServiceStopPopup } from "./ServiceStopPopup";
import IconServiceStop from "-!svg-react-loader!../images/ic-service-stop.svg";
import RegionsData from "../data/RegionsData";
// class ReactMap<P extends MapProps & IProps> extends React.Component<P, {}> {
var LeafletMap = /** @class */ (function (_super) {
    __extends(LeafletMap, _super);
    function LeafletMap(props) {
        var _this = _super.call(this, props) || this;
        // private readonly ZOOM_ALL_LOCATIONS = 15;
        _this.ZOOM_ALL_LOCATIONS = 0; // Zoom all locations at any zoom.
        _this.ZOOM_PARENT_LOCATIONS = 11;
        _this.wasDoubleClick = false;
        _this.state = {
            mapLayers: new Map()
        };
        LocationsData.instance.addChangeListener(function (locResult) { return _this.onLocationsChanged(locResult); });
        OptionsData.instance.addChangeListener(function (update, prev) {
            if (update.mapLayers !== prev.mapLayers) {
                _this.refreshMapLocations();
            }
        });
        _this.onMoveEnd = _this.onMoveEnd.bind(_this);
        _this.onLocationsChanged = _this.onLocationsChanged.bind(_this);
        return _this;
    }
    LeafletMap.prototype.onMoveEnd = function () {
        var mapBounds = this.leafletElement.getBounds();
        if (mapBounds.getNorth() === 90) { // Filter first bounds, which are like max possible bounds
            return;
        }
        this.refreshMapLocations();
    };
    LeafletMap.prototype.onLocationsChanged = function (locResult) {
        if (this.leafletElement.getZoom() < this.ZOOM_PARENT_LOCATIONS || (this.leafletElement.getZoom() < this.ZOOM_ALL_LOCATIONS && locResult.level === 2)) {
            return;
        }
        var enabledMapLayers = OptionsData.instance.get().mapLayers;
        var updatedMapLayers = new Map(this.state.mapLayers);
        for (var _i = 0, enabledMapLayers_1 = enabledMapLayers; _i < enabledMapLayers_1.length; _i++) {
            var locType = enabledMapLayers_1[_i];
            // for (const locType of values()) {
            if (locResult.getByType(locType) && enabledMapLayers.indexOf(locType) !== -1) {
                var uLayerLocs = updatedMapLayers.get(locType);
                uLayerLocs = uLayerLocs ? uLayerLocs.slice() : [];
                uLayerLocs = Util.addAllNoRep(uLayerLocs, locResult.getByType(locType), LocationUtil.equal);
                updatedMapLayers.set(locType, uLayerLocs);
            }
        }
        this.setState({ mapLayers: updatedMapLayers });
    };
    LeafletMap.prototype.refreshMapLocations = function () {
        var _this = this;
        var enabledMapLayers = OptionsData.instance.get().mapLayers;
        var showAny = this.props.showLocations && this.leafletElement.getZoom() >= this.ZOOM_ALL_LOCATIONS
            && enabledMapLayers.length > 0;
        if (showAny) { // TODO: replace by requesting just modes that correspond to selected location types.
            RegionsData.instance.getCloserRegionP(this.props.viewport.center).then(function (region) {
                LocationsData.instance.requestLocations(region.name, 1);
                if (_this.leafletElement.getZoom() >= _this.ZOOM_ALL_LOCATIONS
                    && _this.leafletElement.getZoom() >= _this.ZOOM_PARENT_LOCATIONS) { // To avoid crashing if ZOOM_ALL_LOCATIONS < ZOOM_PARENT_LOCATIONS
                    LocationsData.instance.requestLocations(region.name, 2, LeafletUtil.toBBox(_this.leafletElement.getBounds()));
                }
            });
        }
    };
    LeafletMap.prototype.isShowLocType = function (type) {
        return !!this.props.showLocations && this.leafletElement && this.leafletElement.getZoom() >= this.ZOOM_ALL_LOCATIONS &&
            OptionsData.instance.get().mapLayers.indexOf(type) !== -1 && !!this.state.mapLayers.get(type);
    };
    LeafletMap.prototype.getLocMarker = function (mapLocType, loc) {
        var popup = React.createElement(Popup, { offset: [0, 0], closeButton: false, className: "LeafletMap-mapLocPopup" },
            React.createElement(MapLocationPopup, { value: loc }));
        switch (mapLocType) {
            case MapLocationType.BIKE_POD:
                return React.createElement(Marker, { position: loc, icon: L.icon({
                        iconUrl: Constants.absUrl("/images/modeicons/ic-bikeShare.svg"),
                        iconSize: [20, 20],
                        iconAnchor: [10, 10]
                    }), onpopupopen: function () { return GATracker.instance.send('map location', 'click', mapLocationTypeToGALabel(mapLocType)); } }, popup);
            case MapLocationType.MY_WAY_FACILITY:
                return React.createElement(Marker, { position: loc, icon: L.icon({
                        iconUrl: Constants.absUrl("/images/modeicons/ic-myway.svg"),
                        iconSize: [20, 20],
                        iconAnchor: [10, 10]
                    }), onpopupopen: function () { return GATracker.instance.send('map location', 'click', mapLocationTypeToGALabel(mapLocType)); } }, popup);
            case MapLocationType.PARK_AND_RIDE_FACILITY:
                return React.createElement(Marker, { position: loc, icon: L.icon({
                        iconUrl: Constants.absUrl("/images/modeicons/ic-parkAndRide.svg"),
                        iconSize: [20, 20],
                        iconAnchor: [10, 10]
                    }), onpopupopen: function () { return GATracker.instance.send('map location', 'click', mapLocationTypeToGALabel(mapLocType)); } }, popup);
            default:
                return React.createElement(Marker, { position: loc });
        }
    };
    LeafletMap.prototype.render = function () {
        var _this = this;
        var lbounds = this.props.bounds ? L.latLngBounds([this.props.bounds.sw, this.props.bounds.ne]) : undefined;
        var renderPinIcon = this.props.renderSegmentPinIcon ? this.props.renderSegmentPinIcon :
            function (props) { return React.createElement(SegmentPinIcon, __assign({}, props)); };
        var renderPopup = this.props.renderSegmentPopup ? this.props.renderSegmentPopup :
            function (props) { return React.createElement(SegmentPopup, __assign({}, props)); };
        var segmentPolylineOptions = this.props.segmentPolylineOptions ? this.props.segmentPolylineOptions :
            function (segment) {
                if (segment.shapes) {
                    return segment.shapes.map(function (shape) {
                        return {
                            positions: shape.waypoints,
                            weight: 9,
                            color: shape.travelled ? "black" : "lightgray",
                            opacity: shape.travelled ? 1 : .5,
                        };
                    }).concat(segment.shapes.map(function (shape) {
                        return {
                            positions: shape.waypoints,
                            weight: 7,
                            color: shape.travelled ? segment.getColor() : "grey",
                            opacity: shape.travelled ? 1 : .5,
                        };
                    }));
                }
                else if (segment.streets) {
                    return segment.streets.map(function (street) {
                        return {
                            positions: street.waypoints,
                            weight: 9,
                            color: "black",
                            // opacity: !this.segment.isBicycle() || street.safe ? 1 : .3
                            opacity: 1 // Disable safe distinction for now
                        };
                    }).concat(segment.streets.map(function (street) {
                        return {
                            positions: street.waypoints,
                            weight: 7,
                            color: segment.isWalking() ? "#20ce6e" : segment.getColor(),
                            // opacity: !this.segment.isBicycle() || street.safe ? 1 : .3
                            opacity: 1 // Disable safe distinction for now
                        };
                    }));
                }
                else {
                    return [];
                }
            };
        var renderServiceStop = this.props.renderServiceStop ? this.props.renderServiceStop :
            function (props) {
                return React.createElement(IconServiceStop, { style: {
                        color: props.shape.travelled ? props.segment.getColor() : "grey",
                        opacity: props.shape.travelled ? 1 : .5
                    } });
            };
        var renderServiceStopPopup = this.props.renderServiceStopPopup ? this.props.renderServiceStopPopup :
            function (props) { return React.createElement(ServiceStopPopup, __assign({}, props)); };
        var tripSegments;
        if (this.props.trip) {
            tripSegments = this.props.trip.segments.concat([this.props.trip.arrivalSegment]);
        }
        return (React.createElement(RLMap, { className: "map-canvas avoidVerticalScroll gl-flex gl-grow", viewport: this.props.viewport, bounds: lbounds, boundsOptions: { padding: [20, 20] }, maxBounds: L.latLngBounds([-90, -180], [90, 180]), onViewportChanged: function (viewport) {
                if (_this.props.onViewportChanged) {
                    _this.props.onViewportChanged({
                        center: viewport.center ? LatLng.createLatLng(viewport.center[0], viewport.center[1]) : undefined,
                        zoom: viewport.zoom
                    });
                }
            }, onclick: function (event) {
                if (_this.props.onclick) {
                    setTimeout(function () {
                        if (_this.wasDoubleClick) {
                            _this.wasDoubleClick = false;
                            return;
                        }
                        if (_this.props.onclick) {
                            _this.props.onclick(LatLng.createLatLng(event.latlng.lat, event.latlng.lng));
                        }
                    });
                }
            }, onmoveend: this.onMoveEnd, ref: function (ref) {
                if (ref) {
                    _this.leafletElement = ref.leafletElement;
                }
            }, zoomControl: false, attributionControl: this.props.attributionControl !== false },
            React.createElement(ZoomControl, { position: "topright" }),
            this.props.from && this.props.from.isResolved() &&
                React.createElement(Marker, { position: this.props.from, icon: L.icon({
                        iconUrl: Constants.absUrl("/images/map/ic-map-pin-from.svg"),
                        iconSize: [35, 35],
                        iconAnchor: [17, 35],
                        className: "LeafletMap-pinFrom"
                    }), draggable: true, riseOnHover: true, ondragend: function (event) {
                        if (_this.props.ondragend) {
                            var latLng = event.target.getLatLng();
                            _this.props.ondragend(true, LatLng.createLatLng(latLng.lat, latLng.lng));
                        }
                    } }),
            this.props.to && this.props.to.isResolved() &&
                React.createElement(Marker, { position: this.props.to, icon: L.icon({
                        iconUrl: Constants.absUrl("/images/map/ic-map-pin.svg"),
                        iconSize: [35, 35],
                        iconAnchor: [17, 35],
                        className: "LeafletMap-pinTo"
                    }), draggable: true, riseOnHover: true, ondragend: function (event) {
                        if (_this.props.ondragend) {
                            var latLng = event.target.getLatLng();
                            _this.props.ondragend(false, LatLng.createLatLng(latLng.lat, latLng.lng));
                        }
                    } }),
            locTypeValues().map(function (locType) {
                return _this.isShowLocType(locType) &&
                    _this.state.mapLayers.get(locType).map(function (loc) {
                        return _this.getLocMarker(locType, loc);
                    });
            }),
            tripSegments && tripSegments.map(function (segment, i) {
                return React.createElement(MapTripSegment, { segment: segment, ondragend: (segment.isFirst(Visibility.IN_SUMMARY) || segment.arrival) && _this.props.ondragend ?
                        function (latLng) { return _this.props.ondragend(segment.isFirst(Visibility.IN_SUMMARY), latLng); } : undefined, renderPinIcon: renderPinIcon, renderPopup: renderPopup, polylineOptions: segmentPolylineOptions, renderServiceStop: renderServiceStop, renderServiceStopPopup: renderServiceStopPopup, key: i });
            }),
            this.props.children));
    };
    LeafletMap.prototype.componentWillMount = function () {
        NetworkUtil.loadCss("https://unpkg.com/leaflet@1.3.4/dist/leaflet.css");
    };
    LeafletMap.prototype.componentDidMount = function () {
        var _this = this;
        this.refreshMapLocations();
        this.leafletElement.on("dblclick", function (event1) {
            _this.wasDoubleClick = true;
        });
    };
    LeafletMap.prototype.fitBounds = function (bounds) {
        if (this.leafletElement) {
            var options = { padding: [20, 20] };
            this.leafletElement.fitBounds(L.latLngBounds([bounds.sw, bounds.ne]), options);
        }
    };
    LeafletMap.prototype.alreadyFits = function (bounds) {
        return this.leafletElement ? this.leafletElement.getBounds().contains(LeafletUtil.fromBBox(bounds)) : false;
    };
    LeafletMap.prototype.onResize = function () {
        this.leafletElement.invalidateSize();
    };
    return LeafletMap;
}(React.Component));
export default LeafletMap;
//# sourceMappingURL=LeafletMap.js.map