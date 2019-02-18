import TripGoApi from "../api/TripGoApi";
import ModeIdentifier from "../model/region/ModeIdentifier";
import Constants from "../util/Constants";
var TransportUtil = /** @class */ (function () {
    function TransportUtil() {
    }
    TransportUtil.getTransportIcon = function (modeInfo, isRealtime, onDark) {
        if (isRealtime === void 0) { isRealtime = false; }
        if (onDark === void 0) { onDark = false; }
        if (modeInfo.identifier && modeInfo.identifier.includes(ModeIdentifier.SCHOOLBUS_ID)) { // TODO: Hardcoded for TC
            return this.getTransportIconLocal("school-bus", isRealtime, false);
        }
        if (onDark && modeInfo.remoteDarkIcon) {
            return TripGoApi.getServer() + "/modeicons/" + "icon-mode-" + modeInfo.remoteDarkIcon + ".svg";
        }
        if (modeInfo.remoteIcon) {
            return TripGoApi.getServer() + "/modeicons/" + "icon-mode-" + modeInfo.remoteIcon + ".svg";
        }
        return this.getTransportIconLocal(modeInfo.localIcon, isRealtime, onDark);
    };
    TransportUtil.getTransportIconModeId = function (modeIdentifier, isRealtime, onDark) {
        if (isRealtime === void 0) { isRealtime = false; }
        if (onDark === void 0) { onDark = false; }
        if (modeIdentifier.icon !== null
            && !modeIdentifier.identifier.startsWith(ModeIdentifier.SCHOOLBUS_ID)) { // TODO: Hardcoded for TC
            return TripGoApi.getServer() + "/modeicons/" + "icon-mode-" + modeIdentifier.icon + ".svg";
        }
        return this.getTransportIconLocal(this.modeIdToIconS(modeIdentifier.identifier), isRealtime, onDark);
    };
    TransportUtil.getTransportIconLocal = function (iconS, isRealtime, onDark) {
        if (isRealtime === void 0) { isRealtime = false; }
        if (onDark === void 0) { onDark = false; }
        return Constants.absUrl("/images/modeicons/") + (onDark ? "ondark/" : "") +
            "ic-" + iconS + (isRealtime ? "-realtime" : "") + "-24px.svg";
    };
    TransportUtil.getTransportColor = function (modeInfo) {
        // return this.getTransportColorByIconS(modeInfo.localIcon);
        if (modeInfo !== null && modeInfo.identifier && modeInfo.identifier.startsWith("pt_pub") && modeInfo.color) {
            return modeInfo.color.toRGB();
        }
        return this.getTransportColorByIconS(modeInfo.identifier && modeInfo.identifier.includes(ModeIdentifier.SCHOOLBUS_ID) ?
            "school-bus" : modeInfo.localIcon); // TODO: hardcoded for TC
    };
    TransportUtil.getTransportColorByIconS = function (iconS) {
        switch (iconS) {
            case "bus":
            case "publicTransport":
                // return "#025da8";
                return "#0042ac";
            case "train":
            case "lightRail":
            case "tram":
                // return "#d0212f";
                return "#bd0021";
            case "bicycle":
            case "bicycle-share":
                return "#592e84";
            case "school-bus":
                return "#f0cb01";
            case "taxi":
            case "uber":
            case "car-ride-share":
            case "car-share":
                return "#0c9588";
            case "parking":
                return "#ed8e01";
            default:
                return null;
        }
    };
    TransportUtil.modeIdToIconS = function (modeId) {
        if (modeId.startsWith("pt_pub_bus")) {
            return "bus";
        }
        if (modeId.startsWith("pt_pub_train")) {
            return "train";
        }
        if (modeId.startsWith("pt_pub_lightRail") || modeId.startsWith("pt_pub_tram")) {
            return "lightRail";
        }
        if (modeId.startsWith("pt_pub")) {
            return "publicTransport";
        }
        if (modeId.startsWith(ModeIdentifier.SCHOOLBUS_ID)) {
            return "school-bus";
        }
        if (modeId.startsWith("cy_bic-s")) {
            return "bicycle-share";
        }
        if (modeId.startsWith("cy_bic")) {
            return "bicycle";
        }
        if (modeId.startsWith("wa_wal")) {
            return "walk";
        }
        if (modeId.startsWith("ps_tax")) {
            return "taxi";
        }
        if (modeId.startsWith("ps_tnc_UBER")) {
            return "car-share";
        }
        if (modeId.startsWith("me_car-r")) {
            return "car-share";
        }
        return "wait";
    };
    TransportUtil.distanceToBriefString = function (distInMetres) {
        if (distInMetres < 50) {
            return distInMetres + " m";
        }
        if (distInMetres < 1000) {
            return Math.floor(distInMetres / 50) * 50 + " m";
        }
        return (distInMetres / 1000).toFixed(1) + " km";
    };
    TransportUtil.getRepresentativeColor = function (trip) {
        var representativeSegment = this.getRepresentativeSegment(trip);
        var representativeColor = representativeSegment !== null &&
            representativeSegment.modeInfo !== null ? TransportUtil.getTransportColor(representativeSegment.modeInfo) : "black";
        return representativeColor !== null ? representativeColor : "black";
    };
    TransportUtil.getRepresentativeSegment = function (trip) {
        var representativeSegment = null;
        for (var _i = 0, _a = trip.segments; _i < _a.length; _i++) {
            var segment = _a[_i];
            if (segment.isSchoolbus()) {
                representativeSegment = segment;
                break;
            }
            if (representativeSegment === null || segment.getDuration() > representativeSegment.getDuration()) {
                representativeSegment = segment;
            }
        }
        return representativeSegment;
    };
    return TransportUtil;
}());
export default TransportUtil;
//# sourceMappingURL=TransportUtil.js.map