import {TKUIStyles} from "../jss/StyleHelper";
import {tKUIColors, TKUITheme} from "../jss/TKUITheme";
import {severityColor} from "../trip/TKUITrackTransport.css";
import genStyles from "../css/GenStyle.css";
import {TKUIAlertRowProps, TKUIAlertRowStyle} from "./TKUIAlertRow";
import Color from "../model/trip/Color";
import {AlertSeverity} from "../model/service/RealTimeAlert";

export const tKUIAlertRowDefaultStyle: TKUIStyles<TKUIAlertRowStyle, TKUIAlertRowProps> =
    (theme: TKUITheme) => ({
        main: {
            ...genStyles.flex,
            cursor: (props: TKUIAlertRowProps) => props.onClick ? 'pointer' : undefined
        },
        asCard: {
            padding: '8px 12px',
            background: (props: TKUIAlertRowProps) => Color.createFromString(severityColor(props.alert.severity, theme)).toRGB(),
            ...genStyles.borderRadius(12),
            color: (props: TKUIAlertRowProps) => props.alert.severity === AlertSeverity.warning ? 'black' : 'white',
            '&$main': {
                ...genStyles.alignCenter
            },
            '& $alertIcon': {
                color: (props: TKUIAlertRowProps) => props.alert.severity === AlertSeverity.warning ? 'black' : 'white',
                '& path': {
                    stroke: 'none',
                    strokeWidth: '1px',
                    fill: 'currentColor'
                }
            },
            '& a': {
                color: theme.colorPrimary
            }
        },
        alertIcon: {
            color: (props: TKUIAlertRowProps) => severityColor(props.alert.severity, theme),
            height: '24px',
            width: '24px',
            '& path': {
                fill: 'currentColor'
            },
            ...genStyles.noShrink
        },
        content: {
            ...genStyles.flex,
            ...genStyles.column,
            marginLeft: '12px'
        },
        title: {
            fontWeight: 'bold'
        },
        text: {
            marginTop: '12px',
            ...genStyles.fontS
        }
    });