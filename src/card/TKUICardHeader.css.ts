import genStyles from "../css/GenStyle.css";
import {black, TKUITheme} from "../jss/TKUITheme";
import {resetStyles} from "../css/ResetStyle.css";
import {TKUICardHeaderProps} from "./TKUICardHeader";

export const tKUICardHeaderJss = (theme: TKUITheme) => ({
    main: {
        padding: (props: TKUICardHeaderProps) => props.noPaddingTop ? '0 12px 10px 16px' : '10px 12px 10px 16px',
        color: black(0, theme.isDark),
        ...genStyles.flex,
        ...genStyles.column
    },
    title: {
        ...genStyles.fontL,
        ...theme.textColorDefault
    },
    subtitle: {
        ...genStyles.fontM,
        ...theme.textColorGray
    },
    headerTop: {
        ...genStyles.flex,
        ...genStyles.grow,
        ...genStyles.spaceBetween,
        ...genStyles.alignCenter
    },
    btnClear: {
        ...resetStyles.button,
        ...genStyles.noShrink,
        height: '24px',
        width: '24px',
        padding: '6px',
        cursor: 'pointer',
        '& svg path': {
            fill: black(1, theme.isDark)
        },
        '&:hover svg path, &:active svg path': {
            fill: black(0, theme.isDark)
        }
    },
    iconClear: {
        width: '100%',
        height: '100%'
    }
});
