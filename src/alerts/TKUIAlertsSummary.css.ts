import {TKUIStyles} from "../jss/StyleHelper";
import {tKUIColors, TKUITheme} from "../jss/TKUITheme";
import {TKUIAlertsSummaryProps, TKUIAlertsSummaryStyle} from "./TKUIAlertsSummary";
import {severityColor} from "../trip/TKUITrackTransport.css";
import {alertSeverity} from "../model/trip/Segment";
import genStyles from "../css/GenStyle.css";
import Color from "../model/trip/Color";
import {AlertSeverity} from "../model/service/RealTimeAlert";

export const tKUIAlertsSummaryDefaultStyle: TKUIStyles<TKUIAlertsSummaryStyle, TKUIAlertsSummaryProps> =
    (theme: TKUITheme) => ({
        main: {
            padding: '12px 16px',
            border: (props: TKUIAlertsSummaryProps) => '1px solid ' + Color.createFromString(severityColor(AlertSeverity.warning, theme)).toRGBA(.6),
            background: (props: TKUIAlertsSummaryProps) => Color.createFromString(severityColor(AlertSeverity.warning, theme)).toRGBA(.12),
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
        },
        rightArrowIcon: {
            ...genStyles.svgFillCurrColor
        }
    });