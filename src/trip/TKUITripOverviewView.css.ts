import genStyles from "../css/GenStyle.css";
import { TKUITheme } from "../jss/TKUITheme";

export const tKUITripOverviewViewDefaultStyle = (theme: TKUITheme) => ({
    main: {
        padding: '15px 0',
        '& *': {
            boxSizing: 'border-box'
        }
    },
    actionsPanel: {
        margin: '24px 0 16px',
        ...genStyles.flex,
        ...genStyles.spaceAround,
        ...genStyles.alignStart
    },
    header: {
        ...genStyles.flex,
        ...genStyles.column
    }
});