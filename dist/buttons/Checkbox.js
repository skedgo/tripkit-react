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
import "./Checkbox.css";
var Checkbox = /** @class */ (function (_super) {
    __extends(Checkbox, _super);
    function Checkbox() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Checkbox.prototype.render = function () {
        var _this = this;
        return (React.createElement("button", { className: "sg-checkbox-frame" + (this.props.checked ? " checked" : ""), id: this.props.id, onClick: (this.props.onChange) ? function (e) { _this.props.onChange(!_this.props.checked); } : undefined, "aria-labelledby": this.props.ariaLabelledby, role: "checkbox", "aria-checked": this.props.checked, disabled: this.props.disabled },
            React.createElement("div", { className: "sg-checkbox" },
                React.createElement("label", null,
                    React.createElement("span", null,
                        React.createElement("div", null))))));
    };
    return Checkbox;
}(React.Component));
export default Checkbox;
//# sourceMappingURL=Checkbox.js.map