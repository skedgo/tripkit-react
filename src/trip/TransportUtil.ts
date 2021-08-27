import ModeInfo from "../model/trip/ModeInfo";
import TripGoApi from "../api/TripGoApi";
import ModeIdentifier from "../model/region/ModeIdentifier";
import Constants from "../util/Constants";
import Trip from "../model/trip/Trip";
import Segment from "../model/trip/Segment";
import ServiceDeparture from "../model/service/ServiceDeparture";

class TransportUtil {

    /**
     *
     * @param {ModeInfo} modeInfo
     * @param {boolean} isRealtime
     * @param {boolean} onDark
     * @param {boolean} remoteOverOnDark indicates we prefer the remote icon, even if it doesn't match onDark requirement.
     * @returns {string}
     */
    public static getTransportIcon(modeInfo: ModeInfo, isRealtime = false, onDark = false, remoteOverOnDark = true): string {
        return this.getTransIcon(modeInfo, {isRealtime, onDark, remoteOverOnDark});
    }

    public static getTransIcon(modeInfo: ModeInfo,
                               options: {
                                   isRealtime?: boolean;
                                   onDark?: boolean;
                                   useLocal?: boolean;
                                   remoteOverOnDark?: boolean;
                               } = {}): string {
        const isRealtime = options.isRealtime !== undefined ? options.isRealtime : false;
        const onDark = options.onDark !== undefined ? options.onDark : false;
        const useLocal = options.useLocal ? options.useLocal : false;
        const remoteOverOnDark = options.remoteOverOnDark !== undefined ? options.remoteOverOnDark : true;

        if (useLocal) {
            return this.getTransportIconLocal(modeInfo.localIcon, isRealtime, onDark);
        }

        const iconRemote = this.getTransportIconRemote(modeInfo, onDark);
        if (iconRemote) {
            return iconRemote;
        }
        // No remote icon satisfying onDark requierement / preference
        if (remoteOverOnDark) { // If remote is a priority over onDark, return a remote icon anyway, if there's one.
            const iconRemoteInverted = this.getTransportIconRemote(modeInfo, !onDark);
            if (iconRemoteInverted) { // If not, then there's no remote icon.
                return iconRemoteInverted;
            }
        }
        return this.getTransportIconLocal(modeInfo.localIcon, isRealtime, onDark);
    }

    public static getTransportIconRemote(modeInfo: ModeInfo, onDark = false): string | undefined {
        if (!onDark && modeInfo.remoteIcon) {
            return TripGoApi.getServer() + "/modeicons/icon-mode-" + modeInfo.remoteIcon + ".svg";
        }
        if (onDark && modeInfo.remoteDarkIcon) {
            return TripGoApi.getServer() + "/modeicons/icon-mode-" + modeInfo.remoteDarkIcon + ".svg";
        }
        return undefined;
    }

    public static getTransportIconModeId(modeIdentifier: ModeIdentifier, isRealtime = false, onDark = false): string {
        if (modeIdentifier.icon !== null
            && !modeIdentifier.identifier.startsWith(ModeIdentifier.SCHOOLBUS_ID)) { // TODO: Hardcoded for TC
            return TripGoApi.getServer() + "/modeicons/icon-mode-" + modeIdentifier.icon + ".svg";
        }
        return this.getTransportIconLocal(this.modeIdToIconS(modeIdentifier.identifier), isRealtime, onDark);
    }

    public static getTransportIconLocal(iconS: string, isRealtime = false, onDark = false): string {
        return Constants.absUrl("/images/modeicons/") + (onDark ? "ondark/" : "") +
            "ic-" + iconS + (isRealtime ? "-realtime" : "") + "-24px.svg";
    }

    public static getTransportColor(modeInfo: ModeInfo): string | null {
        if (modeInfo !== null && modeInfo.identifier && modeInfo.color) {
            return modeInfo.color.toRGB();
        }
        return this.getTransportColorByIconS(modeInfo.localIcon);
    }

    public static getServiceDepartureColor(departure: ServiceDeparture): string {
        return departure.serviceColor ? departure.serviceColor.toRGB() :
            (this.getTransportColor(departure.modeInfo) || "black");
    }

    public static getTransportColorByIconS(iconS: string): string | null {
        switch (iconS) {
            case "bus":
            case "publicTransport":
                // return "#025da8";
                return "#0042ac";
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
        if (modeId.startsWith("pt_pub_ferry")) {
            return "ferry";
        }
        if (modeId.startsWith("pt_pub")) {
            return "publicTransport";
        }
        if (modeId.startsWith("ps_shu")) {
            return "shuttle";
        }
        if (modeId.startsWith("ps_drt")) {
            return "car-ride-share";
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
        if (modeId.startsWith("wa_whe")) {
            return "wheelchair";
        }
        if (modeId.startsWith("ps_tax")) {
            return "taxi";
        }
        if (modeId.startsWith("ps_tnc")) {
            return "rideShare";
        }
        if (modeId.startsWith("me_car-r") || modeId.startsWith("me_car-s")) {
            return "car-share";
        }
        if (modeId.startsWith("me_car")) {
            return "car";
        }
        if (modeId.startsWith("me_mot")) {
            return "motorbike";
        }
        if (modeId.startsWith("in_air")) {
            return "plane";
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
        let representativeSegment: Segment | null = null;
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

    public static isCycle(modeId: string) {
        return modeId.startsWith("cy_bic");
    }
}

export default TransportUtil;