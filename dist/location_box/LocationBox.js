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
import React, { Component } from 'react';
import Autocomplete from 'react-autocomplete';
import './LocationBox.css';
import IconRemove from '-!svg-react-loader!../images/ic-cross.svg';
import IconSpin from '-!svg-react-loader!../images/ic-loading2.svg';
import ResultItem from "./ResultItem";
import Tooltip from "rc-tooltip";
import DeviceUtil from "../util/DeviceUtil";
var LocationBox = /** @class */ (function (_super) {
    __extends(LocationBox, _super);
    function LocationBox(props) {
        var _this = _super.call(this, props) || this;
        _this.itemToLocationMap = [];
        _this.highlightedItem = null;
        _this.AUTOCOMPLETE_DELAY = 200;
        _this.state = {
            inputText: '',
            locationValue: null,
            highlightedValue: null,
            items: [],
            focus: false,
            ddopen: function () {
                return _this.state.focus && _this.state.items !== undefined && _this.state.items.length > 0;
                // return true;
            },
            waiting: false
        };
        _this.geocodingData = props.geocodingData;
        _this.handleAutocompleteResults = _this.handleAutocompleteResults.bind(_this);
        _this.renderInput = _this.renderInput.bind(_this);
        _this.renderMenu = _this.renderMenu.bind(_this);
        _this.onChange = _this.onChange.bind(_this);
        _this.onSelect = _this.onSelect.bind(_this);
        _this.renderItem = _this.renderItem.bind(_this);
        _this.onClearClicked = _this.onClearClicked.bind(_this);
        _this.onKeyDown = _this.onKeyDown.bind(_this);
        _this.refreshHighlight = _this.refreshHighlight.bind(_this);
        _this.getHighlightedLocation = _this.getHighlightedLocation.bind(_this);
        _this.setValue = _this.setValue.bind(_this);
        return _this;
    }
    LocationBox.itemText = function (location) {
        return location.address;
    };
    /**
     * Set a location to the location box.
     * @param {Location | null} locationValue - The location to set.
     * @param {boolean} highlighted - Indicates if the location is set just as highlighted, or as selected.
     * @param {boolean} fireEvents - If should fire events.
     */
    LocationBox.prototype.setValue = function (locationValue, highlighted, fireEvents, callback) {
        var _this = this;
        if (highlighted === void 0) { highlighted = false; }
        if (fireEvents === void 0) { fireEvents = false; }
        var inputText = this.state.inputText;
        if (!highlighted) { // Set location address as input text
            inputText = locationValue ? LocationBox.itemText(locationValue) : '';
        }
        var setStateCallback = function () {
            if (locationValue && !locationValue.isResolved() &&
                (!locationValue.isCurrLoc() || (_this.props.resolveCurr && !highlighted))) {
                _this.setState({ waiting: true });
                _this.geocodingData.resolveLocation(locationValue, function (resolvedLocation) {
                    if (locationValue === _this.state.locationValue) {
                        _this.setState({
                            locationValue: resolvedLocation,
                            waiting: false
                        }, function () {
                            _this.itemToLocationMap[LocationBox.itemText(locationValue)] = resolvedLocation;
                            _this.fireLocationChange(highlighted);
                        });
                    }
                });
            }
            else if (fireEvents) {
                _this.fireLocationChange(highlighted);
            }
            if (callback) {
                callback();
            }
        };
        if (!highlighted) {
            this.setState({
                inputText: inputText,
                locationValue: locationValue,
                items: []
            }, setStateCallback);
        }
        else {
            this.setState({
                inputText: inputText,
                highlightedValue: locationValue,
                items: this.state.items
            }, setStateCallback);
        }
    };
    LocationBox.prototype.onChange = function (inputText) {
        var _this = this;
        this.setState({ inputText: inputText }, function () {
            if (inputText === '') {
                _this.refreshResults(_this.state.inputText);
            }
            else {
                setTimeout(function () {
                    if (_this.state.inputText === inputText) {
                        _this.refreshResults(_this.state.inputText);
                    }
                }, _this.AUTOCOMPLETE_DELAY);
            }
        });
        // Remove location value when user deletes all text.
        if (inputText === '' && this.state.locationValue !== null) {
            this.setValue(null, false, true);
        }
    };
    LocationBox.prototype.refreshResults = function (inputText) {
        this.setState({ waiting: true });
        this.geocodingData.geocode(inputText, true, this.props.bounds ? this.props.bounds : null, this.props.focus ? this.props.focus : null, this.handleAutocompleteResults);
    };
    // noinspection JSUnusedLocalSymbols
    LocationBox.prototype.handleAutocompleteResults = function (query, results) {
        var _this = this;
        if (query !== this.state.inputText) { // A previous request arrived
            return;
        }
        this.setState({ waiting: false });
        var items = [];
        this.itemToLocationMap = [];
        for (var i in results) {
            if (results.hasOwnProperty(i)) {
                var displayText = LocationBox.itemText(results[i]);
                items.push({ label: displayText });
                this.itemToLocationMap[displayText] = results[i];
            }
        }
        // Next two lines are to reset highlighted item
        this.highlightedItem = null;
        this.setState({
            items: []
        }, function () {
            _this.setState({
                items: items,
            }, function () {
                _this.refreshHighlight();
            });
        });
    };
    LocationBox.prototype.onSelect = function (selectedItem) {
        var locationValue = this.itemToLocationMap[selectedItem];
        this.setValue(locationValue, false, true);
        this.inputRef.blur(); // Lose focus on selection (e.g. user hits enter on highligthed result)
    };
    /**
     * Refreshes location value to reflect item highlighted according to Autocomplete component.
     */
    LocationBox.prototype.refreshHighlight = function () {
        var locationHighlighted = this.getHighlightedLocation();
        if (locationHighlighted !== null // To avoid losing locationValue when user clicks on input
            && locationHighlighted !== this.state.highlightedValue) {
            this.setValue(locationHighlighted, true, true);
        }
    };
    LocationBox.prototype.getHighlightedLocation = function () {
        if (this.state.items.length === 0) {
            return null;
        }
        return this.highlightedItem ? this.itemToLocationMap[this.highlightedItem] : null;
    };
    LocationBox.prototype.fireLocationChange = function (preselect) {
        if (this.props.onChange) {
            this.props.onChange(preselect ? this.state.highlightedValue : this.state.locationValue, preselect);
        }
    };
    LocationBox.prototype.renderInput = function (props) {
        var _this = this;
        return (React.createElement("div", { className: "LocationBox", ref: function (el) { return _this.inputFrameRef = el; } },
            React.createElement("input", __assign({ type: "text" }, props)),
            this.state.waiting ?
                React.createElement(IconSpin, { className: "LocationBox-iconLoading sg-animate-spin", focusable: "false" }) :
                (this.state.inputText ?
                    React.createElement("button", { onClick: this.onClearClicked, className: "LocationBox-btnClear", "aria-hidden": true, tabIndex: -1 },
                        React.createElement(IconRemove, { "aria-hidden": true, className: "LocationBox-iconClear", focusable: "false" })) :
                    "")));
    };
    LocationBox.prototype.onClearClicked = function () {
        var _this = this;
        // focus() must be called after completion of setState() inside setValue()
        this.setValue(null, false, true, function () { return _this.inputRef.focus(); });
    };
    // noinspection JSUnusedLocalSymbols
    LocationBox.prototype.renderMenu = function (items, value, style) {
        if (this.props.sideDropdown) {
            var overlay = React.createElement("div", { children: items, role: "listbox", id: this.getPopupId(), className: "app-style", style: { width: "250px" } });
            return React.createElement(Tooltip, { placement: this.props.inputId === "input-to" ? "right" : "rightTop", overlay: overlay, arrowContent: React.createElement("div", { className: "rc-tooltip-arrow-inner" }), visible: true, overlayClassName: "LocationBox-sideMenu" },
                React.createElement("div", { style: {
                        position: "absolute",
                        top: this.props.inputId === "input-to" ? "15px" : 0,
                        right: "0"
                    } }));
        }
        else {
            return React.createElement("div", { style: __assign({}, style, { position: "absolute", top: "initial", left: "0", width: "100%" }), children: items, className: "LocationBox-menu", role: "listbox", id: this.getPopupId() });
        }
    };
    LocationBox.prototype.renderItem = function (item, isHighlighted) {
        var _this = this;
        if (isHighlighted) {
            this.highlightedItem = item.label;
        }
        return (React.createElement(ResultItem, { id: "item-" + this.state.items.indexOf(item), key: this.state.items.indexOf(item), location: this.itemToLocationMap[item.label], highlighted: isHighlighted, ariaSelected: isHighlighted, onClick: function () { return _this.setValue(_this.itemToLocationMap[item.label], false, true); } }));
    };
    LocationBox.prototype.onKeyDown = function (e) {
        if (e.keyCode === 38 || e.keyCode === 40) {
            setTimeout(this.refreshHighlight, 50);
        }
    };
    LocationBox.prototype.componentWillReceiveProps = function (nextProps) {
        // Don't have to do this check first, but it can help prevent an unneeded render
        if (nextProps.value !== this.state.locationValue) {
            this.setValue(nextProps.value);
        }
    };
    LocationBox.prototype.setFocus = function () {
        if (this.inputRef) {
            this.inputRef.focus();
        }
    };
    LocationBox.prototype.getPopupId = function () {
        return this.props.inputId ? "popup-" + this.props.inputId : undefined;
    };
    LocationBox.prototype.render = function () {
        var _this = this;
        var popupId = this.getPopupId();
        return (React.createElement(Autocomplete, { getItemValue: function (item) { return item.label; }, items: this.state.items, renderInput: this.renderInput, renderMenu: this.renderMenu, renderItem: this.renderItem, value: this.state.inputText, onChange: function (e) {
                _this.onChange(e.target.value);
            }, onSelect: this.onSelect, onMenuVisibilityChange: function (isOpen) {
                if (DeviceUtil.isTablet && !isOpen) {
                    setTimeout(function () {
                        _this.setState({ focus: isOpen });
                    }, 40);
                }
                else {
                    _this.setState({ focus: isOpen });
                }
            }, open: this.state.ddopen(), 
            // open={true}
            inputProps: {
                placeholder: this.props.placeholder,
                onKeyDown: this.onKeyDown,
                onFocus: function () { _this.refreshResults(_this.state.inputText); },
                "aria-activedescendant": this.highlightedItem ? "item-" + this.state.items.map(function (item) { return item.label; }).indexOf(this.highlightedItem) : undefined,
                "aria-label": this.props.inputAriaLabel,
                id: this.props.inputId,
                "aria-owns": this.state.ddopen() ? popupId : undefined,
                "aria-controls": this.state.ddopen() ? popupId : undefined
                // "aria-owns": popupId,
                // "aria-controls": popupId
            }, wrapperStyle: {
                position: "relative"
            }, autoHighlight: false, ref: function (el) { return _this.inputRef = el; }, selectOnBlur: true }));
    };
    LocationBox.defaultProps = {
        resolveCurr: true
    };
    return LocationBox;
}(Component));
export default LocationBox;
//# sourceMappingURL=LocationBox.js.map