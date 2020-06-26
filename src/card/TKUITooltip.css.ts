import {TKUIStyles} from "../jss/StyleHelper";
import {black, TKUITheme, white} from "../jss/TKUITheme";
import {TKUITooltipProps, TKUITooltipStyle} from "./TKUITooltip";
import genStyles from "../css/GenStyle.css";
import {resetStyles} from "../css/ResetStyle.css";

export const tKUITooltipDefaultStyle: TKUIStyles<TKUITooltipStyle, TKUITooltipProps> =
    (theme: TKUITheme) => ({
        main: {
            opacity: '1!important',
            background: 'none!important',
            zIndex: '1100!important',
            maxWidth: '95%',
            // Just to use currentColor below
            color: (props: TKUITooltipProps) => props.arrowColor ? props.arrowColor : white(0, theme.isDark),
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
            background: white(0, theme.isDark),
            color: black(1, theme.isDark),
            padding: '15px',
            border: 'none',
            boxShadow: theme.isLight ? '0 0 4px 0 rgba(0,0,0,.2), 0 6px 12px 0 rgba(0,0,0,.08)!important' :
                '0 0 4px 0 rgba(128, 128, 128,.4), 0 6px 12px 0 rgba(128, 128, 128,.08)!important',
            fontFamily: theme.fontFamily
        },
        btnClear: {
            ...resetStyles.button,
            height: '18px',
            width: '18px',
            padding: '4px',
            cursor: 'pointer',
            marginLeft: '15px',
            ...genStyles.noShrink,
            ...genStyles.alignSelfStart,
            '& svg path': {
                fill: black(1, theme.isDark)
            },
            '&:hover svg path, &:active svg path': {
                fill: black(0, theme.isDark)
            }
        },
        iconClear: {
            width: '100%',
            height: '100%',
        }
    });