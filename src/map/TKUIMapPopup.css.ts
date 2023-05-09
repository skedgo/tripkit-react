import { TKUITheme } from "../jss/TKUITheme";
import genStyles from "../css/GenStyle.css";
import { resetStyles } from "../css/ResetStyle.css";

export const tKUIMapPopupStyle = (theme: TKUITheme) => ({
    main: {
        padding: '10px',
        ...genStyles.flex,
        ...genStyles.alignCenter,
        ...genStyles.fontS
    },
    icon: {
        padding: '1px'
    },
    rightPanel: {
        ...genStyles.flex,
        ...genStyles.column,
        marginRight: '12px'
    },
    button: {
        ...resetStyles.button,
        ...genStyles.svgFillCurrColor,
        color: theme.colorPrimary,
        padding: '10px',
        margin: '-10px'
    },
    title: {
        ...genStyles.fontS
    },
    subtitle: {
        ...genStyles.fontSM
    }
});