import genStyles from "../css/GenStyle.css";
import {black, TKUITheme} from "../jss/TKUITheme";

export const tKUIBookingActionsDefaultStyle = (theme: TKUITheme) => ({
    actions: {
        ...genStyles.flex,
        ...genStyles.wrap,
        borderTop: '1px solid ' + black(4, theme.isDark),
        '&>*': {
            ...genStyles.grow,
            padding: '10px!important',
            borderBottom: `1px solid ${black(4, theme.isDark)}!important`
        },
        '&>*:not(:last-child)': {
            borderRight: '1px solid ' + black(4, theme.isDark)
        }
    }
});
