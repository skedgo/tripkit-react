import {TKUIStyles} from "../jss/StyleHelper";
import {
    TKUITransportSwitchesViewProps,
    TKUITransportSwitchesViewStyle
} from "./TKUITransportSwitchesView";
import genStyles from "../css/GenStyle.css";
import {resetStyles} from "../css/ResetStyle.css";
import {black, TKUITheme, white} from "../jss/TKUITheme";
import DeviceUtil from "../util/DeviceUtil";

export const tKUITransportSwitchesViewDefaultStyle: TKUIStyles<TKUITransportSwitchesViewStyle, TKUITransportSwitchesViewProps> =
    (theme: TKUITheme) => ({
        main: {
            padding: '10px',
            backgroundColor: theme.isLight ? '#f5f6f7' : '#384450',
            maxWidth: '275px',
            fontFamily: theme.fontFamily,
            ...genStyles.flex,
            ...genStyles.column,
            ...genStyles.alignStart
        },
        modeSelector: {
            ...genStyles.flex,
            ...genStyles.wrap,
            ...DeviceUtil.isIE && {
                maxWidth: '270px'   // Need this since flex-wrap is not supported on IE (or set display: block on main)
            }
        },
        modeIcon: {
            ...resetStyles.button,
            background: white(0, theme.isDark),
            padding: '7px',
            margin: '10px',
            ...genStyles.borderRadius(50, "%"),
            ...genStyles.flex,
            '& img': {
                width: '24px',
                height: '24px'
            }
        },
        modeIconDisabled: {
            opacity: '.3'
        },
        tooltip: {
            fontFamily: theme.fontFamily,
            '& .rc-tooltip-arrow': {
                display: 'none'
            }
        },
        tooltipContent: {
            background: white(0, theme.isDark),
            padding: '8px 24px 8px 16px',
            boxShadow: '0 0 4px 0 rgba(0,0,0,.2), 0 6px 12px 0 rgba(0,0,0,.08)!important',
            ...genStyles.borderRadius(25),
            ...genStyles.flex,
            ...genStyles.alignCenter,
            '& img': {
                width: '24px',
                height: '24px'
            }
        },
        tooltipDisabled: {
            '& img': {
                opacity: .3
            }
        },
        tooltipRight: {
            marginLeft: '16px',
            ...genStyles.flex,
            ...genStyles.column
        },
        tooltipTitle: {
            color: black(1, theme.isDark),
            fontWeight: 'bold'
        },
        tooltipStateEnabled: {
            color: theme.colorSuccess
        },
        tooltipStateDisabled: {
            color: theme.colorError
        }
    });