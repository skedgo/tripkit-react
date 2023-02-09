import { black, tKUIColors, TKUITheme } from "../jss/TKUITheme";
import { TKUITrackTransportProps } from "./TKUITrackTransport";
import genStyles from "../css/GenStyle.css";
import { AlertSeverity } from "../model/service/RealTimeAlert";
import { isRemoteIcon } from "../map/TKUIMapLocationIcon.css";

export function severityColor(alertSeverity: AlertSeverity, theme: TKUITheme): string {
    return alertSeverity === AlertSeverity.alert ? theme.colorError :
        alertSeverity === AlertSeverity.warning ? theme.colorWarning : theme.colorInfo;
}

export const tKUITrackTransportDefaultStyle = (theme: TKUITheme) => ({
    main: {
        ...genStyles.flex,
        ...genStyles.alignCenter
    },
    compositeIcon: {
        position: 'relative',
        marginRight: '3px'
    },
    icon: {
        width: '24px!important',
        height: '24px',
        ...theme.isDark && {
            opacity: (props: TKUITrackTransportProps) =>
                (!props.segment.modeInfo || !isRemoteIcon(props.segment.modeInfo)) ? '.8' : undefined
        },
        '&:not(:first-child)': {
            marginLeft: '5px'
        }
    },
    circleWhite: {
        padding: '2px',
        width: '28px',
        height: '28px',
        background: 'white',
        borderRadius: '50%'
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
    realtimeIcon: {
        width: '12px',
        height: '12px',
        '&:not(:first-child)': {
            marginLeft: '2px'
        },
        '& path': {
            fill: black(0, theme.isDark)
        }
    },
    info: {
        fontSize: '13px',
        lineHeight: 'normal',
        ...genStyles.flex,
        ...genStyles.column,
        ...genStyles.alignStart,
        padding: (props: TKUITrackTransportProps) => props.brief === false ? '0 5px' : undefined
    },
    title: {
        maxWidth: '200px',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis'
    },
    subtitle: {
        color: black(1, theme.isDark),
        ...genStyles.flex,
        ...genStyles.center
    }
});