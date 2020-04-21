import { TKUIStyles } from "../jss/StyleHelper";
import { TKUITheme } from "../jss/TKUITheme";
import { TKUITrackTransportProps, TKUITrackTransportStyle } from "./TKUITrackTransport";
import { AlertSeverity } from "../model/service/RealTimeAlert";
export declare function severityColor(alertSeverity: AlertSeverity, theme: TKUITheme): string;
export declare const tKUITrackTransportDefaultStyle: TKUIStyles<TKUITrackTransportStyle, TKUITrackTransportProps>;
