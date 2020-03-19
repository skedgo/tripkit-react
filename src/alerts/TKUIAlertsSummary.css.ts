import {TKUIStyles} from "../jss/StyleHelper";
import {tKUIColors, TKUITheme} from "../jss/TKUITheme";
import {TKUIAlertsSummaryProps, TKUIAlertsSummaryStyle} from "./TKUIAlertsSummary";
import {severityColor} from "../trip/TKUITrackTransport.css";
import {alertSeverity} from "../model/trip/Segment";
import genStyles from "../css/GenStyle.css";

export const tKUIAlertsSummaryDefaultStyle: TKUIStyles<TKUIAlertsSummaryStyle, TKUIAlertsSummaryProps> =
    (theme: TKUITheme) => ({
        main: {
            padding: '8px 12px',
            border: '1px solid ' + theme.colorWarningOpacity(.6),
            background: theme.colorWarningOpacity(.12),
            ...genStyles.borderRadius(12)
        },
        header: {
            ...genStyles.flex,
            ...genStyles.alignCenter,
            cursor: 'pointer'
        },
        alertIcon: {
            color: (props: TKUIAlertsSummaryProps) => severityColor(alertSeverity(props.alerts), theme),
            height: '24px',
            width: '24px',
            '& path': {
                stroke: tKUIColors.white,
                strokeWidth: '1px',
                fill: 'currentColor'
            }
        },
        numOfAlerts: {
            fontWeight: 'bold',
            ...genStyles.grow,
            marginLeft: '12px'
        },
        alertTitle: {
            borderTop: '1px solid ' + tKUIColors.black4,
            marginTop: '8px',
            paddingTop: '8px'
        }
    });