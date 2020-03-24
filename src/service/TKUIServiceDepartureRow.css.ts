import genStyles from "../css/GenStyle.css";
import {
    getRealtimeDiffInMinutes,
    TKUIServiceDepartureRowProps,
    TKUIServiceDepartureRowStyle
} from "./TKUIServiceDepartureRow";
import {DynamicCSSRule, CSSProperties} from "react-jss";
import {tKUIColors, TKUITheme} from "../jss/TKUITheme";
import {TKUIStyles} from "../jss/StyleHelper";
import TransportUtil from "../trip/TransportUtil";
import {severityColor} from "../trip/TKUITrackTransport.css";

export const rowStyle = {
    padding: '16px',
    '&:hover': {
        backgroundColor: tKUIColors.black5
    },
    '&:active': {
        backgroundColor: tKUIColors.black4
    }
};

export const rowSelectedStyle = (theme: TKUITheme) => ({
    borderLeft: '4px solid ' + theme.colorPrimary,
    paddingLeft: '12px', // 16px (row padding) - 4px (border width)
    backgroundColor: theme.colorPrimaryOpacity(.08)
});

export const tKUIServiceDepartureRowDefaultStyle: TKUIStyles<TKUIServiceDepartureRowStyle, TKUIServiceDepartureRowProps> =
    (theme: TKUITheme) => ({
        main: {
            ...genStyles.flex,
            ...genStyles.spaceBetween
        },
        // Parameterize row and rowSelected classes as suggested in https://redmine.buzzhives.com/issues/12629#note-8
        row: rowStyle,
        rowSelected: rowSelectedStyle(theme),
        clickable: {
            cursor: 'pointer'
        },
        leftPanel: {
            ...genStyles.grow,
            /* Needed for gl-overflow-ellipsis to work for serviceDescription: 50px of transIconPanel + 60px of timeToDepart */
            maxWidth: 'calc(100% - 70px)'
        },
        header: {
            ...genStyles.flex,
            ...genStyles.alignCenter,
            '& > *': {
                marginRight: '4px'
            }
        },
        transIcon:{
            opacity: '.4'
        },
        serviceNumber: {
            color: 'white',
            borderRadius: '4px',
            padding: '2px 4px',
            backgroundColor: (props: TKUIServiceDepartureRowProps) =>
                TransportUtil.getServiceDepartureColor(props.value),
            ...genStyles.fontSM
        },
        time: {
            color: tKUIColors.black1,
            marginRight: '10px'
        },
        timeAndOccupancy: {
            marginTop: '5px',
            ...genStyles.flex,
            ...genStyles.alignCenter
        },
        serviceDescription: {
            marginTop: '5px',
            color: tKUIColors.black1,
            ...genStyles.fontS
        },
        cancelled: {
            color: theme.colorError
        },
        delayed: {
            color: (props: TKUIServiceDepartureRowProps) =>
                Math.abs(getRealtimeDiffInMinutes(props.value)) > 5 ? theme.colorError : theme.colorWarning
        },
        onTime: {
            color: theme.colorSuccess
        },
        separatorDot: {
            margin: '0 5px'
        },
        timeToDepart: {
            color: theme.colorSuccess,
            fontWeight: 'bold',
            ...genStyles.flex,
            ...genStyles.alignSelfStart
        },
        timeToDepartCancelled: {
            color: theme.colorError
        },
        timeToDepartPast: {
            opacity: '.5'
        },
        occupancy: {

        },
        trainOccupancy: {
            marginTop: '5px'
        },
        alertIcon: {
            color: (props: TKUIServiceDepartureRowProps) => severityColor(props.value.alertSeverity, theme),
            height: '20px',
            width: '20px',
            '& path': {
                stroke: tKUIColors.white,
                strokeWidth: '1px',
                fill: 'currentColor'
            }
        }
    });