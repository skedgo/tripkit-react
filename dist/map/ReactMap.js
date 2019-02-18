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
import * as React from "react";
import "./ReactMap.css";
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
// class ReactMap<P extends MapProps & IProps> extends React.Component<P, {}> {
var ReactMap = /** @class */ (function (_super) {
    __extends(ReactMap, _super);
    function ReactMap(props) {
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
    ReactMap.prototype.onMoveEnd = function () {
        var mapBounds = this.leafletElement.getBounds();
        if (mapBounds.getNorth() === 90) { // Filter first bounds, which are like max possible bounds
            return;
        }
        this.refreshMapLocations();
    };
    ReactMap.prototype.onLocationsChanged = function (locResult) {
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
    ReactMap.prototype.refreshMapLocations = function () {
        var enabledMapLayers = OptionsData.instance.get().mapLayers;
        var showAny = this.props.showLocations && this.leafletElement.getZoom() >= this.ZOOM_ALL_LOCATIONS
            && enabledMapLayers.length > 0;
        if (showAny) { // TODO: replace by requesting just modes that correspond to selected location types.
            LocationsData.instance.requestLocations("AU_ACT_Canberra", 1);
            if (this.leafletElement.getZoom() >= this.ZOOM_ALL_LOCATIONS) {
                LocationsData.instance.requestLocations("AU_ACT_Canberra", 2, LeafletUtil.toBBox(this.leafletElement.getBounds()));
            }
        }
    };
    ReactMap.prototype.isShowLocType = function (type) {
        return !!this.props.showLocations && this.leafletElement && this.leafletElement.getZoom() >= this.ZOOM_ALL_LOCATIONS &&
            OptionsData.instance.get().mapLayers.indexOf(type) !== -1 && !!this.state.mapLayers.get(type);
    };
    ReactMap.prototype.getLocMarker = function (mapLocType, loc) {
        var popup = React.createElement(Popup, { offset: [0, 0], closeButton: false, className: "ReactMap-mapLocPopup" },
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
    ReactMap.prototype.render = function () {
        var _this = this;
        var lbounds = this.props.bounds ? L.latLngBounds([this.props.bounds.sw, this.props.bounds.ne]) : undefined;
        var tripSegments;
        if (this.props.trip) {
            var last = this.props.trip.segments[this.props.trip.segments.length - 1];
            var arrival = Util.iAssign(last, {});
            arrival.arrival = true;
            arrival.from = last.to;
            arrival.action = "Arrive";
            tripSegments = this.props.trip.segments.concat([arrival]);
        }
        return (React.createElement(RLMap, { className: "map-canvas avoidVerticalScroll gl-flex gl-grow", viewport: this.props.viewport, bounds: lbounds, boundsOptions: { padding: [20, 20] }, onViewportChanged: this.props.onViewportChanged, onclick: function (event) {
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
                    } },
                    React.createElement(Popup, null,
                        "A pretty CSS3 popup. ",
                        React.createElement("br", null),
                        " Easily customizable.")),
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
                    } },
                    React.createElement(Popup, null,
                        "A pretty CSS3 popup. ",
                        React.createElement("br", null),
                        " Easily customizable.")),
            locTypeValues().map(function (locType) {
                return _this.isShowLocType(locType) &&
                    _this.state.mapLayers.get(locType).map(function (loc) {
                        return _this.getLocMarker(locType, loc);
                    });
            }),
            tripSegments && tripSegments.map(function (segment, i) {
                return React.createElement(MapTripSegment, { segment: segment, ondragend: (segment.isFirst(Visibility.IN_SUMMARY) || segment.arrival) && _this.props.ondragend ?
                        function (latLng) { return _this.props.ondragend(segment.isFirst(Visibility.IN_SUMMARY), latLng); } : undefined, key: i });
            }),
            this.props.children));
    };
    ReactMap.prototype.componentWillMount = function () {
        NetworkUtil.loadCss("https://unpkg.com/leaflet@1.3.4/dist/leaflet.css");
    };
    ReactMap.prototype.componentDidMount = function () {
        var _this = this;
        this.refreshMapLocations();
        this.leafletElement.on("dblclick", function (event1) {
            _this.wasDoubleClick = true;
        });
    };
    ReactMap.prototype.fitBounds = function (bounds) {
        if (this.leafletElement) {
            var options = { padding: [20, 20] };
            this.leafletElement.fitBounds(L.latLngBounds([bounds.sw, bounds.ne]), options);
        }
    };
    ReactMap.prototype.alreadyFits = function (bounds) {
        return this.leafletElement ? this.leafletElement.getBounds().contains(LeafletUtil.fromBBox(bounds)) : false;
    };
    ReactMap.prototype.onResize = function () {
        this.leafletElement.invalidateSize();
    };
    return ReactMap;
}(React.Component));
export default ReactMap;
//# sourceMappingURL=ReactMap.js.map