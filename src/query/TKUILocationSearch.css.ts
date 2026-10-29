import { black, colorWithOpacity, TKUITheme } from "../jss/TKUITheme";
import genStyles from "../css/GenStyle.css";
import { resetStyles } from "../css/ResetStyle.css";

export const tKUILocationSearchDefaultStyle = (theme: TKUITheme) => ({
    main: {
        padding: '6px 8px',
        fontFamily: theme.fontFamily,
        display: 'grid',
        gridTemplateColumns: 'min-content 1fr min-content min-content',
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
    withCallToAction: {
        gridRowGap: '8px',
        '& $callToAction': {
            gridArea: '1/2/2/5'
        },
        '& $locationBoxContainer': {
            gridArea: '2/1/3/3',
            background: black(6, theme.isDark),
            borderRadius: '46px'
        },
        '& $divider': {
            gridArea: '2/3/3/4',
            display: 'none'
        },
        '& $directionsBtn': {
            gridArea: '2/4/3/5',
            marginLeft: '8px',
            background: theme.colorPrimary,
            '& svg': {
                color: 'white'
            },
            '&:hover': {
                backgroundColor: colorWithOpacity(theme.colorPrimary, .6)
            },
        },
        '& $glassIcon': {
            marginRight: '8px'
        }
    },
    sideBarBtn: {
        ...resetStyles.button,
        flexShrink: 0,
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
    locationBoxContainer: {},
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
    },
    callToAction: {
        display: 'flex',
        alignItems: 'center',
        ...genStyles.fontL,
        lineHeight: '1.5rem',
        ...theme.textWeightSemibold,
        padding: '6px'
    }
});