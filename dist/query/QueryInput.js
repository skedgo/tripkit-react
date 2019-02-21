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
import "./QueryInput.css";
import LocationBox from "../location_box/LocationBox";
import MultiGeocoder from "../location_box/MultiGeocoder";
import IconClock from "-!svg-react-loader!../images/ic-clock.svg";
import IconAngleDown from "-!svg-react-loader!../images/ic-angle-down.svg";
import IconCalendar from "-!svg-react-loader!../images/ic-calendar.svg";
import IconFromTo from "-!svg-react-loader?name=IconFromTo!../images/ic-from-to.svg"; // https://github.com/jhamlet/svg-react-loader/issues/86
import IconSwap from '-!svg-react-loader!../images/ic-swap-arrows.svg';
import 'react-datepicker/dist/react-datepicker.css';
import RoutingQuery, { TimePreference } from "../model/RoutingQuery";
import Util from "../util/Util";
import Tooltip from 'rc-tooltip';
import 'rc-tooltip/assets/bootstrap_white.css';
import DateTimePicker from "../time/DateTimePicker";
import DateTimeUtil from "../util/DateTimeUtil";
import GATracker from "../analytics/GATracker";
import DeviceUtil from "../util/DeviceUtil";
var QueryInput = /** @class */ (function (_super) {
    __extends(QueryInput, _super);
    function QueryInput(props) {
        var _this = _super.call(this, props) || this;
        _this.state = {
            routingQuery: props.value ? props.value : RoutingQuery.create(),
            preselFrom: null,
            preselTo: null,
            timePanelOpen: false,
            fromTooltip: false,
            toTooltip: false,
            collapsed: false
        };
        _this.geocodingData = new MultiGeocoder(_this.props.geocoderOptions);
        _this.onPrefClicked = _this.onPrefClicked.bind(_this);
        _this.onSwapClicked = _this.onSwapClicked.bind(_this);
        return _this;
    }
    QueryInput.prototype.getTimeBtnText = function () {
        return this.state.routingQuery.timePref === TimePreference.NOW ? "Leaving now" :
            (this.state.routingQuery.timePref === TimePreference.LEAVE ?
                "Leaving after " + this.state.routingQuery.time.format(DateTimeUtil.DATE_TIME_FORMAT) :
                "Arriving before " + this.state.routingQuery.time.format(DateTimeUtil.DATE_TIME_FORMAT));
    };
    QueryInput.prototype.onPrefClicked = function (e) {
        var timePref = e.target.name;
        GATracker.instance.send("query input", "time pref", timePref.toLowerCase());
        if (timePref === TimePreference.NOW) {
            this.updateQuery({
                timePref: timePref,
                time: DateTimeUtil.getNow()
            });
        }
        else {
            this.updateQuery({
                timePref: timePref
            });
        }
    };
    QueryInput.prototype.onSwapClicked = function () {
        this.updateQuery({
            from: this.state.routingQuery.to,
            to: this.state.routingQuery.from
        });
    };
    QueryInput.prototype.updateQuery = function (update, callback) {
        this.setQuery(Util.iAssign(this.state.routingQuery, update), callback);
    };
    QueryInput.prototype.setQuery = function (update, callback) {
        var _this = this;
        this.setState({
            routingQuery: update
        }, function () {
            if (_this.props.onChange) {
                _this.props.onChange(_this.state.routingQuery);
            }
            if (callback) {
                callback();
            }
        });
    };
    QueryInput.prototype.showTooltip = function (from, show) {
        if (from) {
            this.setState({ fromTooltip: show });
            if (this.fromLocRef && show) {
                this.fromLocRef.setFocus();
            }
        }
        else {
            this.setState({ toTooltip: show });
            if (this.toLocRef && show) {
                this.toLocRef.setFocus();
            }
        }
    };
    QueryInput.prototype.componentDidUpdate = function (prevProps, prevState, snapshot) {
        if (this.props.value && this.props.value !== prevProps.value
            && this.props.value !== this.state.routingQuery) {
            this.setQuery(this.props.value);
        }
    };
    QueryInput.prototype.render = function () {
        var _this = this;
        var datePickerDisabled = this.state.routingQuery.timePref === TimePreference.NOW;
        var collapseBtn = this.props.collapsable ?
            React.createElement(IconAngleDown, { className: "QueryInput-collapseBtn gl-svg-path-fill-currColor" + (!this.state.collapsed ? " gl-rotate180" : ""), onClick: function () { return _this.setState(function (prevState) { return ({ collapsed: !prevState.collapsed }); }); }, focusable: "false" }) : null;
        var expandBtn = React.createElement(IconAngleDown, { className: "QueryInput-collapseBtn gl-svg-path-fill-currColor gl-no-shrink" + (!this.state.collapsed ? " gl-rotate180" : ""), onClick: function () { return _this.setState(function (prevState) { return ({ collapsed: !prevState.collapsed }); }); }, focusable: "false" });
        var fromPlaceholder = "Choose starting point" +
            (this.props.isTripPlanner ? ", or click on the map" : "") +
            "...";
        var toPlaceholder = "Choose destination" +
            (this.props.isTripPlanner && this.state.routingQuery.from !== null ? ", or click on the map" : "") +
            "...";
        var ariaLabelFrom = this.state.routingQuery.from !== null ?
            "From " + this.state.routingQuery.from.address :
            fromPlaceholder.substring(0, fromPlaceholder.length - 3);
        var ariaLabelTo = this.state.routingQuery.to !== null ?
            "To " + this.state.routingQuery.to.address :
            toPlaceholder.substring(0, toPlaceholder.length - 3);
        return (React.createElement("div", { className: this.props.className },
            React.createElement("div", { className: "QueryInput-fromToTimePanel gl-flex gl-column" + (this.state.collapsed ? " QueryInput-collapsed" : "") },
                React.createElement("div", { className: "QueryInput-fromToPanel gl-flex gl-align-center" },
                    React.createElement(IconFromTo, { className: "QueryInput-fromToIcon", "aria-hidden": true, focusable: "false" }),
                    React.createElement("div", { className: "QueryInput-fromToInputsPanel gl-flex gl-column gl-grow" },
                        React.createElement(Tooltip, { placement: "top", overlay: "Enter a location", arrowContent: React.createElement("div", { className: "rc-tooltip-arrow-inner" }), visible: this.state.fromTooltip, overlayClassName: "QueryInput-tooltip" },
                            React.createElement("div", { className: "QueryInput-locationPanel gl-flex gl-align-center" },
                                React.createElement("span", { className: "QueryInput-fromToLabel gl-flex", "aria-hidden": true }, "FROM"),
                                React.createElement(LocationBox, { geocodingData: this.geocodingData, bounds: this.props.bounds, focus: this.props.focusLatLng, value: this.state.routingQuery.from, placeholder: fromPlaceholder, onChange: function (value, highlighted) {
                                        if (!highlighted) {
                                            _this.updateQuery({ from: value });
                                            _this.setState({ preselFrom: null });
                                            if (_this.props.onPreChange) {
                                                _this.props.onPreChange(true, undefined);
                                            }
                                            if (value !== null) {
                                                GATracker.instance.send("query input", "pick location", value.isCurrLoc() ? "current location" : "type address");
                                            }
                                        }
                                        else {
                                            _this.setState({ preselFrom: value });
                                            if (_this.props.onPreChange) {
                                                _this.props.onPreChange(true, value ? value : undefined);
                                            }
                                        }
                                        _this.showTooltip(true, false);
                                    }, resolveCurr: !!this.props.isTripPlanner, ref: function (el) { return _this.fromLocRef = el; }, inputAriaLabel: ariaLabelFrom, inputId: "input-from", sideDropdown: DeviceUtil.isTablet && this.props.isTripPlanner }))),
                        React.createElement(Tooltip, { placement: "top", overlay: "Enter a location", arrowContent: React.createElement("div", { className: "rc-tooltip-arrow-inner" }), visible: this.state.toTooltip, overlayClassName: "QueryInput-tooltip" },
                            React.createElement("div", { className: "QueryInput-locationPanel gl-flex gl-align-center" },
                                React.createElement("span", { className: "QueryInput-fromToLabel gl-flex", "aria-hidden": true }, "TO"),
                                React.createElement(LocationBox, { geocodingData: this.geocodingData, bounds: this.props.bounds, focus: this.props.focusLatLng, value: this.state.routingQuery.to, placeholder: toPlaceholder, onChange: function (value, highlighted) {
                                        if (!highlighted) {
                                            _this.updateQuery({ to: value });
                                            _this.setState({ preselTo: null });
                                            if (_this.props.onPreChange) {
                                                _this.props.onPreChange(false, undefined);
                                            }
                                            if (value !== null) {
                                                GATracker.instance.send("query input", "pick location", value.isCurrLoc() ? "current location" : "type address");
                                            }
                                        }
                                        else {
                                            _this.setState({ preselTo: value });
                                            if (_this.props.onPreChange) {
                                                _this.props.onPreChange(false, value ? value : undefined);
                                            }
                                        }
                                        _this.showTooltip(false, false);
                                    }, resolveCurr: !!this.props.isTripPlanner, ref: function (el) { return _this.toLocRef = el; }, inputAriaLabel: ariaLabelTo, inputId: "input-to", sideDropdown: DeviceUtil.isTablet && this.props.isTripPlanner })))),
                    React.createElement("button", { className: "QueryInput-swapBtn gl-flex gl-column gl-align-center", onClick: this.onSwapClicked },
                        React.createElement(IconSwap, { className: "QueryInput-iconSwap", "aria-hidden": true, focusable: "false" }),
                        React.createElement("div", null, "SWAP"))),
                React.createElement("div", { className: "QueryInput-timeBtnPanel gl-flex gl-align-center gl-space-between" },
                    React.createElement("button", { className: "QueryInput-timeBtn gl-flex gl-align-center", onClick: function () {
                            _this.setState({ timePanelOpen: !_this.state.timePanelOpen });
                            if (_this.props.onTimePanelOpen) {
                                _this.props.onTimePanelOpen(!_this.state.timePanelOpen);
                            }
                        }, "aria-label": "Time preference, " + this.getTimeBtnText(), "aria-expanded": this.state.timePanelOpen, "aria-controls": "query-time-panel" },
                        React.createElement(IconClock, { className: "QueryInput-iconClock", focusable: "false" }),
                        this.getTimeBtnText(),
                        React.createElement(IconAngleDown, { className: "QueryInput-iconAngleDown" + (this.state.timePanelOpen ? " up" : ""), focusable: "false" })),
                    React.createElement("div", { className: "gl-flex gl-align-center" },
                        this.props.bottomRightComponent,
                        collapseBtn)),
                React.createElement("div", { className: "QueryInput-timePanel" + (!this.state.timePanelOpen ? " gl-display-none" : ""), id: "query-time-panel" },
                    React.createElement("div", { className: "QueryInput-timePrefPanel gl-flex" },
                        React.createElement("button", { name: TimePreference.NOW, className: "QueryInput-timePrefBtn gl-grow" + (this.state.routingQuery.timePref === TimePreference.NOW ? " selected" : ""), onClick: this.onPrefClicked }, "Now"),
                        React.createElement("button", { name: TimePreference.LEAVE, className: "QueryInput-timePrefBtn gl-grow" + (this.state.routingQuery.timePref === TimePreference.LEAVE ? " selected" : ""), onClick: this.onPrefClicked }, "Leaving"),
                        React.createElement("button", { name: TimePreference.ARRIVE, className: "QueryInput-timePrefBtn gl-grow" + (this.state.routingQuery.timePref === TimePreference.ARRIVE ? " selected" : ""), onClick: this.onPrefClicked }, "Arriving")),
                    React.createElement("div", { className: "QueryInput-timeCalPanel gl-flex gl-align-stretch" + (datePickerDisabled ? " disabled" : "") },
                        React.createElement(DateTimePicker, { value: this.state.routingQuery.time, onChange: function (date) {
                                _this.updateQuery({ time: date });
                                // if (DeviceUtil.isDesktop && this.goBtnRef) {    // give focus to go button after selecting time.
                                //     setTimeout(() => this.goBtnRef.focus(), 50);
                                // }
                            }, timeFormat: DateTimeUtil.TIME_FORMAT, dateFormat: DateTimeUtil.DATE_TIME_FORMAT, disabled: datePickerDisabled, ref: function (el) { return _this.dateTimePickerRef = el; } }),
                        React.createElement("button", { className: "QueryInput-iconCalPanel gl-flex gl-center gl-align-center", onClick: function () {
                                if (_this.dateTimePickerRef) {
                                    _this.dateTimePickerRef.setFocus();
                                }
                            }, disabled: datePickerDisabled, "aria-label": "Open calendar", "aria-hidden": true, tabIndex: -1 },
                            React.createElement(IconCalendar, { className: "QueryInput-iconCalendar", focusable: "false" })))),
                this.props.bottomLeftComponent || this.props.onGoClicked ?
                    React.createElement("div", { className: "QueryInput-bottomPanel gl-flex gl-space-between" },
                        this.props.bottomLeftComponent,
                        this.props.onGoClicked ?
                            React.createElement("button", { className: "QueryInput-continueBtn gl-button", onClick: function () {
                                    if (!_this.state.routingQuery.isComplete()) {
                                        if (_this.state.routingQuery.from === null) {
                                            _this.showTooltip(true, true);
                                        }
                                        else if (_this.state.routingQuery.to === null) {
                                            _this.showTooltip(false, true);
                                        }
                                        return;
                                    }
                                    if (_this.props.onGoClicked) {
                                        _this.props.onGoClicked(_this.state.routingQuery);
                                    }
                                }, ref: function (el) { return _this.goBtnRef = el; } }, "Continue") : null) : null),
            React.createElement("div", { className: "QueryInput-brief gl-align-center gl-space-between" + (this.state.collapsed ? " QueryInput-collapsed" : "") },
                React.createElement("div", { className: "QueryInput-fromAndToPanelBrief" },
                    React.createElement("div", { className: "QueryInput-fromToPanelBrief gl-flex gl-align-center" },
                        React.createElement("span", { className: "QueryInput-fromToLabel gl-flex gl-no-shrink" }, "FROM"),
                        React.createElement("span", { className: "gl-overflow-ellipsis" }, this.state.routingQuery.from ? this.state.routingQuery.from.address : "")),
                    React.createElement("div", { className: "gl-flex gl-align-center" },
                        React.createElement("span", { className: "QueryInput-fromToLabel gl-flex gl-no-shrink" }, "TO"),
                        React.createElement("span", { className: "gl-overflow-ellipsis" }, this.state.routingQuery.to ? this.state.routingQuery.to.address : ""))),
                expandBtn)));
    };
    return QueryInput;
}(React.Component));
export default QueryInput;
//# sourceMappingURL=QueryInput.js.map