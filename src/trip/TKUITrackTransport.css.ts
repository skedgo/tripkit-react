import {TKUIStyles} from "../jss/StyleHelper";
import {tKUIColors, TKUITheme} from "../jss/TKUITheme";
import {TKUITrackTransportProps, TKUITrackTransportStyle} from "./TKUITrackTransport";
import genStyles from "../css/GenStyle.css";
import {AlertSeverity} from "../model/service/RealTimeAlert";

export function severityColor(alertSeverity: AlertSeverity, theme: TKUITheme): string {
    return alertSeverity === AlertSeverity.alert ? theme.colorError :
        alertSeverity === AlertSeverity.warning ? theme.colorWarning : theme.colorInfo;
}

export const tKUITrackTransportDefaultStyle: TKUIStyles<TKUITrackTransportStyle, TKUITrackTransportProps> =
    (theme: TKUITheme) => ({
        main: {
            ...genStyles.flex,
            ...genStyles.alignCenter
        },
        compositeIcon: {
            position: 'relative'
        },
        icon: {
            width: '24px',
            height: '24px',
            marginRight: '3px'
        },
        alertIcon: {
            color: (props: TKUITrackTransportProps) => severityColor(props.segment.alertSeverity, theme),
            position: 'absolute',
            height: '16px',
            width: '16px',
            bottom: '5px',
            left: '0',
            '& path': {
                stroke: tKUIColors.white,
                strokeWidth: '1px',
                fill: 'currentColor'
            }
        },
        info: {
            fontSize: '13px',
            ...genStyles.flex,
            ...genStyles.column,
            ...genStyles.alignStart,
            padding: (props: TKUITrackTransportProps) => props.brief === false ? '0 5px' : undefined
        },
        subtitle: {
            color: tKUIColors.black1
        }
    });