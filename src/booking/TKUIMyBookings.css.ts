import {TKUITheme} from "../index";
import genStyles from "../css/GenStyle.css";

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
