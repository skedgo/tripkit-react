import {TKUIStyles} from "../jss/StyleHelper";
import {TKUIServiceViewProps, TKUIServiceViewStyle} from "./TKUIServiceView";
import {colorWithOpacity, tKUIColors, TKUITheme} from "../jss/TKUITheme";
import genStyles from "../css/GenStyle.css";
import {severityColor} from "../trip/TKUITrackTransport.css";
import {alertSeverity} from "../model/trip/Segment";

export const tKUIServiceViewDefaultStyle: TKUIStyles<TKUIServiceViewStyle, TKUIServiceViewProps> =
    (theme: TKUITheme) => ({
        main: {
            height: '100%',
            ...genStyles.flex,
            ...genStyles.column
        },
        serviceOverview: {
            ...genStyles.flex,
            ...genStyles.column
        },
        pastStop: {
            '& div': {
                color: tKUIColors.black2
            }
        },
        currStop: {

        },
        currStopMarker: {
            padding: '8px',
            backgroundColor: tKUIColors.white,
            boxShadow: '0 0 4px 0 rgba(0,0,0,.2), 0 6px 12px 0 rgba(0,0,0,.08)!important',
            ...genStyles.borderRadius(50, "%")
        },
        realtimePanel: {
            marginTop: '10px',
            ...genStyles.flex,
            ...genStyles.alignStart
        },
        iconAngleDown: {
            width: '24px',
            height: '24px',
            padding: '7px',
            background: colorWithOpacity(theme.colorPrimary, .12),
            ...genStyles.borderRadius(50, "%"),
            ...genStyles.svgFillCurrColor,
            color: theme.colorPrimary,
            cursor: 'pointer'
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
        },
        actionsPanel: {
            margin: '24px 0 16px',
            ...genStyles.flex,
            ...genStyles.spaceAround
        },
        alertsSummary: {
            marginTop: '8px'
        },
        alertsBrief: {
            color: (props: TKUIServiceViewProps) => severityColor(alertSeverity(props.departure.alerts), theme),
        }
    });