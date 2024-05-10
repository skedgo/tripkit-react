import ModeInfo from "../model/trip/ModeInfo";
import TripGoApi from "../api/TripGoApi";
import ModeIdentifier from "../model/region/ModeIdentifier";
import Constants from "../util/Constants";
import Trip from "../model/trip/Trip";
import Segment from "../model/trip/Segment";
import ServiceDeparture from "../model/service/ServiceDeparture";
import { i18n } from "../i18n/TKI18nConstants";

class TransportUtil {

    public static remoteIconResourcesBaseUrl?: string;

    /**
     * @param {ModeInfo} modeInfo
     * @param options     
     * @returns {string}
     */
    public static getTransIcon(modeInfo: ModeInfo,
        options: {
            /**
             * @deprecated realtime icon is displayed separately. Fix this to false.
             */
            isRealtime?: boolean;
            onDark?: boolean;
            useLocal?: boolean;
        } = {}): string {
        const isRealtime = false;
        const onDark = options.onDark !== undefined ? options.onDark : false;
        const useLocal = options.useLocal ? options.useLocal : false;

        if (useLocal) {
            return this.getTransportIconLocal(modeInfo.localIcon, isRealtime, onDark);
        }
        const iconRemote = this.getTransportIconRemote(modeInfo);
        if (iconRemote) {
            return iconRemote;
        }
        return this.getTransportIconLocal(modeInfo.localIcon, isRealtime, onDark);
    }

    public static getTransportIconRemote(modeInfo: ModeInfo): string | undefined {
        if (modeInfo.remoteIcon) {
            return `${this.remoteIconResourcesBaseUrl ?? (TripGoApi.getServer() + "/modeicons/")}icon-mode-${modeInfo.remoteIcon}.svg`;
        }
        return undefined;
    }

    public static getTransportIconModeId(modeIdentifier: ModeIdentifier, isRealtime = false, onDark = false): string {
        if (modeIdentifier.icon !== null
            && !modeIdentifier.identifier.startsWith(ModeIdentifier.SCHOOLBUS_ID)) { // TODO: Hardcoded for TC
            return `${this.remoteIconResourcesBaseUrl ?? (TripGoApi.getServer() + "/modeicons/")}icon-mode-${modeIdentifier.icon}.svg`;
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
                return "#00b463";
            case "train":
                return "#6665b3";
            case "lightRail":
                return "#e99d48";
            case "tram":
                return "#e99d48";
            case "coach":
                return "#599efc";
            case "bicycle":
            case "bicycle-share":
                return "#592e84";
            case "school-bus":
                return "#00b463";
            case "taxi":
            case "uber":
            case "car-ride-share":
            case "car-share":
                return "#0c9588";
            case "parking":
                return "#418bee"
            case "water-fountain":
                return "#418bee"
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
        if (modeId.startsWith("pt_pub_lightRail")) {
            return "lightRail";
        }
        if (modeId.startsWith("pt_pub_subway")) {
            return "subway";
        }
        if (modeId.startsWith("pt_pub_tram")) {
            return "tram";
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
            return "shuttle";
        }
        if (modeId.startsWith(ModeIdentifier.SCHOOLBUS_ID)) {
            return "school-bus";
        }
        if (modeId.startsWith("cy_bic-s")) {
            return "bicycle-share";
        }
        if (modeId.startsWith("me_mic-s")) {
            return "shared-micromobility";
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
        if (i18n.distanceUnit() === "imperial") {
            const distInFeet = distInMetres * 3.28084;
            if (distInFeet < 100) {  // a quarter of a mile
                return Math.floor(distInFeet) + " ft";
            }
            const feetsInMile = 5280;
            if (distInFeet < feetsInMile / 4) {
                return Math.floor(distInFeet / 50) * 50 + " ft";
            }
            let milesFraction = Math.floor((distInFeet % feetsInMile) / (feetsInMile / 4));
            let miles = Math.floor(distInFeet / feetsInMile);
            if (milesFraction === 4) {
                milesFraction = 0;
                miles++;
            }
            const singular = miles === 1 && milesFraction === 0;
            return (miles !== 0 ? miles + " " : "") +
                ((milesFraction === 1 || milesFraction === 3) ? milesFraction + "/4 " :
                    milesFraction === 2 ? "1/2 " : "") + (singular ? "mile" : "miles");
        } else {
            if (distInMetres < 50) {
                return distInMetres + " m";
            }
            if (distInMetres < 1000) {
                return Math.floor(distInMetres / 50) * 50 + " m";
            }
            return (distInMetres / 1000).toFixed(1) + " km";
        }
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

    public static isSubMode(mode1: string, mode2: string) {
        return mode2.split("_").every((m2part, i) => m2part === mode1.split("_")[i]);
    }

    public static bucketMatchesTrip(bucket: string[], trip: Trip): boolean {
        const tripModes = trip.segments.map(segment => segment.modeInfo?.identifier ?? segment.modeIdentifier)
            .filter(mode => mode && (mode !== "wa_wal" || trip.isWalkTrip()) && (mode !== "wa_whe" || trip.isWheelchairTrip()));  // remove undefined / nulls, and wa_wal mode except for walk-only trips, since wa_wal is in all trips.        
        return bucket.some(bmode => tripModes.some(mode => TransportUtil.isSubMode(mode!, bmode)));
    }

    /**
    * Returns the index of the priority bucket capturing the mode, or priorityBuckets.length() if there is no such bucket.
    * @param mode 
    * @param priorityBuckets 
    */
    public static matchingBucketIndex(trip: Trip, priorityBuckets: string[][]): number {
        // Find the index of the first priority bucket containing some mode (bmode) that captures some of the trip modes (mode)
        const matchingBucket = priorityBuckets.findIndex(bucket => this.bucketMatchesTrip(bucket, trip));
        return matchingBucket !== -1 ? matchingBucket : priorityBuckets.length;
    }

    public static priorityBucketsTripCompareFcBuilder = (modePriorities: string[][]) =>
        (t1: Trip, t2: Trip) => {
            const bucketT1 = TransportUtil.matchingBucketIndex(t1, modePriorities);
            const bucketT2 = TransportUtil.matchingBucketIndex(t2, modePriorities);
            return bucketT1 === bucketT2 ? t1.weightedScore - t2.weightedScore : bucketT1 - bucketT2;
        }

}

export default TransportUtil;