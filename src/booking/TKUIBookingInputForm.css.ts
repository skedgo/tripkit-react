import genStyles from "../css/GenStyle.css";
import { black, important, TKUITheme } from "../jss/TKUITheme";

export const tKUIBookingInputFormDefaultStyle = (theme: TKUITheme) => ({
    form: {
        ...genStyles.flex,
        ...genStyles.column,
        '&>*:not(:last-child)': {
            ...theme.divider
        }
    },
    group: {
        ...genStyles.flex,
        ...genStyles.alignStart,
        paddingBottom: '20px',        
        '&:not(:last-child)': {
            marginBottom: '20px'
        }
    },
    link: {
        color: theme.colorPrimary,
        ...theme.textSizeBody,
        marginTop: '5px'
    },
    numberInput: {
        border: '1px solid ' + black(2, theme.isDark),
        padding: '5px',
        borderRadius: '4px',
        minWidth: '46px',
        maxWidth: '60px'
    },
    returnTripInput: {
        ...genStyles.flex,
        ...genStyles.alignCenter,
        ...genStyles.grow,
        '&>*:first-child': {
            ...genStyles.grow
        }
    },
    icon: {
        marginRight: '16px',
        width: '20px',
        height: '20px',
        '& svg': {
            width: '20px',
            height: '20px',
        },
        '& path': {
            fill: theme.colorPrimary
        }
    },
    groupRight: {
        ...genStyles.flex,
        ...genStyles.column,
        ...genStyles.spaceBetween,
        ...genStyles.grow
    },
    label: {
        ...theme.textSizeCaption,
        ...theme.textColorGray,
        ...genStyles.flex,
        ...genStyles.alignCenter
    },
    input: {
        ...genStyles.flex,
        marginTop: '10px',
        '& textarea': {
            ...genStyles.grow,
            background: 'none',
            fontFamily: theme.fontFamily,
            ...theme.textSizeCaption,
            ...theme.textColorDefault,
            border: 'none',
            borderRadius: '12px',
            minHeight: '50px',
            padding: '10px 0'
        }
    },
    value: {
        ...genStyles.flex,
        ...genStyles.column,
        marginTop: '10px'
    },
    optionSelect: {
        borderRadius: '12px',
        '& path': {
            fill: black(0, theme.isDark)
        },
        '&:hover': {
            borderColor: black(2, theme.isDark)
        },
        '&:active': {
            borderColor: black(4, theme.isDark),
            backgroundColor: black(5, theme.isDark)
        }
    },
    selectMenu: {
        marginTop: '2px',
        '& *': {
            ...theme.textSizeCaption,
            ...theme.textWeightSemibold,
            ...important(theme.textColorDefault)
        }
    },
    selectControl: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start'
    },
    selectValueContainer: {
        ...genStyles.alignSelfStretch,
        padding: '2px 0'
    },
    selectSingleValue: {
        marginLeft: '0',
        fontFamily: theme.fontFamily
    },
    selectMultiValue: {
        borderRadius: '4px',
        border: '1px solid ' + black(4),
        background: 'none',
        '&>*:last-child:hover': {
            background: 'none'
        },
        '&>*:last-child svg path': {
            fill: black(1, theme.isDark)
        },
        '&>*:last-child:hover svg path, &>*:last-child:active svg path': {
            fill: black(0, theme.isDark)
        }
    },
});
