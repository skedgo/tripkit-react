import genStyles from "../css/GenStyle.css";
import { resetStyles } from "../css/ResetStyle.css";
import { TKUITheme, black } from "../jss/TKUITheme";

export const tKUIMyBookingsDefaultStyle = (theme: TKUITheme) => ({
    main: {
        ...genStyles.flex,
        ...genStyles.column,
        height: '100%'
    },
    tabs: {
        '& .MuiTabs-root': {
            borderBottom: '1px solid ' + black(4)
        },
        '& .MuiTabs-flexContainer': {
            justifyContent: 'space-around'
        },
        '& .MuiTab-root': {
            textTransform: 'initial',
            ...theme.textColorGray
        },
        '& .Mui-selected': {
            color: theme.colorPrimary + '!important'
        },
        '& .MuiTabs-indicator': {
            backgroundColor: theme.colorPrimary + '!important'
        },
        '& .MuiTabs-indicator:disabled': {
            opacity: '.5'
        }
    },
    loadingPanel: {
        ...genStyles.flex,
        ...genStyles.grow,
        ...genStyles.center,
        height: '100%'
    },
    noResults: {
        ...theme.textSizeBody,
        ...theme.textColorDisabled,
        ...genStyles.flex,
        ...genStyles.grow,
        height: '100%',
        ...genStyles.center,
        ...genStyles.alignCenter
    },
    results: {
        ...genStyles.scrollableY,
        '& > $bookingWrapper': {
            border: '1px solid ' + black(4, theme.isDark),
            margin: '16px',
            ...genStyles.borderRadius(12)
        }
    },
    bookingWrapper: {

    },
    loadingMore: {
        ...genStyles.flex,
        ...genStyles.center,
        marginBottom: '15px'
    },
    refresh: {
        ...resetStyles.button,
        width: '24px',
        height: '24px',
        padding: '2px',
        border: 'none',
        marginRight: '8px',
        marginTop: '2px',
        '& path': {
            fill: black(1, theme.isDark),
            stroke: black(1, theme.isDark),
            strokeWidth: '0.5px'
        },
        '&:hover path, &:active path': {
            fill: black(0, theme.isDark)
        }
    },
    loggedOutMsg: {
        ...genStyles.flex,
        ...genStyles.column,
        margin: '24px 16px'
    },
    loggedOutTitle: {
        ...theme.textWeightBold,
        fontSize: '18px',
        marginBottom: '10px'
    },
    faded: {
        opacity: 0.5
    }
});
