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
import { Component, default as React } from "react";
import Autocomplete from 'react-autocomplete';
import "./SchoolPicker.css";
import IconRemove from '-!svg-react-loader!../images/ic-cross.svg';
var SchoolPicker = /** @class */ (function (_super) {
    __extends(SchoolPicker, _super);
    function SchoolPicker(props) {
        var _this = _super.call(this, props) || this;
        _this.renderInput = _this.renderInput.bind(_this);
        _this.onSelect = _this.onSelect.bind(_this);
        _this.onClearClicked = _this.onClearClicked.bind(_this);
        _this.setValue = _this.setValue.bind(_this);
        return _this;
    }
    SchoolPicker.prototype.renderInput = function (props) {
        return (React.createElement("div", { className: "SchoolPicker-inputWrapper" + (this.props.disabled ? " disabled" : "") },
            React.createElement("input", __assign({}, props)),
            React.createElement(IconRemove, { className: "SchoolPicker-iconClear gl-no-shrink" + (!this.props.value ? " gl-hidden" : ""), onClick: this.onClearClicked, focusable: "false" })));
    };
    SchoolPicker.prototype.onClearClicked = function () {
        var _this = this;
        if (!this.props.disabled) {
            // focus() must be called after completion of setState()
            this.setValue('', function () { return _this.inputRef.focus(); });
        }
    };
    SchoolPicker.prototype.onSelect = function (value) {
        this.setValue(value);
        this.inputRef.blur(); // Lose focus on selection (e.g. user hits enter on highligthed result)
    };
    SchoolPicker.prototype.setValue = function (value, callback) {
        if (this.props.onChange) {
            this.props.onChange(value);
        }
        if (callback) {
            callback();
        }
    };
    SchoolPicker.prototype.render = function () {
        var _this = this;
        return (React.createElement(Autocomplete, { getItemValue: function (item) { return item; }, items: this.props.values, shouldItemRender: function (item, value) { return item.toLowerCase().indexOf(value.toLowerCase()) > -1; }, renderInput: this.renderInput, renderItem: function (item, isHighlighted) {
                return React.createElement("div", { style: {
                        background: isHighlighted ? 'lightgray' : 'white',
                        padding: "3px 6px"
                    }, key: item }, item);
            }, value: this.props.value, onChange: function (e) { return _this.setValue(e.target.value); }, onSelect: this.onSelect, inputProps: {
                style: {
                    fontSize: "16px",
                    lineHeight: "30px",
                },
                placeholder: this.props.disabled ? "School services" : "Select your school",
                disabled: this.props.disabled
            }, wrapperStyle: {
                position: "relative"
            }, menuStyle: {
                position: "absolute",
                overflow: "auto",
                maxHeight: "130px",
                width: "100%",
                left: "0",
                top: "36px",
                minWidth: "152px",
                zIndex: 1
            }, ref: function (el) { return _this.inputRef = el; } }));
    };
    return SchoolPicker;
}(Component));
export default SchoolPicker;
//# sourceMappingURL=SchoolPicker.js.map