import {TKUIStyles} from "../jss/StyleHelper";
import {TKUITKUITripPlannerProps, TKUITKUITripPlannerStyle} from "./TKUITripPlanner";
import TKUIResponsiveUtil from "../util/TKUIResponsiveUtil";
import {TKUITheme} from "../jss/TKUITheme";
import genStyles from "../css/GenStyle.css";

export const tKUITripPlannerDefaultStyle: TKUIStyles<TKUITKUITripPlannerStyle, TKUITKUITripPlannerProps> =
    (theme: TKUITheme) => ({
        main: {
            // ['@media (max-width: ' + TKUIResponsiveUtil.getPortraitWidth() + 'px)']: {
            //     minHeight: '236px'
            // }
            ...genStyles.flex,
            width: '100%',
            ['@media (min-width: ' + (TKUIResponsiveUtil.getPortraitWidth() + 1) + 'px)']: {
                height: '100%',
                overflowY: 'hidden!important'
            }
        },
        queryPanel: {
            position: 'absolute',
            width: '450px',
            top: '10px',
            left: '10px',
            ['@media (min-width: ' + (TKUIResponsiveUtil.getPortraitWidth() + 1) + 'px)']: {
                width: '450px',
                left: '10px',
                zIndex: '1005' // above card modal container
            },
            ['@media (max-width: ' + TKUIResponsiveUtil.getPortraitWidth() + 'px)']: {
                width: '100%',
                top: '0',
                left: '0',
                padding: '5px 5px 0 5px',
                zIndex: '1001' // below card modal container
            }
        },
        mapMain: {
            position: 'relative',
            overflowY: 'hidden!important',
            ...genStyles.flex,
            ...genStyles.grow,
            ...genStyles.column
        },
        reportBtn: {
            position: 'absolute',
            right: '12px',
            bottom: '80px',
            width: '30px',
            height: '30px',
            opacity: '.5',
            cursor: 'pointer',
            zIndex: '1000'
        },
        reportTooltipClassName: {
            '& .rc-tooltip-inner': {
                ...genStyles.flex,
                alignItems: 'center',
                WebkitAlignItems: 'center',
                fontFamily: "Open Sans', sans-serif",
                fontSize: '13px'
            }
        }
    });