import {black, TKUITheme} from "../index";
import genStyles from "../css/GenStyle.css";

export const tKUIMyBookingDefaultStyle = (theme: TKUITheme) => ({
    main: {
        ...genStyles.flex,
        ...genStyles.column,
        border: '1px solid ' + black(4),
        margin: '10px',

    }
});
