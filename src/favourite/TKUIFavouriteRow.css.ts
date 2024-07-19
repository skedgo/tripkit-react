import genStyles from "../css/GenStyle.css";
import { black, TKUITheme, white } from "../jss/TKUITheme";
import { resetStyles } from "../css/ResetStyle.css";

export const tKUIFavouriteRowDefaultStyle = (theme: TKUITheme) => ({
    main: {
        ...genStyles.flex,
        ...genStyles.alignCenter,
        padding: '10px 15px',
        ...theme.divider,
        background: white(0, theme.isDark),
        '&:hover': {
            background: black(5, theme.isDark)
        }
    },
    pointer: {
        cursor: 'pointer'
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
        cursor: 'pointer',
        '& svg': {
            height: '20px',
            width: '20px'
        }
    },
    dragHandle: {
        ...resetStyles.button,
        ...genStyles.flex,
        ...genStyles.alignSelfStretch,
        ...genStyles.alignCenter,
        padding: '0 10px',
        marginLeft: '-15px',
        cursor: 'pointer'
    },
    confirmRemove: {
        background: theme.colorError,
        color: white()
    }
});