import genStyles from "../css/GenStyle.css";
import { black, TKUITheme } from "../jss/TKUITheme";
import { resetStyles } from "../css/ResetStyle.css";

export const tKUIPagerControlJss = (theme: TKUITheme) => ({
    main: {
        ...genStyles.flex,
        ...genStyles.alignCenter
    },
    arrowBtn: {
        ...resetStyles.button,
        padding: '16px',
        '& path': {
            fill: black(0, theme.isDark)
        },
        '&:hover path': {        
            fill: black(1, theme.isDark)
        },
        '&:disabled path': {
            fill: black(2, theme.isDark)
        },
        '&:first-child': {
            marginRight: 'auto'
        },
        '&:last-child': {
            marginLeft: 'auto'
        },
        '&:first-child svg': {
            transform: 'rotate(180deg)'
        }
    }
});
