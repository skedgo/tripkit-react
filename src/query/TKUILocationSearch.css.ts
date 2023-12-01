import { TKUIStyles } from "../jss/StyleHelper";
import { TKUILocationSearchProps, TKUILocationSearchStyle } from "./TKUILocationSearch";
import { black, colorWithOpacity, TKUITheme } from "../jss/TKUITheme";
import genStyles from "../css/GenStyle.css";
import { resetStyles } from "../css/ResetStyle.css";

export const tKUILocationSearchDefaultStyle: TKUIStyles<TKUILocationSearchStyle, TKUILocationSearchProps> =
    (theme: TKUITheme) => ({
        main: {
            padding: '6px 8px',
            fontFamily: theme.fontFamily,
            ...genStyles.flex,
            ...genStyles.alignCenter,
            '& input[type=text]': {
                ...theme.textSizeBody,
                ...theme.textColorDefault
            },
            '& input::placeholder': {
                ...theme.textSizeBody,
                ...theme.textColorDisabled,
                lineHeight: undefined // Reset lineHeight for placeholder since it displays un-aligned on firefox. Irrelevant for other browsers.
            }
        },
        sideBarBtn: {
            ...resetStyles.button,
            width: '36px',
            height: '36px',
            padding: '10px',
            ...genStyles.borderRadius(50, "%"),
            '&:hover': {
                backgroundColor: black(5, theme.isDark)
            },
            '&:active': {
                backgroundColor: black(4, theme.isDark)
            }
        },
        sideBarIcon: {
            width: '100%',
            height: '100%',
            ...genStyles.svgFillCurrColor,
            color: black(1, theme.isDark)
        },
        locationBox: {
            ...genStyles.grow,
            marginLeft: '16px'
        },
        locationBoxInput: {
            height: '36px'
        },
        resultsMenu: {
            top: '43px',
            position: 'absolute',
            minWidth: '211px',
            borderTopLeftRadius: '12px',
            borderTopRightRadius: '12px'
        },
        glassIcon: {
            ...genStyles.svgFillCurrColor,
            color: black(1, theme.isDark)
        },
        divider: {
            borderLeft: '1px solid ' + black(3, theme.isDark),
            ...genStyles.alignSelfStretch,
            margin: '8px'
        },
        directionsBtn: {
            ...resetStyles.button,
            width: '36px',
            height: '36px',
            ...genStyles.borderRadius(50, "%"),
            '&:hover': {
                backgroundColor: colorWithOpacity(theme.colorPrimary, .16)
            },
            '&:active': {
                backgroundColor: colorWithOpacity(theme.colorPrimary, .24)
            },
            ...genStyles.flex,
            ...genStyles.center,
            ...genStyles.alignCenter
        },
        directionsIcon: {
            ...genStyles.svgFillCurrColor,
            color: theme.colorPrimary
        }
    });