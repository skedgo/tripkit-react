import {TKUIStyles} from "../jss/StyleHelper";
import {tKUIColors, TKUITheme} from "../jss/TKUITheme";
import {TKUIAlertsViewProps, TKUIAlertsViewStyle} from "./TKUIAlertsView";
import {alertSeverity} from "../model/trip/Segment";
import {severityColor} from "../trip/TKUITrackTransport.css";
import genStyles from "../css/GenStyle.css";

export const tKUIAlertsViewDefaultStyle: TKUIStyles<TKUIAlertsViewStyle, TKUIAlertsViewProps> =
    (theme: TKUITheme) => ({
        main: {
            padding: '30px 15px'
        },
        alert: {
            ...genStyles.flex,
            '&:not(:last-child) $content': {
                borderBottom: '1px solid ' + tKUIColors.black4,
                paddingBottom: '15px',
                marginBottom: '15px'
            }
        },
        alertIcon: {
            color: (props: TKUIAlertsViewProps) => severityColor(alertSeverity(props.alerts), theme),
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