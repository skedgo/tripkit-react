import genStyles from "../css/GenStyle.css";
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
            textTransform: 'initial'
        },
        '& .Mui-selected': {
            color: theme.colorPrimary
        },
        '& .MuiTabs-indicator': {
            backgroundColor: theme.colorPrimary + '!important'
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
        '& > *': {
            border: '1px solid ' + black(4, theme.isDark),
            margin: '16px',
            ...genStyles.borderRadius(12)
        }
    }
});
