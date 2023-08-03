import { black, colorWithOpacity, TKUITheme } from "../jss/TKUITheme";
import genStyles from "../css/GenStyle.css";
import { resetStyles } from "../css/ResetStyle.css";

export const tKUISubscriptionDefaultStyle = (theme: TKUITheme) => ({
    main: {
        ...genStyles.flex,
        ...genStyles.column
    },
    header: {
        ...genStyles.flex,
        ...genStyles.alignCenter,
        ...genStyles.spaceBetween
    },
    title: {
        ...theme.textColorGray
    },
    info: {
        ...genStyles.flex,
        ...genStyles.alignCenter
    },
    icon: {
        ...genStyles.flex,
        ...genStyles.center,
        ...genStyles.alignCenter,
        ...genStyles.borderRadius(50, '%'),
        padding: '7px',
        background: colorWithOpacity(theme.colorPrimary, .1),
        '& svg path': {
            fill: theme.colorPrimary
        }
    },
    bundles: {
        ...genStyles.flex,
        ...genStyles.column,
        '&>*:not(:last-child)': {
            ...theme.divider
        }
    },
    subscription: {
        ...resetStyles.button,
        ...genStyles.flex,
        ...genStyles.alignCenter,
        cursor: 'pointer'
    },
    balance: {
        ...theme.textColorGray
    },
    subscriptionName: {
        ...theme.textWeightSemibold
    },
    rightPanel: {
        padding: '16px',
        ...genStyles.flex,
        ...genStyles.column,
        ...genStyles.grow,
        ...genStyles.alignStart
    },
    iconArrow: {
        height: '15px',
        width: '15px',
        '& path': {
            fill: black(1, theme.isDark)
        }
    }
});
