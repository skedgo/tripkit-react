import genStyles from "../css/GenStyle.css";
import { black, colorWithOpacity, TKUITheme } from "../jss/TKUITheme";

export const tKUIBookingProviderOptionsDefaultStyle = (theme: TKUITheme) => ({
    main: {
        ...genStyles.flex,
        ...genStyles.column,
        padding: '16px',
        height: '100%'
    },
    body: {
        ...genStyles.flex,
        ...genStyles.column,
        ...genStyles.grow,
        height: '1px',
        overflowY: 'auto'
    },
    footer: {
        marginTop: '20px',
        display: 'flex',
        ...genStyles.justifyEnd
    },
    title: {
        ...theme.textColorGray,
        ...theme.textWeightSemibold,
        marginBottom: '24px',
        ...theme.divider,
        paddingBottom: '20px'
    },
    available: {
        ...genStyles.flex,
        ...genStyles.column
    },
    option: {
        paddingBottom: '20px',
        cursor: 'pointer',
        '&:not(:last-child)': {
            ...theme.divider,
            marginBottom: '20px'
        },
        ...genStyles.flex,
        ...genStyles.spaceBetween,
        ...genStyles.alignCenter
    },
    optionTitle: {
        ...genStyles.fontM,
        fontWeight: 'bold'
    },
    priceRange: {
        background: colorWithOpacity(theme.colorPrimary, .2),
        color: theme.colorPrimary,
        borderRadius: '20px',
        padding: '8px 16px'
    },
    unavailable: {
        ...genStyles.flex,
        ...genStyles.column
    },
    unavailableOption: {
        paddingBottom: '20px',
        '&:not(:last-child)': {
            ...theme.divider,
            marginBottom: '20px'
        },
        ...genStyles.flex,
        ...genStyles.column
    },
    uOptionTitle: {
        ...theme.textColorDisabled,
        marginBottom: '12px',
        ...genStyles.fontM,
        fontWeight: 'bold'
    },
    warningMessage: {
        ...genStyles.flex,
        ...genStyles.alignCenter,
        '& svg': {
            width: '20px',
            height: '20px',
            marginRight: '10px',
            ...genStyles.noShrink
        },
        '& path': {
            fill: theme.colorError
        }
    },
    separator: {
        height: '8px',
        background: black(5, theme.isDark),
        margin: '0 -16px 20px'
    }

});
