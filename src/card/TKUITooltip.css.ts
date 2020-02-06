import {TKUIStyles} from "../jss/StyleHelper";
import {TKUITheme} from "../jss/TKUITheme";
import {TKUITooltipProps, TKUITooltipStyle} from "./TKUITooltip";
import genStyles from "../css/GenStyle.css";

export const tKUITooltipDefaultStyle: TKUIStyles<TKUITooltipStyle, TKUITooltipProps> =
    (theme: TKUITheme) => ({
        main: {
            opacity: '1',
            background: 'none!important',
            '& .rc-tooltip-inner': {
                padding: '0 !important',
                maxHeight: '400px',
                ...genStyles.flex,
                background: 'none!important'
            },
            '& .rc-tooltip-inner > *': {
                ...genStyles.grow
            },
            '&.rc-tooltip-placement-right .rc-tooltip-arrow': {
                borderRightColor: 'white!important'
            },
            '&.rc-tooltip-placement-left .rc-tooltip-arrow': {
                borderLeftColor: 'white!important'
            },
            '&.rc-tooltip-placement-top .rc-tooltip-arrow': {
                borderTopColor: 'white!important'
            },
            '&.rc-tooltip-placement-bottom .rc-tooltip-arrow': {
                borderBottomColor: 'white!important'
            },
        }
    });