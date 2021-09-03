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
    mode: {
        ...genStyles.flex,
        ...genStyles.alignCenter,
        '& img': {
            marginLeft: '10px'
        }
    }
});
