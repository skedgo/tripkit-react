import ModeInfo from "../model/trip/ModeInfo";
import ModeIdentifier from "../model/region/ModeIdentifier";
import Trip from "../model/trip/Trip";
import ServiceDeparture from "../model/service/ServiceDeparture";
declare class TransportUtil {
    static getTransportIcon(modeInfo: ModeInfo, isRealtime?: boolean, onDark?: boolean): string;
    static getTransportIconModeId(modeIdentifier: ModeIdentifier, isRealtime?: boolean, onDark?: boolean): string;
    static getTransportIconLocal(iconS: string, isRealtime?: boolean, onDark?: boolean): string;
    static getTransportColor(modeInfo: ModeInfo): string | null;
    static getServiceDepartureColor(departure: ServiceDeparture): string;
    static getTransportColorByIconS(iconS: string): string | null;
    static modeIdToIconS(modeId: string): string;
    static distanceToBriefString(distInMetres: number): string;
    static getRepresentativeColor(trip: Trip): string | null;
    private static getRepresentativeSegment;
    static isCycle(modeId: string): boolean;
}
export default TransportUtil;
