import genStyles from "../css/GenStyle.css";
import { black, colorWithOpacity, TKUITheme } from "../jss/TKUITheme";

export const tKUIProviderTicketsFormDefaultStyle = (theme: TKUITheme) => ({
    main: {
        ...genStyles.flex,
        ...genStyles.column,
        padding: '16px'
    }
});
