import {TKUIStyles} from "../jss/StyleHelper";
import {tKUIColors, TKUITheme} from "../jss/TKUITheme";
import {severityColor} from "../trip/TKUITrackTransport.css";
import genStyles from "../css/GenStyle.css";
import {TKUIAlertRowProps, TKUIAlertRowStyle} from "./TKUIAlertRow";
import Color from "../model/trip/Color";

export const tKUIAlertRowDefaultStyle: TKUIStyles<TKUIAlertRowStyle, TKUIAlertRowProps> =
    (theme: TKUITheme) => ({
        main: {
            ...genStyles.flex,
            cursor: (props: TKUIAlertRowProps) => props.onClick ? 'pointer' : undefined
        },
        asCard: {
            padding: '8px 12px',
            border: (props: TKUIAlertRowProps) => '1px solid ' + Color.createFromString(severityColor(props.alert.severity, theme)).toRGBA(.6),
            background: (props: TKUIAlertRowProps) => Color.createFromString(severityColor(props.alert.severity, theme)).toRGBA(.12),
            ...genStyles.borderRadius(12),
            '&$main': {
                ...genStyles.alignCenter
            }
        },
        alertIcon: {
            color: (props: TKUIAlertRowProps) => severityColor(props.alert.severity, theme),
            height: '24px',
            width: '24px',
            '& path': {
                stroke: tKUIColors.white,
                strokeWidth: '1px',
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