import {tKUIColors, TKUITheme, white} from "../jss/TKUITheme";
import {TKUIServiceStepsProps} from "./TKUIServiceSteps";
import genStyles from "../css/GenStyle.css";

export const tKUIServiceStepsDefaultStyle = (theme: TKUITheme) => ({
    step: {
        ...genStyles.flex,
        '&:first-child': {

        }
    },
    stepClickable: {
        cursor: 'pointer'
    },
    leftLabel: {
        width: '55px',
        margin: '12px 16px',
        ...theme.textSizeCaption,
        ...theme.textColorGray,
        ...genStyles.flex,
        ...genStyles.noShrink,
        ...genStyles.justifyEnd,
        ...genStyles.alignCenter
    },
    rightLabel: {
        margin: '12px 16px',
        ...theme.textSizeBody,
        ...theme.textColorDefault
    },
    linePanel: {
        ...genStyles.flex,
        ...genStyles.column,
        ...genStyles.center,
        ...genStyles.alignCenter,
        ...genStyles.noShrink
    },
    line: {
        ...genStyles.grow,
        width: '16px',
        backgroundColor: (props: TKUIServiceStepsProps) => props.serviceColor,
        opacity: '0',
        '&$travelled': {
            opacity: '1'
        },
        '&$untravelled': {
            opacity: '.5'
        }
    },
    circle: {
        backgroundColor: white(0),
        ...genStyles.borderRadius(50, '%'),
        width: '16px',
        height: '16px',
        margin: '-8px 0',
        zIndex: 1,
        '& div': {
            ...genStyles.borderRadius(50, '%'),
            border: (props: TKUIServiceStepsProps) => '4px solid ' + props.serviceColor,
            width: '100%',
            height: '100%'
        },
        '&$untravelled div': {
            opacity: '.5'
        },
    },
    travelled: {

    },
    untravelled: {

    },
    iconPanel: {
        margin: '10px 0',
        ...genStyles.noShrink
    },
    iconAngleDown: {
        height: '10px',
        width: '10px',
        marginLeft: '10px'
    },
    iconAngleRotate: {
        ...genStyles.rotate180
    },
    toggle: {
        ...genStyles.flex
    },

    toggleButton: {
        ...genStyles.link
    }
});