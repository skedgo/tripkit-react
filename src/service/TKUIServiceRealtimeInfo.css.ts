import {black, colorWithOpacity, TKUITheme} from "../jss/TKUITheme";
import {alertSeverity} from "../model/trip/Segment";
import {severityColor} from "../trip/TKUITrackTransport.css";
import genStyles from "../css/GenStyle.css";
import {resetStyles} from "../css/ResetStyle.css";
import {TKUIServiceRealtimeInfoProps} from "./TKUIServiceRealtimeInfo";

export const tKUIServiceRealtimeInfoDefaultStyle = (theme: TKUITheme) => ({
    main: {
        marginTop: '10px',
        ...genStyles.flex,
        ...genStyles.alignStart
    },
    iconAngleDown: {
        ...resetStyles.button,
        width: '24px',
        height: '24px',
        padding: '7px',
        background: colorWithOpacity(theme.colorPrimary, .12),
        ...genStyles.borderRadius(50, "%"),
        ...genStyles.svgFillCurrColor,
        color: theme.colorPrimary,
        cursor: 'pointer',
        '& svg': {
            width: '100%',
            height: '100%'
        }
    },
    alertsSummary: {
        marginTop: '8px'
    },
    alertsBrief: {
        color: (props: TKUIServiceRealtimeInfoProps) => props.alerts ? severityColor(alertSeverity(props.alerts), theme) : black(0),
    },
    realtimeInfo: {
        ...genStyles.grow,
        ...genStyles.flex,
        '&>*': {
            marginRight: '10px'
        }
    },
    realtimeInfoDetailed: {
        ...genStyles.grow,
        '& > *:not(:first-child)': {
            marginTop: '10px'
        },
    }
});