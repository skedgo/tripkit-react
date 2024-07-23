import genStyles, { keyFramesStyles } from "../css/GenStyle.css";
import { black, colorWithOpacity, TKUITheme, white } from "../jss/TKUITheme";
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
        background: colorWithOpacity(theme.colorPrimary, .15),
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
    editBtn: {
        ...resetStyles.button,
        cursor: 'pointer',
        '& svg': {
            height: '20px',
            width: '20px',
            '& path': {
                fill: theme.colorPrimary
            }
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
    },
    loadingFav: {
        color: 'transparent',
        background: `linear-gradient(100deg, ${colorWithOpacity(theme.colorPrimary, .10)} 30%, ${colorWithOpacity(theme.colorPrimary, .20)} 50%, ${colorWithOpacity(theme.colorPrimary, .10)} 70%)`,
        backgroundSize: '400%',
        animation: keyFramesStyles.keyframes.loadingFavourite + ' 1.2s ease-in-out infinite',
        height: '100%',
        width: '100%',
        ...genStyles.borderRadius(50, '%')
    },
    '@keyframes loadingFavourite': {
        '0%': {
            backgroundPosition: '100% 50%',
        },
        '100%': {
            backgroundPosition: '0 50%',
        }
    }
});