import {black, important, TKUITheme, white} from "../jss/TKUITheme";
import genStyles from "../css/GenStyle.css";

export const tKUIMxMBookingCardDefaultStyle = (theme: TKUITheme) => ({
    bookingFormMain: {
        padding: '16px'
    },
    startTime: {
        ...genStyles.fontL,
        marginBottom: '20px'
    },
    form: {
        ...genStyles.flex,
        ...genStyles.column,
        '&>*': {
            ...theme.divider
        }
    },
    group: {
        ...genStyles.flex,
        ...genStyles.alignCenter,
        paddingBottom: '20px',
        marginBottom: '20px',
        // ...theme.divider
    },
    icon: {
        marginRight: '16px',
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
            fontFamily: theme.fontFamily,
            ...theme.textSizeCaption,
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
    required: {
        ...genStyles.borderRadius(4),
        background: theme.colorError,
        padding: '0 6px',
        marginLeft: '10px',
        color: white(0)
    },
    fromToTrack: {
        ...genStyles.flex,
        ...genStyles.column,
        ...genStyles.alignCenter,
        ...genStyles.alignSelfStretch,
        marginRight: '16px',
        padding: '2px 4px 40px'
    },
    circle: {
        border: '3px solid ' + theme.colorPrimary,
        ...genStyles.borderRadius(50, '%'),
        width: '13px',
        height: '13px'
    },
    line: {
        ...genStyles.grow,
        borderLeft: '1px solid ' + theme.colorPrimary
    },
    optionSelect: {
        minWidth: '200px',
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
    loadingPanel: {
        ...genStyles.flex,
        ...genStyles.center,
        ...genStyles.alignCenter,
        height: '100%',
        width: '100%',
        position: 'absolute',
        top: '0',
        background: white(1)
    },
    iconLoading: {
        margin: '0 5px',
        width: '20px',
        height: '20px',
        color: black(1, theme.isDark),
        ...genStyles.alignSelfCenter,
        ...genStyles.animateSpin,
        ...genStyles.svgFillCurrColor
    },
    status: {
        ...genStyles.flex,
        ...genStyles.column
    },
    statusInfo: {
        background: theme.colorPrimary,
        ...genStyles.flex,
        ...genStyles.column,
        padding: '16px',
        color: white(0)
    },
    statusTitle: {
        ...genStyles.fontL,
        ...theme.textWeightBold,
        marginBottom: '10px'

    },
    statusImg: {
        background: white(0),
        width: '100px!important',
        height: '100px',
        ...genStyles.alignSelfCenter,
        margin: '20px'
    },
    actions: {
        ...genStyles.flex,
        borderTop: '1px solid ' + black(4, theme.isDark),
        borderBottom: '1px solid ' + black(4, theme.isDark),
        '&>*': {
            ...genStyles.grow,
            padding: '10px!important'
        },
        '&>*:not(:last-child)': {
            borderRight: '1px solid ' + black(4, theme.isDark)
        }
    },
    link: {
        color: theme.colorPrimary,
        ...theme.textSizeBody,
        marginTop: '5px'
    }
});