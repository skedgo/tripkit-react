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
import IconInfo from "-!svg-react-loader!../images/ic-info.svg";
import "./TPlannerDisclaimer.css";
import GATracker from "../analytics/GATracker";
var TPlannerDisclaimer = /** @class */ (function (_super) {
    __extends(TPlannerDisclaimer, _super);
    function TPlannerDisclaimer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TPlannerDisclaimer.prototype.render = function () {
        var onClick = function () {
            GATracker.instance.send('link', 'click', 'jp feedback');
        };
        return (React.createElement("div", { className: "TPlannerDisclaimer-infoPanel gl-flex" + (this.props.className ? " " + this.props.className : "") },
            React.createElement(IconInfo, { className: "gl-charSpace gl-no-shrink", "aria-hidden": true, focusable: "false" }),
            React.createElement("div", { className: "TPlannerDisclaimer-disclaimer" },
                "Trip planning is based on timetabled services. Check real time services ",
                React.createElement("a", { href: TPlannerDisclaimer.REALTIME_URL, target: "_blank", "aria-label": "Trip planning is based on timetabled services. Check real time services here" }, "here"),
                " and service disruptions ",
                React.createElement("a", { href: TPlannerDisclaimer.DISRUPTIONS_URL, target: "_blank", "aria-label": "Check service disruptions here" }, "here"),
                ". ",
                React.createElement("a", { "aria-label": "Feedback", target: "_blank", onClick: onClick, href: TPlannerDisclaimer.FEEDBACK_URL }, "Feedback"),
                this.props.attribution &&
                    React.createElement(React.Fragment, null,
                        React.createElement("br", null),
                        "Powered by ",
                        React.createElement("a", { "aria-label": "Powered by TripGo", target: "_blank", href: TPlannerDisclaimer.TRIPGO_URL }, "TripGo")))));
    };
    TPlannerDisclaimer.REALTIME_URL = "http://www.nxtbus.act.gov.au/#/liveDepartures";
    TPlannerDisclaimer.DISRUPTIONS_URL = "https://www.transport.act.gov.au/news/service-alerts-and-updates";
    TPlannerDisclaimer.FEEDBACK_URL = "https://accesscanberra--tst.custhelp.com/app/forms/transport_feedback";
    TPlannerDisclaimer.TRIPGO_URL = "https://skedgo.com/tripgo/";
    return TPlannerDisclaimer;
}(React.Component));
export default TPlannerDisclaimer;
//# sourceMappingURL=TPlannerDisclaimer.js.map