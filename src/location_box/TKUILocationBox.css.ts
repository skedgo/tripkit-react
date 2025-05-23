import { black, TKUITheme } from "../jss/TKUITheme";
import genStyles from "../css/GenStyle.css";
import { resetStyles } from "../css/ResetStyle.css";
import DeviceUtil from "../util/DeviceUtil";

export const tKUILocationBoxDefaultStyle = (theme: TKUITheme) => ({
    main: {
        ...genStyles.flex,
        ...genStyles.alignCenter,
        ...genStyles.grow,
        fontFamily: theme.fontFamily
    },
    input: {
        ...resetStyles.input, /* Style resets */
        fontFamily: 'inherit',   // To inherit from main
        ...theme.textWeightRegular,
        border: 'none!important',
        outline: '0',
        background: 'none',
        ...genStyles.grow,
        margin: 0, /* Safari puts a margin of 2 */
        // TODO: according to design in
        // https://gallery.io/projects/MCHbtQVoQ2HCZfaRajvkOh8D/files/MCEJu8Y2hyDScdIdFBgmhJm0KOkWUeRa6WY it's
        // always fontM (16px).
        ...DeviceUtil.isPhone ? genStyles.fontM : genStyles.fontS,
        lineHeight: '30px',
        color: black(1, theme.isDark),
        ...DeviceUtil.isIE && {
            height: '30px'
        }
    },
    disabled: {
        color: black(1, theme.isDark)
    },
    iconLoading: {
        margin: '0 5px',
        width: '16px',
        height: '16px',
        '& path': {
            fill: black(1, theme.isDark)
        },
        ...genStyles.animateSpin
    },
    btnClear: {
        margin: '0',
        padding: '0',
        height: '17px',
        cursor: 'pointer'
    },
    iconClear: {
        margin: '0 5px',
        width: '17px',
        height: '17px',
        cursor: 'pointer',
        ...genStyles.svgFillCurrColor,
        color: black(1, theme.isDark)
    },
    menu: {
        ...theme.cardBackground,
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
        padding: '5px 0',
        zIndex: '10',
        fontFamily: theme.fontFamily,
        position: "absolute",
        top: "initial",
        left: "0",
        width: "100%",
        overflow: "auto"
    },
    sideMenu: {
        fontFamily: theme.fontFamily,
        '&.rc-tooltip': {
            opacity: 1
        },
        '&.rc-tooltip-placement-rightTop .rc-tooltip-arrow': {
            top: '10px'
        }
    },
    wrapper: {
        position: "relative"
    }
});