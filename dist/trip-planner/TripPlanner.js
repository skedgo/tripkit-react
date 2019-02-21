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
import './TripPlanner.css';
import '../css/app.css';
import RegionsData from "../data/RegionsData";
import LatLng from "../model/LatLng";
// import Location from "../model/Location";
import QueryInput from "../query/QueryInput";
import RoutingQuery from "../model/RoutingQuery";
import FavouriteList from "../favourite/FavouriteList";
import FavouriteTrip from "../model/FavouriteTrip";
import BBox from "../model/BBox";
import TripsView from "../trip/TripsView";
import FavouriteBtn from "../favourite/FavouriteBtn";
import Modal from 'react-modal';
import OptionsView from "../options/OptionsView";
import OptionsData from "../data/OptionsData";
import Util from "../util/Util";
import FavouritesData from "../data/FavouritesData";
import IconMap from "-!svg-react-loader!../images/ic-map-marked.svg";
import IconTrips from "-!svg-react-loader!../images/ic-bars-solid.svg";
import IconFav from "-!svg-react-loader!../images/ic-star-solid.svg";
import { EventEmitter } from "fbemitter";
import WaiAriaUtil from "../util/WaiAriaUtil";
import TripRow from "../trip/TripRow";
import { TRIP_ALT_PICKED_EVENT } from "../trip/ITripRowProps";
import ReactResizeDetector from "react-resize-detector";
import MapUtil from "../util/MapUtil";
import GATracker from "../analytics/GATracker";
import PlannedTripsTracker from "../analytics/PlannedTripsTracker";
import { JsonConvert } from "json2typescript";
import iconFeedback from "../images/ic-feedback.svg";
import copy from 'copy-to-clipboard';
import Tooltip from "rc-tooltip";
import Constants from "../util/Constants";
import TripDetail from "../trip/TripDetail";
import LeafletMap from "../map/LeafletMap";
import Location from "../model/Location";
import MultiGeocoder from "../geocode/MultiGeocoder";
import LocationUtil from "../util/LocationUtil";
import { TileLayer } from "react-leaflet";
import GeolocationData from "../geocode/GeolocationData";
var TripPlanner = /** @class */ (function (_super) {
    __extends(TripPlanner, _super);
    function TripPlanner(props) {
        var _this = _super.call(this, props) || this;
        _this.eventBus = new EventEmitter();
        var userIpLocation = Util.global.userIpLocation;
        _this.state = {
            tripsSorted: _this.props.trips ? TripsView.sortTrips(_this.props.trips) : _this.props.trips,
            selected: undefined,
            mapView: false,
            showOptions: false,
            queryTimePanelOpen: false,
            feedbackTooltip: false,
            viewport: { center: userIpLocation ? LatLng.createLatLng(userIpLocation[0], userIpLocation[1]) : LatLng.createLatLng(-33.8674899, 151.2048442), zoom: 13 }
        };
        if (!userIpLocation) {
            GeolocationData.instance.requestCurrentLocation(true).then(function (userLocation) {
                RegionsData.instance.getCloserRegionP(userLocation).then(function (region) {
                    _this.setState({ viewport: { center: region.cities.length !== 0 ? region.cities[0] : region.bounds.getCenter() } });
                });
            });
        }
        // Trigger regions request asap
        RegionsData.instance.requireRegions();
        _this.eventBus.addListener("onChangeView", function (view) {
            if (view === "mapView") {
                _this.setState({ mapView: true });
            }
        });
        _this.eventBus.addListener(TRIP_ALT_PICKED_EVENT, function (orig, update) {
            _this.props.onAlternativeChange(orig, update.getSelectedTrip());
        });
        WaiAriaUtil.addTabbingDetection();
        _this.geocodingData = new MultiGeocoder();
        _this.onQueryChange = _this.onQueryChange.bind(_this);
        _this.onFavClicked = _this.onFavClicked.bind(_this);
        _this.onOptionsChange = _this.onOptionsChange.bind(_this);
        _this.onShowOptions = _this.onShowOptions.bind(_this);
        _this.onModalRequestedClose = _this.onModalRequestedClose.bind(_this);
        _this.onMapLocChanged = _this.onMapLocChanged.bind(_this);
        _this.onSelected = _this.onSelected.bind(_this);
        return _this;
    }
    TripPlanner.prototype.onQueryChange = function (query) {
        var prevQuery = this.props.query;
        this.props.onQueryChange(query);
        if (query.isComplete(true) &&
            (JSON.stringify(query.from) !== JSON.stringify(prevQuery.from)
                || JSON.stringify(query.to) !== JSON.stringify(prevQuery.to))) {
            FavouritesData.recInstance.add(FavouriteTrip.create(query.from, query.to));
        }
    };
    TripPlanner.prototype.onFavClicked = function (favourite) {
        var query = RoutingQuery.create(favourite.from, favourite.to);
        if (favourite.options) {
            var favOptions = Util.iAssign(query.options, FavouritesData.getFavOptionsPart(favourite.options));
            OptionsData.instance.save(favOptions);
            query.options = favOptions;
        }
        this.onQueryChange(query);
        if (this.mapRef && favourite.from.isResolved() && favourite.to.isResolved()) {
            this.mapRef.fitBounds(BBox.createBBoxArray([favourite.from, favourite.to]));
        }
    };
    TripPlanner.prototype.onOptionsChange = function (update) {
        OptionsData.instance.save(update);
        this.onQueryChange(Util.iAssign(this.props.query, { options: update }));
    };
    TripPlanner.prototype.onShowOptions = function () {
        var _this = this;
        GATracker.instance.send('query input', 'click', 'options button');
        RegionsData.instance.requireRegions().then(function () { return _this.setState({ showOptions: true }); });
    };
    TripPlanner.prototype.onMapLocChanged = function (from, latLng) {
        var _this = this;
        var _a;
        this.onQueryChange(Util.iAssign(this.props.query, (_a = {},
            _a[from ? "from" : "to"] = Location.create(latLng, "Location", "", ""),
            _a)));
        this.geocodingData.reverseGeocode(latLng, function (loc) {
            var _a;
            if (loc !== null) {
                _this.onQueryChange(Util.iAssign(_this.props.query, (_a = {}, _a[from ? "from" : "to"] = loc, _a)));
            }
        });
    };
    TripPlanner.prototype.checkFitLocation = function (oldLoc, loc) {
        return !!(oldLoc !== loc && loc && loc.isResolved());
    };
    TripPlanner.prototype.fitMap = function (query, preFrom, preTo) {
        var fromLoc = preFrom ? preFrom : query.from;
        var toLoc = preTo ? preTo : query.to;
        var fitSet = [];
        if (fromLoc && fromLoc.isResolved()) {
            fitSet.push(fromLoc);
        }
        if (toLoc && toLoc.isResolved() && !fitSet.find(function (loc) { return LocationUtil.equal(loc, toLoc); })) {
            fitSet.push(toLoc);
        }
        if (fitSet.length === 0) {
            return;
        }
        if (fitSet.length === 1) {
            this.setState({ viewport: { center: fitSet[0] } });
            return;
        }
        // this.setState({mapBounds: BBox.createBBoxArray(fitSet)})
        if (this.mapRef) {
            this.mapRef.fitBounds(BBox.createBBoxArray(fitSet));
        }
    };
    TripPlanner.prototype.onSelected = function (selected) {
        this.setState({ selected: selected });
        this.props.onReqRealtimeFor(selected);
    };
    TripPlanner.prototype.render = function () {
        var _this = this;
        var favourite = (this.props.query.from !== null && this.props.query.to !== null) ?
            FavouriteTrip.create(this.props.query.from, this.props.query.to) :
            null;
        var optionsDialog = this.state.showOptions ?
            React.createElement(Modal, { isOpen: this.state.showOptions, appElement: this.ref, onRequestClose: this.onModalRequestedClose },
                React.createElement(OptionsView, { value: this.props.query.options, region: this.state.region, onChange: this.onOptionsChange, onClose: this.onModalRequestedClose, className: "app-style" }))
            : null;
        var region = this.state.region;
        var queryInputBounds = region ? region.bounds : undefined;
        var queryInputFocusLatLng = region ? (region.cities.length !== 0 ? region.cities[0] : region.bounds.getCenter()) : undefined;
        return (React.createElement("div", { id: "mv-main-panel", className: "mainViewPanel TripPlanner" +
                (this.props.trips !== null ? " TripPlanner-tripsView" : " TripPlanner-noTripsView") +
                (this.state.mapView ? " TripPlanner-mapView" : " TripPlanner-noMapView") +
                (this.state.selected ? " TripPlanner-tripSelected" : " TripPlanner-noTripSelected") +
                (this.state.queryTimePanelOpen ? " TripPlanner-queryTimePanelOpen" : ""), ref: function (el) { return _this.ref = el; } },
            React.createElement("div", { className: "avoidVerticalScroll gl-flex gl-grow gl-column" },
                React.createElement("div", { className: "TripPlanner-queryPanel gl-flex gl-column gl-no-shrink" },
                    React.createElement(QueryInput, { value: this.props.query, bounds: queryInputBounds, focusLatLng: queryInputFocusLatLng, onChange: function (query) {
                            if (_this.checkFitLocation(_this.props.query.from, query.from)
                                || _this.checkFitLocation(_this.props.query.to, query.to)) {
                                _this.fitMap(query, _this.state.preFrom, _this.state.preTo);
                            }
                            _this.onQueryChange(query);
                        }, onPreChange: function (from, location) {
                            if (from) {
                                _this.setState({ preFrom: location });
                            }
                            else {
                                _this.setState({ preTo: location });
                            }
                        }, className: "TripPlanner-queryInput", isTripPlanner: true, bottomRightComponent: React.createElement("button", { className: "TripPlanner-optionsBtn gl-link", onClick: this.onShowOptions }, "Options"), collapsable: true, onTimePanelOpen: function (open) { return _this.setState({ queryTimePanelOpen: open }); } }),
                    React.createElement("div", { className: "TripPlanner-queryFooter gl-flex gl-column gl-no-shrink" },
                        React.createElement("div", { className: "TripPlanner-favsBtnPanel gl-flex gl-align-center gl-no-shrink" },
                            React.createElement(FavouriteBtn, { favourite: favourite })),
                        React.createElement("button", { className: "TripPlanner-mapBtn gl-link gl-flex gl-align-center", onClick: function () { return _this.setState(function (prevState) {
                                if (!prevState.mapView && _this.mapRef) {
                                    setTimeout(function () { _this.mapRef.onResize(); }, 100);
                                }
                                return { mapView: !prevState.mapView };
                            }); } },
                            this.state.mapView ?
                                (this.props.trips !== null ? React.createElement(IconTrips, { className: "TripPlanner-iconMap gl-charSpace", focusable: "false" }) : React.createElement(IconFav, { className: "TripPlanner-iconMap gl-charSpace", focusable: "false" })) :
                                React.createElement(IconMap, { className: "TripPlanner-iconMap gl-charSpace", focusable: "false" }),
                            this.state.mapView ?
                                (this.props.trips !== null ? "Show trips" : "Show favourites") :
                                "Show map"))),
                React.createElement("div", { className: "gl-flex gl-grow TripPlanner-resultsAndMapPanel" },
                    React.createElement("div", { className: "TripPlanner-subQueryPanel gl-flex gl-scrollable-y gl-column gl-space-between" }, this.state.tripsSorted === null ?
                        React.createElement("div", { className: "gl-no-shrink" },
                            React.createElement(FavouriteList, { recent: false, previewMax: 3, onValueClicked: this.onFavClicked, title: "MY FAVOURITE JOURNEYS", moreBtnClass: "gl-button" }),
                            React.createElement(FavouriteList, { recent: true, onValueClicked: this.onFavClicked, showMax: 3, title: "MY RECENT JOURNEYS", className: "TripPlanner-recentList", moreBtnClass: "gl-button" }))
                        :
                            React.createElement(TripsView, { values: this.state.tripsSorted, value: this.state.selected, onChange: this.onSelected, waiting: this.props.waiting, eventBus: this.eventBus, className: "gl-no-shrink", renderTrip: function (props) {
                                    return React.createElement("div", { key: props.key },
                                        React.createElement(TripRow, __assign({}, props)),
                                        React.createElement(TripDetail, { value: props.value }));
                                } })),
                    React.createElement("div", { className: "sg-container gl-flex gl-grow", "aria-hidden": true, tabIndex: -1 },
                        React.createElement("div", { id: "map-main", className: "TripPlanner-mapMain avoidVerticalScroll gl-flex gl-grow gl-column" },
                            React.createElement(LeafletMap, { viewport: this.state.viewport, onViewportChanged: function (viewport) {
                                    _this.setState({ viewport: viewport });
                                }, from: this.state.preFrom ? this.state.preFrom :
                                    (this.props.query.from ? this.props.query.from : undefined), to: this.state.preTo ? this.state.preTo :
                                    (this.props.query.to ? this.props.query.to : undefined), trip: this.state.selected, ondragend: this.onMapLocChanged, onclick: function (clickLatLng) {
                                    var from = _this.props.query.from;
                                    var to = _this.props.query.to;
                                    if (from === null || to === null) {
                                        _this.onMapLocChanged(from === null, clickLatLng);
                                        GATracker.instance.send("query input", "pick location", "drop pin");
                                    }
                                }, bounds: this.state.mapBounds, showLocations: true, ref: function (ref) { return _this.mapRef = ref; } },
                                React.createElement(TileLayer, { attribution: "&copy <a href=\"http://osm.org/copyright\">OpenStreetMap</a> contributors", 
                                    // url="http://{s}.tile.osm.org/{z}/{x}/{y}.png"
                                    url: "http://1.base.maps.cit.api.here.com/maptile/2.1/maptile/newest/normal.day/{z}/{x}/{y}/256/png8?app_id=aYTqZORZ7FFwqoFZ7c4j&app_code=qUK5XVczkZcFESPnGPFKPg" }))),
                        React.createElement(Tooltip, { overlay: "Feedback info copied to clipboard", placement: "left", overlayClassName: "TripPlanner-feedbackTooltip", visible: this.state.feedbackTooltip },
                            React.createElement("img", { src: Constants.absUrl(iconFeedback), className: "TripPlanner-feedbackBtn", onClick: function () {
                                    copy(_this.getFeedback());
                                    _this.setState({ feedbackTooltip: true });
                                    setTimeout(function () { return _this.setState({ feedbackTooltip: false }); }, 3000);
                                }, "aria-hidden": true, tabIndex: 0 }))))),
            optionsDialog,
            React.createElement(ReactResizeDetector, { handleWidth: true, handleHeight: true, onResize: function () { if (_this.mapRef) {
                    _this.mapRef.onResize();
                } } })));
    };
    TripPlanner.prototype.onModalRequestedClose = function () {
        this.setState({ showOptions: false });
    };
    TripPlanner.prototype.getFeedback = function () {
        var jsonConvert = new JsonConvert();
        var optionsJson = jsonConvert.serialize(this.props.query.options);
        var location = window.location;
        var plannerUrl = location.protocol + "//" + location.hostname
            + (location.port ? ":" + location.port : "") + location.pathname;
        return "webapp url: " + encodeURI(this.props.query.getGoUrl(plannerUrl)) + "\n\n"
            + "options: " + JSON.stringify(optionsJson) + "\n\n"
            + "satapp url: " + (this.state.selected ? this.state.selected.satappQuery : "") + "\n\n"
            + "trip url: " + (this.state.selected ? this.state.selected.temporaryURL : "");
    };
    TripPlanner.prototype.componentDidMount = function () {
        this.refreshRegion();
        // TEST
        // this.onQueryChange(
        // RoutingQuery.create(
        //     Location.create(LatLng.createLatLng(-35.259895882885736,149.13169181963897),"Test Loc 1", "", ""),
        //     Location.create(LatLng.createLatLng(-35.39875861087259,149.08657349646094), "Test Loc 2", "", "")
        // )
        /* Stop map link on trip segment */
        // RoutingQuery.create(
        //     Location.create(LatLng.createLatLng(-35.2784371431124,149.1294023394585), "Northbourne Av Mantra", "", ""),
        //     Location.create(LatLng.createLatLng(-35.39875861087259,149.08657349646094), "Test Loc 2", "", "")
        // )
        /* Train */
        // RoutingQuery.create(
        //     Location.create(LatLng.createLatLng(-35.415468,149.069795), "McDonald's, Greenway, ACT, Australia", "", ""),
        //     Location.create(LatLng.createLatLng(-35.349614,149.241551), "McDonald's, Queanbeyan East, NSW", "", "")
        // )
        /* School bus */
        // RoutingQuery.create(
        //     Location.create(LatLng.createLatLng(-35.3152433,149.1244004), "Test Loc 1", "", ""),
        //     Location.create(LatLng.createLatLng(-35.3452326,149.08645239999998), "Test Loc 2", "", ""),
        //     TimePreference.LEAVE, DateTimeUtil.momentTZTime(1537851627000)
        // )
        /* Trips with many segments */
        // RoutingQuery.create(
        //     Location.create(LatLng.createLatLng(-35.20969535160483,149.12230642978102), "Gungaderra Creek, Harrison, ACT, Australia", "", ""),
        //     Location.create(LatLng.createLatLng(-35.40875434495638,149.12368361838165), "Test Loc 2", "", "")
        // )
        // RoutingQuery.create(
        //     Location.create(LatLng.createLatLng(-35.20969535160483,149.12230642978102), "Gungaderra Creek, Harrison, ACT, Australia", "", ""),
        //     Location.create(LatLng.createLatLng(-35.364709739050376,149.106717556715), "23 Jelbart Street, Mawson, ACT, Australia", "", "")
        // )
        // );
        // this.onShowOptions();
    };
    TripPlanner.prototype.componentDidUpdate = function (prevProps, prevState, snapshot) {
        var _this = this;
        if (prevState.viewport !== this.state.viewport
            || prevProps.query.from !== this.props.query.from || prevProps.query.to !== this.props.query.to) {
            this.refreshRegion();
        }
        // Clear selected
        if (prevProps.trips !== this.props.trips) {
            this.setState({
                tripsSorted: this.props.trips ? TripsView.sortTrips(this.props.trips) : this.props.trips
            });
            if (!this.props.trips || this.props.trips.length === 0) {
                this.onSelected(undefined);
            }
        }
        // If first group of trips arrived
        if (!this.state.selected && prevState.tripsSorted !== null && prevState.tripsSorted.length === 0 && this.state.tripsSorted !== null && this.state.tripsSorted.length > 0) {
            setTimeout(function () {
                _this.onSelected(_this.state.tripsSorted !== null && _this.state.tripsSorted.length > 0 ?
                    _this.state.tripsSorted[0] : undefined);
            }, 2000);
        }
        if (this.state.selected !== prevState.selected) {
            if (this.state.selected && this.mapRef) {
                var fitBounds = MapUtil.getTripBounds(this.state.selected);
                if (!this.mapRef.alreadyFits(fitBounds)) {
                    this.mapRef.fitBounds(fitBounds);
                }
            }
            PlannedTripsTracker.instance.selected = this.state.selected;
            PlannedTripsTracker.instance.scheduleTrack(true);
        }
        if (this.props.trips !== prevProps.trips) {
            PlannedTripsTracker.instance.trips = this.props.trips;
        }
        if (prevProps.query.isEmpty() && this.props.query.isComplete(true)) {
            this.mapRef.fitBounds(BBox.createBBoxArray([this.props.query.from, this.props.query.to]));
        }
        if (this.checkFitLocation(prevState.preFrom, this.state.preFrom) || this.checkFitLocation(prevState.preTo, this.state.preTo)) {
            this.fitMap(this.props.query, this.state.preFrom, this.state.preTo);
        }
    };
    TripPlanner.prototype.refreshRegion = function () {
        var _this = this;
        var query = this.props.query;
        var referenceLatLng = query.from && query.from.isResolved() ? query.from :
            (query.to && query.to.isResolved() ? query.to : this.state.viewport.center);
        if (referenceLatLng) {
            RegionsData.instance.getCloserRegionP(referenceLatLng).then(function (region) {
                if (region.polygon === "") {
                    console.log("empty region");
                }
                _this.setState({ region: region });
            });
        }
    };
    return TripPlanner;
}(React.Component));
export default TripPlanner;
//# sourceMappingURL=TripPlanner.js.map