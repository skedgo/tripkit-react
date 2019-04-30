import ModeInfo from "../model/trip/ModeInfo";
import TripGoApi from "../api/TripGoApi";
import ModeIdentifier from "../model/region/ModeIdentifier";
import Constants from "../util/Constants";
import Trip from "../model/trip/Trip";
import Segment from "../model/trip/Segment";

class TransportUtil {

    public static getTransportIcon(modeInfo: ModeInfo, isRealtime = false, onDark = false): string {
        if (modeInfo.identifier && modeInfo.identifier.includes(ModeIdentifier.SCHOOLBUS_ID)) {  // TODO: Hardcoded for TC
            return this.getTransportIconLocal("school-bus", isRealtime, false);
        }
        if (onDark && modeInfo.remoteDarkIcon) {
            return TripGoApi.getServer() + "/modeicons/" + "icon-mode-" + modeInfo.remoteDarkIcon + ".svg";
        }
        if (modeInfo.remoteIcon) {
            return TripGoApi.getServer() + "/modeicons/" + "icon-mode-" + modeInfo.remoteIcon + ".svg";
        }
        return this.getTransportIconLocal(modeInfo.localIcon, isRealtime, onDark);
    }

    public static getTransportIconModeId(modeIdentifier: ModeIdentifier, isRealtime = false, onDark = false): string {
        if (modeIdentifier.icon !== null
            && !modeIdentifier.identifier.startsWith(ModeIdentifier.SCHOOLBUS_ID)) { // TODO: Hardcoded for TC
            return TripGoApi.getServer() + "/modeicons/" + "icon-mode-" + modeIdentifier.icon + ".svg";
        }
        return this.getTransportIconLocal(this.modeIdToIconS(modeIdentifier.identifier), isRealtime, onDark);
    }

    public static getTransportIconLocal(iconS: string, isRealtime = false, onDark = false): string {
        return Constants.absUrl("/images/modeicons/") + (onDark ? "ondark/" : "") +
            "ic-" + iconS + (isRealtime ? "-realtime" : "") + "-24px.svg";
    }

    public static getTransportColor(modeInfo: ModeInfo): string | null {
        // return this.getTransportColorByIconS(modeInfo.localIcon);
        if (modeInfo !== null && modeInfo.identifier && modeInfo.identifier.startsWith("pt_pub") && modeInfo.color) {
            return modeInfo.color.toRGB();
        }
        return this.getTransportColorByIconS(modeInfo.identifier && modeInfo.identifier.includes(ModeIdentifier.SCHOOLBUS_ID) ?
            "school-bus" : modeInfo.localIcon); // TODO: hardcoded for TC
    }

    public static getTransportColorByIconS(iconS: string): string | null {
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
    }

    public static modeIdToIconS(modeId: string): string {
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
    }

    public static distanceToBriefString(distInMetres: number): string {
        if (distInMetres < 50) {
            return distInMetres + " m";
        }
        if (distInMetres < 1000) {
            return Math.floor(distInMetres/50) * 50 + " m";
        }
        return (distInMetres/1000).toFixed(1) + " km";
    }

    public static getRepresentativeColor(trip: Trip): string | null {
        const representativeSegment = this.getRepresentativeSegment(trip);
        const representativeColor = representativeSegment !== null &&
        representativeSegment.modeInfo ? TransportUtil.getTransportColor(representativeSegment.modeInfo) : "black";
        return representativeColor !== null ? representativeColor : "black";
    }

    private static getRepresentativeSegment(trip: Trip): Segment | null {
        let representativeSegment = null;
        for (const segment of trip.segments) {
            if (segment.isSchoolbus()) {
                representativeSegment = segment;
                break;
            }
            if (representativeSegment === null || segment.getDuration() > representativeSegment.getDuration()) {
                representativeSegment = segment;
            }
        }
        return representativeSegment;
    }
}

export default TransportUtil;