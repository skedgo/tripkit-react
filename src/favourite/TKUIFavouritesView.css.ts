import genStyles from "../css/GenStyle.css";
import { resetStyles } from "../css/ResetStyle.css";
import { black, TKUITheme } from "../jss/TKUITheme";

export const tKUIFavouritesViewDefaultStyle = (theme: TKUITheme) => ({
    main: {

    },
    subHeader: {
        ...genStyles.flex,
        marginTop: '10px'
    },
    editBtn: {
        padding: '0'
    },
    loadingPanel: {
        ...genStyles.flex,
        ...genStyles.grow,
        ...genStyles.center,
        height: '100%'
    },
    refresh: {
        ...resetStyles.button,
        width: '26px',
        height: '26px',
        padding: '3px',
        border: 'none',
        marginLeft: 'auto',
        marginRight: '-5px',
        '& path': {
            fill: theme.colorPrimary,
            stroke: theme.colorPrimary,
            strokeWidth: '0.5px'
        },
        '&:hover path, &:active path': {
            fill: black(0, theme.isDark)
        }
    }
});