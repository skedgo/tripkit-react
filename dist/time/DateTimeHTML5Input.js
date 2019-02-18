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
import DateTimeUtil from "../util/DateTimeUtil";
import * as $ from "jquery";
var DateTimeHTML5Input = /** @class */ (function (_super) {
    __extends(DateTimeHTML5Input, _super);
    function DateTimeHTML5Input(props) {
        return _super.call(this, props) || this;
    }
    /**
     * Programmatically open the datepicker.
     * Both focus and click is needed to trigger show of native widget in Chrome for Android.
     * It doesn't work on Firefox for Android.
     */
    DateTimeHTML5Input.prototype.focus = function () {
        if (this.inputRef) {
            this.inputRef.focus();
            $("#query-datetime-picker").trigger("click");
        }
    };
    DateTimeHTML5Input.prototype.render = function () {
        var _this = this;
        return (React.createElement("input", { type: "datetime-local", value: this.props.value.format(DateTimeUtil.HTML5_DATE_TIME_FORMAT), onChange: function () {
                if (_this.inputRef && _this.props.onChange) {
                    _this.props.onChange(DateTimeUtil.moment(_this.inputRef.value));
                }
            }, disabled: this.props.disabled, ref: function (el) { return _this.inputRef = el; }, id: "query-datetime-picker" }));
    };
    return DateTimeHTML5Input;
}(React.Component));
export default DateTimeHTML5Input;
//# sourceMappingURL=DateTimeHTML5Input.js.map