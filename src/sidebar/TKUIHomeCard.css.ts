import {TKUITheme} from "../index";
import genStyles from "../css/GenStyle.css";

export const tKUIHomeCardDefaultStyle = (theme: TKUITheme) => ({
    main: {
        padding: '16px'
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
