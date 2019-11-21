import genStyles from "../css/GenStyle.css";
import {TKUIServiceDepartureRowProps, TKUIServiceDepartureRowStyle} from "./TKUIServiceDepartureRow";
import {DynamicCSSRule, CSSProperties} from "react-jss";
import {tKUIColors, TKUITheme} from "../jss/TKUITheme";
import {TKUIStyles} from "../jss/StyleHelper";


export const tKUIServiceDepartureRowDefaultStyle: TKUIStyles<TKUIServiceDepartureRowStyle, TKUIServiceDepartureRowProps> =
    (theme: TKUITheme) => ({
        main: {
            ...genStyles.flex,
            ...genStyles.spaceBetween
        },
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
            ...genStyles.alignCenter
        },
        transIcon:{
            opacity: '.4',
            margin: '0 4px'
        },
        serviceNumber: {
            color: 'white',
            borderRadius: '4px',
            padding: '2px 4px',
            backgroundColor: (props: TKUIServiceDepartureRowProps) =>
                props.value.serviceColor ? props.value.serviceColor.toHex() : 'lightgray',
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
        delayed: {
            color: theme.colorError
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

        }
    });