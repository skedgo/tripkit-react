import genStyles from "../css/GenStyle.css";
import {black, TKUITheme} from "../jss/TKUITheme";

export const tKUIBookingActionsDefaultStyle = (theme: TKUITheme) => ({
    actions: {
        ...genStyles.flex,
        borderTop: '1px solid ' + black(4, theme.isDark),
        '&>*': {
            ...genStyles.grow,
            padding: '10px!important'
        },
        '&>*:not(:last-child)': {
            borderRight: '1px solid ' + black(4, theme.isDark)
        }
    }
});
