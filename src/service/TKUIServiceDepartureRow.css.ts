import genStyles from "../css/GenStyle.css";
import {ITKUIServiceDepartureRowStyle} from "./TKUIServiceDepartureRow";
import ITKUIServiceDepartureRowProps from "./ITKUIServiceDepartureRowProps";
import {DynamicCSSRule, CSSProperties} from "react-jss";
import {tKUIColors, TKUITheme} from "../jss/TKStyleProvider";
import {TKUIStyles} from "../jss/StyleHelper";


export const tKUIServiceDepartureRowDefaultStyle: TKUIStyles<ITKUIServiceDepartureRowStyle, ITKUIServiceDepartureRowProps> =
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
            marginLeft: '4px'
        },
        wheelCIcon: {
            color: tKUIColors.black1,
            marginLeft: '4px',
            width: '16px',
            height: '16px',
            ...genStyles.svgFillCurrColor
        },
        serviceNumber: {
            color: 'white',
            borderRadius: '4px',
            padding: '2px 4px',
            backgroundColor: (props: ITKUIServiceDepartureRowProps) =>
                props.value.serviceColor ? props.value.serviceColor.toHex() : 'lightgray',
            ...genStyles.fontSM
        },
        time: {
            color: tKUIColors.black1,
            marginTop: '5px'
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
        }
    });