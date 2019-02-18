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
import Options from "../model/Options";
import Util from "../util/Util";
import IconClose from '-!svg-react-loader!../images/ic-cross.svg';
import "./OptionsView.css";
import RegionsData from "../data/RegionsData";
import ModeIdentifier from "../model/region/ModeIdentifier";
import TransportUtil from "../trip/TransportUtil";
import Checkbox from "../buttons/Checkbox";
import Color from "../model/trip/Color";
import RadioBtn from "../buttons/RadioBtn";
import { MapLocationType } from "../model/location/MapLocationType";
import Tooltip from "rc-tooltip";
import Constants from "../util/Constants";
var JourneyPref;
(function (JourneyPref) {
    JourneyPref["FASTEST"] = "Fastest";
    JourneyPref["FEWEST_CHANGES"] = "Fewest changes";
    JourneyPref["LEAST_WALKING"] = "Least walking";
})(JourneyPref || (JourneyPref = {}));
var OptionsView = /** @class */ (function (_super) {
    __extends(OptionsView, _super);
    function OptionsView(props) {
        var _this = _super.call(this, props) || this;
        _this.state = {
            update: _this.props.value,
            pickSchoolError: false
        };
        RegionsData.instance.getModeIdentifierP(ModeIdentifier.SCHOOLBUS_ID).then(function (modeId) {
            return _this.setState({ schoolModeId: modeId });
        });
        _this.onModeCheckboxChange = _this.onModeCheckboxChange.bind(_this);
        _this.onMapOptionChange = _this.onMapOptionChange.bind(_this);
        _this.onPrefCheckedChange = _this.onPrefCheckedChange.bind(_this);
        return _this;
    }
    OptionsView.prototype.onModeCheckboxChange = function (mode, checked) {
        this.setState(function (prevState) {
            var modesDisabledUpdate = Object.assign([], prevState.update.modesDisabled);
            var imode = modesDisabledUpdate.indexOf(mode);
            if (checked) {
                if (imode > -1) {
                    modesDisabledUpdate.splice(imode, 1);
                }
            }
            else {
                if (imode === -1) {
                    modesDisabledUpdate.push(mode);
                }
            }
            return { update: Util.iAssign(prevState.update, { modesDisabled: modesDisabledUpdate }) };
        });
        if ((mode === "wa_wal" || mode === "cy_bic") && checked) {
            this.onWheelchairChange(false);
        }
        if ((mode === ModeIdentifier.SCHOOLBUS_ID) && checked) {
            this.onModeCheckboxChange("pt_pub_bus", true);
        }
        if ((mode === "pt_pub_bus") && !checked) {
            this.onModeCheckboxChange(ModeIdentifier.SCHOOLBUS_ID, false);
        }
    };
    OptionsView.prototype.onPrefCheckedChange = function (pref, checked) {
        if (!checked) {
            return;
        }
        this.setState(function (prevState) {
            var prefsUpdate = Util.iAssign(prevState.update.weightingPrefs, {});
            switch (pref) {
                case JourneyPref.FASTEST:
                    prefsUpdate.time = 2;
                    prefsUpdate.hassle = 1;
                    break;
                case JourneyPref.FEWEST_CHANGES:
                    prefsUpdate.time = 1;
                    prefsUpdate.hassle = 2;
                    break;
                case JourneyPref.LEAST_WALKING:
                    prefsUpdate.time = 2;
                    prefsUpdate.hassle = 0;
            }
            return { update: Util.iAssign(prevState.update, { weightingPrefs: prefsUpdate }) };
        });
    };
    OptionsView.prototype.isChecked = function (pref) {
        var prefs = this.state.update.weightingPrefs;
        switch (pref) {
            case JourneyPref.FASTEST:
                return prefs.time === 2 && prefs.hassle === 1;
            case JourneyPref.FEWEST_CHANGES:
                return prefs.time === 1 && prefs.hassle === 2;
            default:
                return prefs.time === 2 && prefs.hassle === 0;
        }
    };
    OptionsView.prototype.onWheelchairChange = function (checked) {
        this.setState(function (prevState) { return ({ update: Util.iAssign(prevState.update, { wheelchair: checked }) }); });
        if (checked) {
            this.onModeCheckboxChange("wa_wal", false);
            this.onModeCheckboxChange("cy_bic", false);
        }
    };
    OptionsView.prototype.onBikeRacksChange = function (checked) {
        if (checked) {
            this.onModeCheckboxChange("pt_pub_bus", true);
            this.onModeCheckboxChange("cy_bic", true);
        }
        else {
            this.onModeCheckboxChange("cy_bic", false);
        }
    };
    OptionsView.prototype.onMapOptionChange = function (option, checked) {
        this.setState(function (prevState) {
            var mapLayersUpdate = prevState.update.mapLayers.filter(function (layer) { return layer !== option; });
            if (checked) {
                mapLayersUpdate.push(option);
            }
            return { update: Util.iAssign(prevState.update, { mapLayers: mapLayersUpdate }) };
        });
    };
    OptionsView.prototype.isModeEnabled = function (mode) {
        return this.state.update.isModeEnabled(mode);
    };
    OptionsView.prototype.close = function (apply) {
        if (apply) {
            if (!this.checkValid()) {
                return;
            }
            if (this.props.onChange) {
                this.props.onChange(this.state.update);
            }
        }
        if (this.props.onClose) {
            this.props.onClose();
        }
    };
    OptionsView.prototype.checkValid = function () {
        return true;
    };
    OptionsView.skipMode = function (mode) {
        return (mode.startsWith("me_car")
        // && !mode.startsWith("me_car-r")  // Disabled car share.
        )
            || mode.startsWith("me_mot") || mode.startsWith("ps_tnc_ODB") || mode.startsWith("cy_bic-s");
        // || mode.startsWith(ModeIdentifier.SCHOOLBUS_ID);
        // || mode.startsWith("ps_tnc_UBER") || mode.startsWith("ps_tax");
    };
    OptionsView.getOptionsModeIds = function (region) {
        var _this = this;
        var result = [];
        for (var _i = 0, _a = region.modes; _i < _a.length; _i++) {
            var mode = _a[_i];
            if (mode === "pt_pub") {
                result.push(Object.assign(new ModeIdentifier(), { identifier: "pt_pub_bus", title: "Bus", icon: null, color: Object.assign(new Color(), { blue: 168, green: 93, red: 1 }) }));
                // Disable Tram
                result.push(Object.assign(new ModeIdentifier(), { identifier: "pt_pub_tram", title: "Light Rail", icon: null, color: Object.assign(new Color(), { blue: 47, green: 33, red: 208 }) }));
                continue;
            }
            result.push(RegionsData.instance.getModeIdentifier(mode));
        }
        return result.filter(function (mode) {
            return !_this.skipMode(mode.identifier);
        });
    };
    OptionsView.prototype.render = function () {
        var _this = this;
        var schoolModeId = this.state.schoolModeId;
        var modesSectionFilter = function (modeId) {
            var id = modeId.identifier;
            return !id.startsWith(ModeIdentifier.SCHOOLBUS_ID) && !id.startsWith(ModeIdentifier.UBER_ID) &&
                !id.startsWith(ModeIdentifier.CAR_RENTAL_SW_ID) && !id.startsWith(ModeIdentifier.TAXI_ID);
        };
        var thirdPartySectionFilter = function (modeId) {
            var id = modeId.identifier;
            return id.startsWith(ModeIdentifier.UBER_ID) || id.startsWith(ModeIdentifier.CAR_RENTAL_SW_ID) ||
                id.startsWith(ModeIdentifier.TAXI_ID);
        };
        var modeToCheckbox = function (modeId, index) {
            var circleBg = modeId.icon === null;
            var modeOptionDisabled = Options.overrideDisabled.indexOf(modeId.identifier) !== -1;
            var transportColor = modeOptionDisabled ? "#b1aeae" : TransportUtil.getTransportColorByIconS(TransportUtil.modeIdToIconS(modeId.identifier));
            var onDark = !modeId.identifier.includes(ModeIdentifier.SCHOOLBUS_ID); // TODO: Hardcoded for TC
            return (React.createElement("div", { key: index, className: "gl-flex gl-align-center" },
                React.createElement("img", { src: TransportUtil.getTransportIconModeId(modeId, false, onDark), className: "OptionsView-icon " + (circleBg ? " OptionsView-onDark" : ""), style: {
                        backgroundColor: circleBg ? (transportColor !== null ? transportColor : "black") : "none",
                        border: !circleBg ? "1px solid " + (transportColor !== null ? transportColor : "black") : "none",
                    }, "aria-hidden": "true" }),
                React.createElement(Checkbox, { id: "chbox-" + modeId.identifier, checked: _this.isModeEnabled(modeId.identifier), onChange: function (checked) { return _this.onModeCheckboxChange(modeId.identifier, checked); }, ariaLabelledby: "label-" + modeId.identifier, disabled: modeOptionDisabled }),
                React.createElement("label", { htmlFor: "chbox-" + modeId.identifier, id: "label-" + modeId.identifier }, modeId.title)));
        };
        return (React.createElement("div", { className: "OptionsView gl-flex gl-column" + (this.props.className ? " " + this.props.className : "") },
            React.createElement("div", { className: "gl-flex gl-align-center gl-space-between OptionsView-header" },
                React.createElement("div", { className: "h3-text" }, "Journey Options"),
                React.createElement("button", { onClick: function () { return _this.close(false); }, "aria-label": "Close" },
                    React.createElement(IconClose, { className: "gl-pointer", focusable: "false" }))),
            React.createElement("div", { className: "OptionsView-scrollPanel gl-scrollable-y" },
                React.createElement("div", { className: "OptionsView-headerSeparation" }),
                React.createElement("div", { className: "h4-text OptionsView-sectionTitle", tabIndex: 0 }, "Modes"),
                React.createElement("div", { className: "OptionsView-modesPanel" }, this.props.region ? OptionsView.getOptionsModeIds(this.props.region)
                    .filter(modesSectionFilter).map(modeToCheckbox) : null),
                React.createElement("div", { className: "h4-text OptionsView-separation OptionsView-sectionTitle", tabIndex: 0 }, "Journey Preferences"),
                React.createElement("div", { className: "OptionsView-journey-prefs gl-flex gl-space-around", role: "radiogroup" },
                    React.createElement("div", { className: "gl-flex gl-align-center" },
                        React.createElement(Tooltip, { placement: "top", overlay: React.createElement("div", { className: "OptionsView-tooltip", id: "jp-fa-info" }, "The journey that will take the least amount of time."), align: { offset: [0, -10] }, overlayClassName: "app-style OptionsView-tooltip", mouseEnterDelay: .5 },
                            React.createElement("div", { className: "gl-flex gl-align-center" },
                                React.createElement(RadioBtn, { name: "journey-prefs", id: "jp-fa", checked: this.isChecked(JourneyPref.FASTEST), onChange: function (checked) { return _this.onPrefCheckedChange(JourneyPref.FASTEST, checked); }, ariaLabelledby: "label-jp-fa" }),
                                React.createElement("label", { htmlFor: "jp-fa", id: "label-jp-fa" }, JourneyPref.FASTEST),
                                React.createElement("img", { src: Constants.absUrl("/images/ic-info-circle.svg"), "aria-hidden": true, className: "OptionsView-infoIcon" })))),
                    React.createElement("div", { className: "gl-flex gl-align-center" },
                        React.createElement(Tooltip, { placement: "top", overlay: React.createElement("div", { className: "OptionsView-tooltip" }, "The journey with the fewest connections."), 
                            // align={{offset: [10, 0]}}
                            align: { offset: [0, -10] }, overlayClassName: "app-style OptionsView-tooltip", mouseEnterDelay: .5 },
                            React.createElement("div", { className: "gl-flex gl-align-center" },
                                React.createElement(RadioBtn, { name: "journey-prefs", id: "jp-fc", checked: this.isChecked(JourneyPref.FEWEST_CHANGES), onChange: function (checked) { return _this.onPrefCheckedChange(JourneyPref.FEWEST_CHANGES, checked); }, ariaLabelledby: "label-jp-fc" }),
                                React.createElement("label", { htmlFor: "jp-fc", id: "label-jp-fc" }, JourneyPref.FEWEST_CHANGES),
                                React.createElement("img", { src: Constants.absUrl("/images/ic-info-circle.svg"), "aria-hidden": true, className: "OptionsView-infoIcon" })))),
                    React.createElement("div", { className: "gl-flex gl-align-center" },
                        React.createElement(Tooltip, { placement: "top", overlay: React.createElement("div", { className: "OptionsView-tooltip" }, "The journey with the least amount of walking."), align: { offset: [0, -10] }, overlayClassName: "app-style OptionsView-tooltip", mouseEnterDelay: .5 },
                            React.createElement("div", { className: "gl-flex gl-align-center" },
                                React.createElement(RadioBtn, { name: "journey-prefs", id: "jp-lw", checked: this.isChecked(JourneyPref.LEAST_WALKING), onChange: function (checked) { return _this.onPrefCheckedChange(JourneyPref.LEAST_WALKING, checked); }, ariaLabelledby: "label-jp-lw" }),
                                React.createElement("label", { htmlFor: "jp-lw", id: "label-jp-lw" }, JourneyPref.LEAST_WALKING),
                                React.createElement("img", { src: Constants.absUrl("/images/ic-info-circle.svg"), "aria-hidden": true, className: "OptionsView-infoIcon" }))))),
                React.createElement("div", { className: "h4-text OptionsView-separation OptionsView-sectionTitle", tabIndex: 0 }, "Special Services"),
                React.createElement("div", { className: "OptionsView-special-services gl-flex gl-space-around" },
                    React.createElement("div", { className: "gl-flex gl-align-center" },
                        React.createElement("img", { src: Constants.absUrl("/images/modeicons/ic-wheelchair.svg"), className: "gl-charSpace OptionsView-icon OptionsView-onDark gl-no-shrink", style: {
                                border: "1px solid grey"
                            }, "aria-hidden": true }),
                        React.createElement(Tooltip, { placement: "top", overlay: React.createElement("div", { className: "OptionsView-tooltip" }, "Choosing this option will only display services with wheelchair accessibility."), align: { offset: [0, -10] }, overlayClassName: "app-style OptionsView-tooltip", mouseEnterDelay: .5 },
                            React.createElement("div", { className: "gl-flex gl-align-center" },
                                React.createElement(Checkbox, { id: "ss-wa", checked: this.state.update.wheelchair, onChange: function (checked) { return _this.onWheelchairChange(checked); }, ariaLabelledby: "labe-ss-wa" }),
                                React.createElement("label", { htmlFor: "ss-wa", id: "labe-ss-wa" }, "Wheelchair Accessible"),
                                React.createElement("img", { src: Constants.absUrl("/images/ic-info-circle.svg"), "aria-hidden": true, className: "OptionsView-infoIcon" })))),
                    React.createElement("div", { className: "gl-flex gl-align-center OptionsView-leftMargin" },
                        React.createElement("img", { src: Constants.absUrl("/images/modeicons/ic-bikeRack.svg"), className: "gl-charSpace gl-no-shrink", style: { width: "24px", height: "24px" }, "aria-hidden": "true" }),
                        React.createElement(Tooltip, { placement: "top", overlay: React.createElement("div", { className: "OptionsView-tooltip" }, "Choosing this option will only display services with bike racks."), align: { offset: [0, -10] }, overlayClassName: "app-style OptionsView-tooltip", mouseEnterDelay: .5 },
                            React.createElement("div", { className: "gl-flex gl-align-center" },
                                React.createElement(Checkbox, { id: "ss-br", checked: this.state.update.bikeRacks, onChange: function (checked) { return _this.onBikeRacksChange(checked); }, ariaLabelledby: "label-ss-br" }),
                                React.createElement("label", { htmlFor: "ss-br", id: "label-ss-br" }, "Bike Racks"),
                                React.createElement("img", { src: Constants.absUrl("/images/ic-info-circle.svg"), "aria-hidden": true, className: "OptionsView-infoIcon" })))),
                    this.state.schools && schoolModeId ?
                        React.createElement("div", { className: "OptionsView-schoolBusPanel gl-flex gl-align-center OptionsView-leftMargin gl-no-shrink" },
                            React.createElement("img", { src: TransportUtil.getTransportIconModeId(schoolModeId, false, false), className: "OptionsView-icon gl-no-shrink", style: {
                                    border: "1px solid " + TransportUtil.getTransportColorByIconS(TransportUtil.modeIdToIconS(schoolModeId.identifier)),
                                }, "aria-hidden": "true" }),
                            React.createElement(Tooltip, { placement: "top", overlay: React.createElement("div", { className: "OptionsView-tooltip" }, "This option will display both dedicated school services and regular route services."), align: { offset: [0, -10] }, overlayClassName: "app-style OptionsView-tooltip", mouseEnterDelay: .5 },
                                React.createElement("div", { className: "gl-flex gl-align-center" },
                                    React.createElement(Checkbox, { checked: this.isModeEnabled(schoolModeId.identifier), onChange: function (checked) { return _this.onModeCheckboxChange(schoolModeId.identifier, checked); } }),
                                    React.createElement("label", null,
                                        React.createElement("img", { src: Constants.absUrl("/images/ic-info-circle.svg"), "aria-hidden": true }))))) : null),
                React.createElement("div", { className: "h4-text OptionsView-separation OptionsView-sectionTitle", tabIndex: 0 }, "Map Options"),
                React.createElement("div", { className: "OptionsView-map-options gl-flex gl-space-around" },
                    React.createElement("div", { className: "gl-flex gl-align-center" },
                        React.createElement("img", { src: Constants.absUrl("/images/modeicons/ic-myway.svg"), className: "gl-charSpace", style: { width: "24px", height: "24px" }, "aria-hidden": "true" }),
                        React.createElement(Checkbox, { id: "mo-mw", checked: this.state.update.mapLayers.indexOf(MapLocationType.MY_WAY_FACILITY) !== -1, onChange: function (checked) { return _this.onMapOptionChange(MapLocationType.MY_WAY_FACILITY, checked); }, ariaLabelledby: "label-mo-mw" }),
                        React.createElement("label", { htmlFor: "mo-mw", id: "label-mo-mw" }, "MyWay retailers")),
                    React.createElement("div", { className: "gl-flex gl-align-center" },
                        React.createElement("img", { src: Constants.absUrl("/images/modeicons/ic-parkAndRide.svg"), className: "gl-charSpace", style: { width: "36px", height: "36px" }, "aria-hidden": "true" }),
                        React.createElement(Checkbox, { id: "mo-pr", checked: this.state.update.mapLayers.indexOf(MapLocationType.PARK_AND_RIDE_FACILITY) !== -1, onChange: function (checked) { return _this.onMapOptionChange(MapLocationType.PARK_AND_RIDE_FACILITY, checked); }, ariaLabelledby: "label-mo-pr" }),
                        React.createElement("label", { htmlFor: "mo-pr", id: "label-mo-pr" }, "Park & Ride")),
                    React.createElement("div", { className: "gl-flex gl-align-center" },
                        React.createElement("img", { src: Constants.absUrl("/images/modeicons/ic-bikeShare.svg"), className: "gl-charSpace", style: { width: "24px", height: "24px" }, "aria-hidden": "true" }),
                        React.createElement(Tooltip, { placement: "top", overlay: React.createElement("div", { className: "OptionsView-tooltip" },
                                "This option displays bike share locations. Check current availability ",
                                React.createElement("a", { href: "https://airbike.network/#download", target: "_blank", className: "gl-link" }, "here"),
                                "."), align: { offset: [0, -10] }, overlayClassName: "app-style OptionsView-tooltip", mouseEnterDelay: .5 },
                            React.createElement("div", { className: "gl-flex gl-align-center" },
                                React.createElement(Checkbox, { id: "mo-bs", checked: this.state.update.mapLayers.indexOf(MapLocationType.BIKE_POD) !== -1, onChange: function (checked) { return _this.onMapOptionChange(MapLocationType.BIKE_POD, checked); }, ariaLabelledby: "label-mo-bs" }),
                                React.createElement("label", { htmlFor: "mo-bs", id: "label-mo-bs" }, "Bike Share"),
                                React.createElement("img", { src: Constants.absUrl("/images/ic-info-circle.svg"), "aria-hidden": true, className: "OptionsView-infoIcon" }))))),
                React.createElement("div", { className: "h4-text OptionsView-separation OptionsView-sectionTitle", tabIndex: 0 }, "Third Party Options"),
                React.createElement("div", { className: "OptionsView-modesPanel" }, this.props.region ? OptionsView.getOptionsModeIds(this.props.region)
                    .filter(thirdPartySectionFilter).map(modeToCheckbox) : null)),
            React.createElement("button", { className: "gl-button gl-no-shrink", onClick: function () { return _this.close(true); } }, "Apply")));
    };
    return OptionsView;
}(React.Component));
export default OptionsView;
//# sourceMappingURL=OptionsView.js.map