import {TKUIStyles} from "../jss/StyleHelper";
import {tKUIColors, TKUITheme} from "../jss/TKUITheme";
import {IStyleRelevantProps, ITKUITripSergmentStepsStyle} from "./TripSegmentSteps";
import genStyles from "../css/GenStyle.css";

export const tKUITripSergmentStepsDefaultStyle: TKUIStyles<ITKUITripSergmentStepsStyle, IStyleRelevantProps> =
    (theme: TKUITheme) => ({
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
            color: tKUIColors.black1,
            margin: '12px 16px',
            ...genStyles.fontM,
            ...genStyles.flex,
            ...genStyles.noShrink,
            ...genStyles.justifyEnd,
            ...genStyles.alignCenter
        },
        rightLabel: {
            margin: '12px 16px',
            color: tKUIColors.black,
            ...genStyles.fontM
        },
        linePanel: {
            backgroundColor: (props: IStyleRelevantProps) => props.borderColor,
            width: '16px',
            ...genStyles.flex,
            ...genStyles.column,
            ...genStyles.center,
            ...genStyles.alignCenter,
            ...genStyles.noShrink
        },
        line: {
            ...genStyles.grow
        },
        linePanelFirst: {
            borderTopLeftRadius: '8px',
            borderTopRightRadius: '8px',
            marginTop: '14px',
            '& div:first-child': {
                display: 'none'
            }
        },
        linePanelLast: {
            borderBottomLeftRadius: '8px',
            borderBottomRightRadius: '8px',
            marginBottom: '14px',
            '& div:last-child': {
                display: 'none'
            }
        },
        circle: {
           backgroundColor: tKUIColors.white1,
            ...genStyles.borderRadius(50, '%'),
            width: '8px',
            height: '8px',
            margin: '5px'
        },
        circleFirstLast: {
            backgroundColor: tKUIColors.white
        },
        iconPanel: {
            margin: '10px 0',
            ...genStyles.noShrink
        },
        iconAngleDown: {
            height: '10px',
            width: '10px',
            marginLeft: '10px'
        }
    });