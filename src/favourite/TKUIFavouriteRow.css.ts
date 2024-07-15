import { TKUIFavouriteRowProps } from "./TKUIFavouriteRow";
import genStyles from "../css/GenStyle.css";
import { black, TKUITheme } from "../jss/TKUITheme";
import { resetStyles } from "../css/ResetStyle.css";

export const tKUIFavouriteRowDefaultStyle = (theme: TKUITheme) => ({
    main: {
        ...genStyles.flex,
        ...genStyles.alignCenter,
        padding: '10px 15px',
        ...theme.divider,
        cursor: (props: TKUIFavouriteRowProps) => props.onClick && 'pointer',
        '&:hover': {
            background: black(5, theme.isDark)
        }
    },
    iconPanel: {
        width: '40px',
        height: '40px',
        ...genStyles.flex,
        ...genStyles.center,
        ...genStyles.alignCenter
    },
    iconBackground: {
        background: 'rgb(235 228 238)',
        borderRadius: '50%',
        '& svg path': {
            fill: theme.colorPrimary
        }
    },
    text: {
        marginLeft: '10px',
        ...genStyles.grow
    },
    removeBtn: {
        ...resetStyles.button,
        '& svg': {
            height: '20px',
            width: '20px'
        }
    }
});