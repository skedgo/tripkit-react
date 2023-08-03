import genStyles from "../css/GenStyle.css";
import {TKUITheme, black} from "../jss/TKUITheme";

export const tKUIHomeCardDefaultStyle = (theme: TKUITheme) => ({
    main: {
        '&>*': {
            padding: '16px'
        },        
        '&>*:not(:last-child)': {
            borderBottom: '8px solid ' + black(5, theme.isDark),
            paddingBottom: '0'
        }
    },
    activeTrip: {
        ...genStyles.flex,
        ...genStyles.column
    },
    activeTripHeader: {
        ...genStyles.flex,
        ...genStyles.alignCenter,
        ...genStyles.spaceBetween
    },
    activeTripTitle: {
        ...theme.textColorGray
    },
    info: {
        ...genStyles.flex,
        ...genStyles.alignCenter
    }
});
