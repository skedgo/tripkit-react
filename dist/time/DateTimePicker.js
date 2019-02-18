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
import DeviceUtil, { BROWSER, OS } from "../util/DeviceUtil";
import DatePicker from 'react-datepicker';
import DateTimeHTML5Input from "./DateTimeHTML5Input";
import DateTimeUtil from "../util/DateTimeUtil";
var DateTimePicker = /** @class */ (function (_super) {
    __extends(DateTimePicker, _super);
    function DateTimePicker(props) {
        var _this = _super.call(this, props) || this;
        _this.changedRaw = false;
        _this.onValueChange = _this.onValueChange.bind(_this);
        return _this;
    }
    DateTimePicker.prototype.setFocus = function () {
        if (this.datePickerRef) { // just if Device.isDesktop
            this.datePickerRef.setOpen(true);
        }
        else if (this.dateTimeHTML5Ref) { // just if !Device.isDesktop
            this.dateTimeHTML5Ref.focus();
        }
    };
    DateTimePicker.prototype.onValueChange = function (value) {
        var onChange = this.props.onChange ? this.props.onChange :
            function () {
            };
        var valueWithTimezone = DateTimeUtil.momentDefaultTZ(value.format(this.props.dateFormat), this.props.dateFormat);
        onChange(valueWithTimezone);
    };
    DateTimePicker.prototype.render = function () {
        var _this = this;
        // react-datepicker is timezone agnostic, and it parses dates in browser local timezone.
        // Switch to browser local timezone while preserving "display" date, so we avoid inconsistencies.
        var displayValue = DateTimeUtil.moment(this.props.value.format(this.props.dateFormat), this.props.dateFormat);
        return (DeviceUtil.isDesktop || (DeviceUtil.os === OS.IOS && DeviceUtil.browser === BROWSER.FIREFOX)) ?
            React.createElement(DatePicker, { selected: displayValue, onChange: function (value) {
                    if (_this.changedRaw) { // Avoid calling onValueChange again if already called by onChangeRaw handler.
                        _this.changedRaw = false;
                        return;
                    }
                    _this.onValueChange(value);
                }, onChangeRaw: function (date) {
                    _this.changedRaw = true;
                    setTimeout(function () { return _this.changedRaw = false; }, 100); // To avoid it to keep true if onChange is not called
                    var moment = DateTimeUtil.momentDefaultTZ(date.target.value, _this.props.dateFormat);
                    if (moment.isValid()) {
                        _this.onValueChange(moment);
                    }
                }, showTimeSelect: true, timeFormat: this.props.timeFormat, dateFormat: this.props.dateFormat, calendarClassName: "QueryInput-calendar", disabled: this.props.disabled, preventOpenOnFocus: true, ref: function (el) { return _this.datePickerRef = el; }, disabledKeyboardNavigation: true }) :
            React.createElement(DateTimeHTML5Input, { value: displayValue, onChange: this.onValueChange, disabled: this.props.disabled, ref: function (el) { return _this.dateTimeHTML5Ref = el; } });
    };
    return DateTimePicker;
}(React.Component));
export default DateTimePicker;
//# sourceMappingURL=DateTimePicker.js.map