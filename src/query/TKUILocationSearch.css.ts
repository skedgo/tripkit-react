import {TKUIStyles} from "../jss/StyleHelper";
import {TKUILocationSearchProps, TKUILocationSearchStyle} from "./TKUILocationSearch";
import {colorWithOpacity, tKUIColors, TKUITheme} from "../jss/TKUITheme";
import genStyles from "../css/GenStyle.css";
import {resetStyles} from "../css/ResetStyle.css";

export const tKUILocationSearchDefaultStyle: TKUIStyles<TKUILocationSearchStyle, TKUILocationSearchProps> =
    (theme: TKUITheme) => ({
        main: {
            backgroundColor: theme.isLight ? tKUIColors.white : tKUIColors.black,
            boxShadow: '0 0 4px 0 rgba(0,0,0,.2), 0 6px 12px 0 rgba(0,0,0,.08)!important',
            padding: '6px 8px',
            fontFamily: theme.fontFamily,
            ...genStyles.borderRadius(12, "px"),
            ...genStyles.flex,
            ...genStyles.alignCenter,
            '& input[type=text]': {
                ...genStyles.fontMImp
            },
            '& input::placeholder': {
                ...theme.textSizeBody,
                ...theme.textColorDisabled
            }
        },
        sideBarBtn: {
            ...resetStyles.button,
            width: '36px',
            height: '36px',
            padding: '10px',
            ...genStyles.borderRadius(50, "%"),
            '&:hover': {
                backgroundColor: theme.isLight ? tKUIColors.black5 : tKUIColors.white5
            },
            '&:active': {
                backgroundColor: theme.isLight ? tKUIColors.black4 : tKUIColors.white4
            }
        },
        sideBarIcon: {
            width: '100%',
            height: '100%',
            ...genStyles.svgFillCurrColor,
            color: theme.isLight ? tKUIColors.black1 : tKUIColors.white1
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
            left: '-61px',
            position: 'absolute',
            minWidth: '211px',
            ...genStyles.borderRadius(12),
        },
        glassIcon: {
            ...genStyles.svgFillCurrColor,
            color: tKUIColors.black1
        },
        divider: {
            borderLeft: '1px solid ' + tKUIColors.black3,
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