import {black, important, TKUITheme, white} from "../jss/TKUITheme";
import genStyles from "../css/GenStyle.css";
import {tKUIProfileViewDefaultStyle} from "../options/TKUIProfileView.css";

export const tKUIMxMBookingCardDefaultStyle = (theme: TKUITheme) => ({
    main: {
        height: '100%',
        padding: '16px'
    },
    startTime: {
        ...genStyles.fontL,
        marginBottom: '20px'
    },
    form: {
        ...genStyles.flex,
        ...genStyles.column
    },
    group: {
        ...genStyles.flex,
        ...genStyles.alignCenter,
        paddingBottom: '20px',
        marginBottom: '20px',
        // ...theme.divider
    },
    icon: {

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
            border: '1px solid ' + black(4, theme.isDark),
            borderRadius: '12px',
            minHeight: '100px'
        }
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
        margin: '2px 14px 28px 0'
    },
    circle: {
        border: '2px solid ' + theme.colorPrimary,
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
        padding: '0 10px',
        border: '1px solid ' + black(4, theme.isDark),
        borderRadius: '12px',
        '& *': {
            ...theme.textSizeCaption,
            ...theme.textWeightSemibold,
            ...important(theme.textColorDefault)
        },
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
    loadingPanel: {
        ...genStyles.flex,
        ...genStyles.center,
        ...genStyles.alignCenter,
        height: '100%',
        width: '100%',
        position: 'absolute',
        top: '0',
        marginLeft: '-16px',
        background: white(4)
    },
    iconLoading: {
        margin: '0 5px',
        width: '20px',
        height: '20px',
        color: black(1, theme.isDark),
        ...genStyles.alignSelfCenter,
        ...genStyles.animateSpin,
        ...genStyles.svgFillCurrColor
    }

});