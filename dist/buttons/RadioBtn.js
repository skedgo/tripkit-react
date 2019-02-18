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
import "./RadioBtn.css";
var RadioBtn = /** @class */ (function (_super) {
    __extends(RadioBtn, _super);
    function RadioBtn() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    RadioBtn.prototype.render = function () {
        var _this = this;
        return (React.createElement("button", { className: "sg-radio-frame" + (this.props.checked ? " checked" : ""), id: this.props.id, onClick: (this.props.onChange) ? function (e) { _this.props.onChange(!_this.props.checked); } : undefined, "aria-labelledby": this.props.ariaLabelledby, "aria-checked": this.props.checked },
            React.createElement("div", { className: "sg-radio" },
                React.createElement("input", { type: 'radio', name: this.props.name, checked: this.props.checked, 
                    // onChange={(this.props.onChange) ? (e: any) => { this.props.onChange!(!this.props.checked) } : undefined}
                    readOnly: true, style: { display: "none" } }),
                React.createElement("label", null,
                    React.createElement("span", null)))));
    };
    return RadioBtn;
}(React.Component));
export default RadioBtn;
//# sourceMappingURL=RadioBtn.js.map