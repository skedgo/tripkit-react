import {TKUIStyles} from "../jss/StyleHelper";
import {TKUILocationSearchProps, TKUILocationSearchStyle} from "./TKUILocationSearch";
import {tKUIColors, TKUITheme} from "../jss/TKUITheme";
import genStyles from "../css/GenStyle.css";
import {resetStyles} from "../css/ResetStyle.css";

export const tKUILocationSearchDefaultStyle: TKUIStyles<TKUILocationSearchStyle, TKUILocationSearchProps> =
    (theme: TKUITheme) => ({
        main: {
            backgroundColor: 'white',
            boxShadow: '0 0 4px 0 rgba(0,0,0,.2), 0 6px 12px 0 rgba(0,0,0,.08)!important',
            padding: '6px 8px',
            ...genStyles.borderRadius(12, "px"),
            ...genStyles.flex,
            ...genStyles.alignCenter,
            '& input[type=text]': {
                ...genStyles.fontMImp
            },
            '& input::placeholder': {
                color: tKUIColors.black2
            }
        },
        sideBarBtn: {
            ...resetStyles.button,
            width: '36px',
            height: '36px',
            padding: '10px',
            ...genStyles.borderRadius(50, "%"),
            '&:hover': {
                backgroundColor: tKUIColors.black5
            },
            '&:active': {
                backgroundColor: tKUIColors.black4
            }
        },
        sideBarIcon: {
            width: '100%',
            height: '100%',
            ...genStyles.svgFillCurrColor,
            color: tKUIColors.black1
        },
        locationBox: {
            ...genStyles.grow,
            marginLeft: '16px'
        },
        locationBoxInput: {
            height: '36px'
        },
        resultsMenu: {
            top: '42px',
            left: '-15px',
            width: '353px'
        },
        glassIcon: {
            margin: '8px',
            height: '20px',
            width: '20px',
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
                backgroundColor: theme.colorPrimaryOpacity(.16)
            },
            '&:active': {
                backgroundColor: theme.colorPrimaryOpacity(.24)
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