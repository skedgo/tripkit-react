import {TKUIStyles} from "../jss/StyleHelper";
import {ITKUIServiceViewProps, ITKUIServiceViewStyle} from "./TKUIServiceView";
import {tKUIColors, TKUITheme} from "../jss/TKStyleProvider";
import genStyles from "../css/GenStyle.css";

export const tKUIServiceViewDefaultStyle: TKUIStyles<ITKUIServiceViewStyle, ITKUIServiceViewProps> =
    (theme: TKUITheme) => ({
        main: {
            height: '100%',
            ...genStyles.flex,
            ...genStyles.column
        },
        serviceOverview: {
            margin: '10px 0',
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
            background: theme.colorPrimaryOpacity(.12),
            ...genStyles.borderRadius(50, "%"),
            ...genStyles.svgFillCurrColor,
            color: theme.colorPrimary,
            cursor: 'pointer'
        },
        realtimeInfo: {
            ...genStyles.grow,
            ...genStyles.flex
        },
        realtimeInfoDetailed: {
            ...genStyles.grow,
            '& > *:not(:first-child)': {
                marginTop: '10px'
            },
        },
        wheelchairInfo: {
            color: tKUIColors.black1,
            ...genStyles.fontS,
            ...genStyles.flex,
            ...genStyles.alignCenter,
            '& svg': {
                margin: '0 15px 0 10px'
            }
        },
        wheelCIcon: {
            color: tKUIColors.black1,
            width: '16px',
            height: '16px',
            ...genStyles.svgFillCurrColor
        }
    });