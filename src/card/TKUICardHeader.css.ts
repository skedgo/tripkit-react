import genStyles from "../css/GenStyle.css";
import { black, TKUITheme } from "../jss/TKUITheme";
import { resetStyles } from "../css/ResetStyle.css";
import { TKUICardHeaderProps } from "./TKUICardHeader";

export const tKUICardHeaderJss = (theme: TKUITheme) => ({
    main: {
        padding: (props: TKUICardHeaderProps) => props.noPaddingTop ? '0 12px 10px 16px' : '10px 12px 10px 16px',
        color: black(0, theme.isDark),
        ...genStyles.flex,
        ...genStyles.column
    },
    headerTop: {
        ...genStyles.grow,
        display: 'grid',
        // If renderLeft, split header in 3 columns, the title centered in the middle. Otherwise, just 2 columns, the title left aligned.
        // The title column always take as much width as necessary (`auto` value).
        gridTemplateColumns: props => props.renderLeft ? '1fr auto 1fr' : 'auto auto',
        ...genStyles.alignCenter,
        position: 'relative'
    },
    leftContainer: {
        ...genStyles.flex,
        ...genStyles.justifyStart,
        gridColumn: '1',
    },
    title: {
        ...genStyles.flex,
        ...genStyles.fontL,
        ...theme.textColorDefault,
        gridColumn: props => props.renderLeft ? '2' : '1',
        justifyContent: props => props.renderLeft ? 'center' : 'flex-start'
    },
    rightContainer: {
        ...genStyles.flex,
        ...genStyles.justifyEnd,
        gridColumn: props => props.renderLeft ? '3' : '2',
    },
    btnClear: {
        ...resetStyles.button,
        ...genStyles.noShrink,
        height: '24px',
        width: '24px',
        padding: '6px',
        cursor: 'pointer',
        marginLeft: '16px',
        '& path': {
            fill: black(1, theme.isDark)
        },
        '&:hover path, &:active path': {
            fill: black(0, theme.isDark)
        }
    },
    subtitle: {
        ...genStyles.fontM,
        ...theme.textColorGray
    },
    btnWithText: {
        position: 'absolute',
        left: '0'
    },
    iconClear: {
        width: '100%',
        height: '100%'
    }
});
