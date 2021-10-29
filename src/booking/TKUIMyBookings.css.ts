import genStyles from "../css/GenStyle.css";
import {TKUITheme} from "../jss/TKUITheme";

export const tKUIMyBookingsDefaultStyle = (theme: TKUITheme) => ({
    main: {

    },
    loadingPanel: {
        ...genStyles.flex,
        ...genStyles.grow,
        ...genStyles.center,
        height: '100%'
    },
    noResults: {
        ...theme.textSizeBody,
        ...theme.textColorDisabled,
        ...genStyles.flex,
        ...genStyles.grow,
        height: '100%',
        ...genStyles.center,
        ...genStyles.alignCenter
    }
});
