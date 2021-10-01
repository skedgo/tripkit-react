import {black, TKUITheme} from "../index";
import genStyles from "../css/GenStyle.css";
import {white} from "../jss/TKUITheme";

export const tKUIMyBookingDefaultStyle = (theme: TKUITheme) => ({
    main: {
        position: 'relative',
        ...genStyles.flex,
        ...genStyles.column,
        border: '1px solid ' + black(4, theme.isDark),
        margin: '16px'
    },
    form: {
        ...genStyles.flex,
        ...genStyles.column,
        '&>*': {
            padding: '16px!important'
        },
        '&>*:not(:last-child)': {
            ...theme.divider
        }
    },
    timeStatus: {
        ...genStyles.flex,
        ...genStyles.alignCenter,
        ...genStyles.spaceBetween
    },
    time: {
        ...genStyles.noShrink
    },
    mode: {
        ...genStyles.flex,
        ...genStyles.alignCenter,
        minWidth: 0,            // This is so this div does not overflow through parents limits, but init's width is
        marginLeft: '20px',     // adjusted to fit, and so overflow ellipsis of child works (https://css-tricks.com/flexbox-truncated-text/).
        '& img': {
            marginLeft: '16px'
        }
    },
    modeName: {
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        marginLeft: '16px'
    },
    loadingPanel: {
        ...genStyles.flex,
        ...genStyles.center,
        ...genStyles.alignCenter,
        height: '100%',
        width: '100%',
        position: 'absolute',
        top: '0',
        background: white(1, theme.isDark)
    },
    iconLoading: {
        margin: '0 5px',
        width: '20px',
        height: '20px',
        color: black(1, theme.isDark),
        ...genStyles.alignSelfCenter,
        ...genStyles.animateSpin,
        ...genStyles.svgFillCurrColor
    },
});
