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
import * as React from 'react';
import './QueryWidget.css';
import QueryInput from "../query/QueryInput";
import '../css/global.css';
import '../css/device.css';
import IconStarFilled from "-!svg-react-loader!../images/ic-star-filled.svg";
import IconNpMap from "-!svg-react-loader!../images/ic-np_map.svg";
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import FavouriteTrip from "../model/FavouriteTrip";
import FavouritesData from "../data/FavouritesData";
import RoutingQuery from "../model/RoutingQuery";
import FavouriteList from "../favourite/FavouriteList";
import FavouriteBtn from "../favourite/FavouriteBtn";
import RegionsData from "../data/RegionsData";
import LatLng from "../model/LatLng";
import OptionsView from "../options/OptionsView";
import Modal from 'react-modal';
import OptionsData from "../data/OptionsData";
import Util from "../util/Util";
import BBox from "../model/BBox";
import TPlannerDisclaimer from "./TPlannerDisclaimer";
import WaiAriaUtil from "../util/WaiAriaUtil";
import GATracker from "../analytics/GATracker";
var TabView;
(function (TabView) {
    TabView["PLANNER"] = "PLANNER";
    TabView["FAVOURITES"] = "FAVOURITES";
})(TabView || (TabView = {}));
var QueryWidget = /** @class */ (function (_super) {
    __extends(QueryWidget, _super);
    function QueryWidget(props) {
        var _this = _super.call(this, props) || this;
        _this.onTabClicked = _this.onTabClicked.bind(_this);
        _this.state = {
            selectedTab: TabView.PLANNER,
            routingQuery: RoutingQuery.create(),
            showOptions: false,
            // TODO: Hardcode ACT bounding box to initalize, but not necessary (can leave undefined)
            queryInputBounds: BBox.createBBox(LatLng.createLatLng(-34.37701, 149.852), LatLng.createLatLng(-35.975, 148.674)),
            queryInputFocusLatLng: LatLng.createLatLng(-35.3, 149.1)
        };
        WaiAriaUtil.addTabbingDetection();
        _this.onGoClicked = _this.onGoClicked.bind(_this);
        _this.onFavClicked = _this.onFavClicked.bind(_this);
        _this.onShowOptions = _this.onShowOptions.bind(_this);
        _this.onOptionsChange = _this.onOptionsChange.bind(_this);
        _this.onModalRequestedClose = _this.onModalRequestedClose.bind(_this);
        return _this;
    }
    QueryWidget.prototype.onTabClicked = function (e) {
        this.setState({ selectedTab: e.target.name });
    };
    /**
     * Not triggered by QueryInput if not complete.
     */
    QueryWidget.prototype.onGoClicked = function () {
        // Need to check not null again to avoid error
        if (this.state.routingQuery.from !== null && this.state.routingQuery.to !== null) {
            FavouritesData.recInstance.add(FavouriteTrip.create(this.state.routingQuery.from, this.state.routingQuery.to));
        }
        window.open(this.state.routingQuery.getGoUrl(this.props.plannerUrl), '_blank');
    };
    QueryWidget.prototype.onFavClicked = function (favourite) {
        var _this = this;
        var query = RoutingQuery.create(favourite.from, favourite.to);
        this.setState({
            routingQuery: query
        }, function () { return window.open(_this.state.routingQuery.getGoUrl(_this.props.plannerUrl), '_blank'); });
        if (favourite.options) {
            var favOptions = Util.iAssign(query.options, FavouritesData.getFavOptionsPart(favourite.options));
            OptionsData.instance.save(favOptions);
            query.options = favOptions;
        }
    };
    QueryWidget.prototype.onShowOptions = function () {
        var _this = this;
        GATracker.instance.send('query input', 'click', 'options button');
        RegionsData.instance.getRegionP(new LatLng())
            .then(function () { return _this.setState({ showOptions: true }); });
    };
    QueryWidget.prototype.onOptionsChange = function (update) {
        var _this = this;
        OptionsData.instance.save(update);
        this.setState(function (prevState) {
            return _this.setState({ routingQuery: Util.iAssign(prevState.routingQuery, { options: update }) });
        });
    };
    QueryWidget.prototype.componentDidMount = function () {
        var _this = this;
        RegionsData.instance.getRegionP(new LatLng()).then(function (region) {
            _this.setState({ queryInputBounds: region.bounds });
        });
    };
    QueryWidget.prototype.onModalRequestedClose = function () {
        this.setState({ showOptions: false });
    };
    QueryWidget.prototype.render = function () {
        var _this = this;
        var favourite = (this.state.routingQuery.from !== null && this.state.routingQuery.to !== null) ?
            FavouriteTrip.create(this.state.routingQuery.from, this.state.routingQuery.to) :
            null;
        var optionsBtn = React.createElement("button", { className: "QueryWidget-optionsBtn", onClick: this.onShowOptions }, "Options");
        var optionsDialog = this.state.showOptions ?
            React.createElement(Modal, { isOpen: this.state.showOptions, ariaHideApp: false, onRequestClose: this.onModalRequestedClose },
                React.createElement(OptionsView, { value: this.state.routingQuery.options, region: RegionsData.instance.getRegion(new LatLng()), onChange: this.onOptionsChange, onClose: this.onModalRequestedClose, className: "app-style" }))
            : null;
        return (React.createElement("div", { className: "App gl-flex gl-grow" },
            React.createElement(Tabs, { forceRenderTabPanel: true },
                React.createElement(TabList, { className: "App-tabsPanel gl-flex gl-no-shrink" },
                    React.createElement(Tab, { className: "App-tabBtn gl-grow" },
                        React.createElement(IconNpMap, { className: "App-starIcon", "aria-hidden": true, focusable: "false" }),
                        "Journey Planner"),
                    React.createElement(Tab, { className: "App-tabBtn gl-grow" },
                        React.createElement(IconStarFilled, { className: "App-starIcon", "aria-hidden": true, focusable: "false" }),
                        "My favourite journeys")),
                React.createElement(TabPanel, null,
                    React.createElement(QueryInput, { value: this.state.routingQuery, bounds: this.state.queryInputBounds, focusLatLng: this.state.queryInputFocusLatLng, onChange: function (value) { return _this.setState({ routingQuery: value }); }, onGoClicked: function () { return _this.onGoClicked(); }, bottomRightComponent: React.createElement(FavouriteBtn, { favourite: favourite }), bottomLeftComponent: optionsBtn }),
                    React.createElement(FavouriteList, { recent: true, previewMax: 1, showMax: 3, title: "MY RECENT JOURNEYS", onValueClicked: this.onFavClicked, hideWhenEmpty: true, className: "App-lastJourneyPanel gl-scrollable-y", moreBtnClass: "App-favMoreBtn" }),
                    React.createElement(TPlannerDisclaimer, { className: "App-disclaimer gl-no-shrink" })),
                React.createElement(TabPanel, null,
                    React.createElement(FavouriteList, { recent: false, previewMax: 3, onValueClicked: this.onFavClicked, className: "App-favouriteList gl-flex gl-grow gl-scrollable-y", moreBtnClass: "App-favMoreBtn" }))),
            optionsDialog));
    };
    return QueryWidget;
}(React.Component));
export default QueryWidget;
//# sourceMappingURL=QueryWidget.js.map