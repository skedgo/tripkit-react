import {black, TKUITheme} from "../jss/TKUITheme";
import genStyles from "../css/GenStyle.css";
import {resetStyles} from "../css/ResetStyle.css";
import {DeviceUtil, genStylesJSS} from "../index";

export const tKUIShareViewDefaultStyle = (theme: TKUITheme) => ({
    main: {
        fontFamily: theme.fontFamily,
        padding: '15px',
        ...genStyles.flex,
        ...genStyles.column,
        '& *': {
            fontFamily: theme.fontFamily
        }
    },
    qrSharePanel: {
        color: theme.colorPrimary,
        ...genStyles.flex,
        ...genStyles.column,
        ...genStyles.alignCenter,
        '& > *': {
            marginTop: '15px'
        }
    },
    qrLabel: {
        textAlign: 'center'
    },
    qrCode: {
        height: '128px',
        width: '128px',
        '& canvas': {
            background: 'white',    // Place over white background, this is for dark mode.
            padding: '5px'
        }
    },
    copyLinkPanel: {
        ...genStyles.flex,
        ...genStyles.alignCenter
    },
    linkBox: {
        ...resetStyles.input,
        border: '1px solid ' + black(1, theme.isDark),
        height: '30px',
        padding: '0 5px',
        ...genStyles.borderRadius(5),
        ...DeviceUtil.isPhone ? genStylesJSS.fontM : genStylesJSS.fontS,
        ...genStyles.grow,
        color: black(0, theme.isDark)
    },
    linkIcon: {
        width: '20px',
        height: '20px',
        marginLeft: '10px',
        cursor: 'pointer'
    },
    separation: {
        paddingBottom: '30px',
        borderBottom: '1px solid lightgray',
        marginBottom: '30px'
    },
    loadingPanel: {
        ...genStyles.flex,
        ...genStyles.center,
        ...genStyles.alignCenter,
        height: '100%'
    },
    iconLoading: {
        margin: '0 5px',
        width: '20px',
        height: '20px',
        color: black(1, theme.isDark),
        ...genStyles.animateSpin,
        ...genStyles.svgFillCurrColor
    }
});