import { JsonCustomConvert } from "json2typescript";
import Location from "../Location";
import RealTimeAction from "./RealTimeAction";
export declare enum AlertSeverity {
    alert = 0,
    warning = 1,
    info = 2
}
export declare class AlertSeverityConverter implements JsonCustomConvert<AlertSeverity> {
    serialize(value: AlertSeverity): any;
    deserialize(obj: any): AlertSeverity;
}
declare class RealTimeAlert {
    title: string;
    hashCode: number;
    severity: AlertSeverity;
    text: string | undefined;
    url: string | undefined;
    remoteIcon: string | undefined;
    location: Location | undefined;
    action: RealTimeAction | undefined;
}
export default RealTimeAlert;
