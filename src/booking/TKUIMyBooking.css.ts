import {black, TKUITheme} from "../index";
import genStyles from "../css/GenStyle.css";

export const tKUIMyBookingDefaultStyle = (theme: TKUITheme) => ({
    main: {
        ...genStyles.flex,
        ...genStyles.column,
        border: '1px solid ' + black(4, theme.isDark),
        margin: '16px',
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
    }
});
