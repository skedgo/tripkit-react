import { black, colorWithOpacity, TKUITheme, white } from "../jss/TKUITheme";
import { resetStyles } from "../css/ResetStyle.css";
import genStyles from "../css/GenStyle.css";

export const tKUIReportBtnDefaultStyle = (theme: TKUITheme) => ({
    main: {
        ...resetStyles.button,
        background: white(0, theme.isDark) + '!important',
        ...genStyles.borderRadius(50, '%'),
        width: '35px',
        height: '35px',
        padding: '6px',
        cursor: 'pointer',
        '& path': {
            fill: black(1, theme.isDark)
        },
        '&>*': {
            maxHeight: '100%',
            maxWidth: '100%'
        }
    },
    actionMenu: {
        background: white(0, theme.isDark),
        padding: '5px',
        boxShadow: theme.isLight ?
            '0 0 4px 0 rgba(0,0,0,.2), 0 6px 12px 0 rgba(0,0,0,.08)' :
            '0 0 4px 0 rgba(255,255,255,.2), 0 6px 12px 0 rgba(255,255,255,.08)',
        ...genStyles.borderRadius(4)
    },
    actionItem: {
        ...genStyles.flex,
        ...genStyles.alignCenter,
        padding: '5px',
        cursor: 'pointer',
        color: black(0, theme.isDark),
        '&:hover': {
            backgroundColor: colorWithOpacity(theme.colorPrimary, .08)
        }
    },
    actionIcon: {
        width: '24px',
        height: '24px',
        ...genStyles.svgFillCurrColor,
        color: black(1, theme.isDark),
        marginRight: '10px'
    }
});