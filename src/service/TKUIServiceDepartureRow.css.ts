import genStyles from "../css/GenStyle.css";
import {
    TKUIServiceDepartureRowProps,
    TKUIServiceDepartureRowStyle
} from "./TKUIServiceDepartureRow";
import { black, colorWithOpacity, tKUIColors, TKUITheme } from "../jss/TKUITheme";
import { TKUIStyles } from "../jss/StyleHelper";
import TransportUtil from "../trip/TransportUtil";
import { severityColor } from "../trip/TKUITrackTransport.css";
import { isRemoteIcon } from "../map/TKUIMapLocationIcon.css";
import ServiceDeparture from "../model/service/ServiceDeparture";
import DateTimeUtil from "../util/DateTimeUtil";

export const rowStyle = (theme: TKUITheme) => ({
    padding: '16px',
    '&:hover': {
        backgroundColor: black(5, theme.isDark)
    },
    '&:active': {
        backgroundColor: black(4, theme.isDark)
    }
});

export const rowSelectedStyle = (theme: TKUITheme) => ({
    borderLeft: '4px solid ' + theme.colorPrimary,
    paddingLeft: '12px', // 16px (row padding) - 4px (border width)
    backgroundColor: colorWithOpacity(theme.colorPrimary, .08)
});

// Just use serviceTextColor if serviceColor (background) also comes.
export const serviceTextColor = (service: ServiceDeparture) => (service.serviceTextColor && service.serviceColor) ? service.serviceTextColor.toRGB() : 'white';

export const tKUIServiceDepartureRowDefaultStyle: TKUIStyles<TKUIServiceDepartureRowStyle, TKUIServiceDepartureRowProps> =
    (theme: TKUITheme) => ({
        main: {
            ...genStyles.flex,
            ...genStyles.spaceBetween
        },
        // Parameterize row and rowSelected classes as suggested in https://redmine.buzzhives.com/issues/12629#note-8
        row: rowStyle(theme),
        rowSelected: rowSelectedStyle(theme),
        clickable: {
            cursor: 'pointer'
        },
        leftPanel: {
            ...genStyles.grow,
            /* Needed for genStyles.overflowEllipsis to work for serviceDescription: 50px of transIconPanel + 60px of timeToDepart */
            maxWidth: 'calc(100% - 70px)'
        },
        header: {
            ...genStyles.flex,
            ...genStyles.alignCenter,
            '& > *': {
                marginRight: '4px'
            }
        },
        transIcon: {
            opacity: (props: TKUIServiceDepartureRowProps) => !isRemoteIcon(props.value.modeInfo) ? '.4' : undefined
        },
        serviceNumber: {
            color: (props: TKUIServiceDepartureRowProps) => serviceTextColor(props.value),
            borderRadius: '3px',
            padding: '0 4px',
            backgroundColor: (props: TKUIServiceDepartureRowProps) =>
                TransportUtil.getServiceDepartureColor(props.value),
            ...theme.textSizeCaption,
            lineHeight: '16px'
        },
        time: {
            ...theme.textColorGray,
            marginRight: '10px',
            ...theme.textSizeBody
        },
        timeAndOccupancy: {
            marginTop: '5px',
            ...genStyles.flex,
            ...genStyles.alignCenter
        },
        serviceDescription: {
            ...theme.textSizeCaption,
            ...theme.textColorGray
        },
        cancelled: {
            color: theme.colorError
        },
        delayed: {
            color: (props: TKUIServiceDepartureRowProps) =>
                Math.abs(DateTimeUtil.getRealtimeDiffInMinutes(props.value)) > 5 ? theme.colorError : theme.colorWarning
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
            ...genStyles.alignSelfStart,
            ...genStyles.alignCenter,
            ...genStyles.center,
            ...genStyles.noShrink
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