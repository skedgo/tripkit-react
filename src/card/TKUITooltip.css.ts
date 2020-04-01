import {TKUIStyles} from "../jss/StyleHelper";
import {TKUITheme} from "../jss/TKUITheme";
import {TKUITooltipProps, TKUITooltipStyle} from "./TKUITooltip";
import genStyles from "../css/GenStyle.css";

export const tKUITooltipDefaultStyle: TKUIStyles<TKUITooltipStyle, TKUITooltipProps> =
    (theme: TKUITheme) => ({
        main: {
            opacity: '1!important',
            background: 'none!important',
            zIndex: '1100!important',
            // Just to use currentColor below
            color: (props: TKUITooltipProps) => props.arrowColor ? props.arrowColor : 'white',
            '& .rc-tooltip-inner': {
                border: 'none',
                padding: '0 !important',
                maxHeight: '400px',
                ...genStyles.flex,
                background: 'none!important'
            },
            '& .rc-tooltip-inner > *': {
                ...genStyles.grow,
                fontFamily: theme.fontFamily
            },
            '&.rc-tooltip-placement-right .rc-tooltip-arrow': {
                borderRightColor: 'currentColor!important',
                left: '-7px',
                marginTop: '-8px',
                borderWidth: '8px 8px 8px 0'
            },
            '&.rc-tooltip-placement-left .rc-tooltip-arrow': {
                borderLeftColor: 'currentColor!important',
                right: '-8px',
                marginBottom: '-8px',
                borderWidth: '8px 0 8px 8px'
            },
            '&.rc-tooltip-placement-leftBottom .rc-tooltip-arrow': {
                borderLeftColor: 'currentColor!important',
                right: '-8px',
                marginBottom: '-8px',
                borderWidth: '8px 0 8px 8px'
            },
            '&.rc-tooltip-placement-top .rc-tooltip-arrow': {
                borderTopColor: 'currentColor!important',
                bottom: '-8px',
                marginLeft: '-8px',
                borderWidth: '8px 8px 0'
            },
            '&.rc-tooltip-placement-bottom .rc-tooltip-arrow': {
                borderBottomColor: 'currentColor!important',
                top: '-8px',
                marginRight: '-8px',
                borderWidth: '0 8px 8px'
            }
        },
        overlayContent: {
            ...genStyles.flex,
            ...genStyles.grow,
            ...genStyles.alignCenter,
            ...genStyles.fontS,
            ...genStyles.borderRadius(3),
            background: 'white',
            padding: '15px',
            border: 'none',
            boxShadow: '0 0 4px 0 rgba(0,0,0,.2), 0 6px 12px 0 rgba(0,0,0,.08)!important',
            fontFamily: theme.fontFamily
        }
    });