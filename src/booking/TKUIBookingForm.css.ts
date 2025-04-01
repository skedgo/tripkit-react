import genStyles from "../css/GenStyle.css";
import { black, important, TKUITheme, white } from "../jss/TKUITheme";

export const tKUIBookingFormDefaultStyle = (theme: TKUITheme) => ({
    main: {
        ...genStyles.flex,
        ...genStyles.column,
        padding: '16px 16px 100px'  // 100px is the height of the floating footer
    },
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
    fromTo: {
        paddingBottom: '20px'
    },
    fromToDetails: {
        padding: '20px 16px 16px'
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
    loadingPanel: {
        ...genStyles.flex,
        ...genStyles.center,
        ...genStyles.alignCenter,
        height: '100%',
        width: '100%',
        position: 'absolute',
        top: '0',
        background: white(1, theme.isDark)
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
        ...genStyles.column,
        ...theme.divider
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
    link: {
        color: theme.colorPrimary,
        ...theme.textSizeBody,
        marginTop: '5px'
    },
    divider: {
        ...theme.divider
    },
    note: {
        ...genStyles.flex,
        ...genStyles.column,
        border: '1px solid ' + black(4),
        padding: '10px',
        ...genStyles.borderRadius(6),
        '&:not(:first-child)': {
            marginTop: '16px'
        }
    },
    noteText: {
        ...theme.divider,
        marginBottom: '5px',
        paddingBottom: '5px'
    },
    noteFooter: {
        ...genStyles.flex,
        ...genStyles.alignCenter,
        ...genStyles.spaceBetween,
        ...theme.textSizeCaption,
        ...theme.textColorGray
    },
    noteProvider: {
        ...genStyles.overflowEllipsis
    },
    noteTime: {
        ...genStyles.noShrink,
        marginLeft: '15px'
    },
    service: {
        ...theme.divider,
        padding: '16px 32px',
        position: 'relative'
    },
    serviceImages: {
        position: 'absolute'
    },
    iconPerson: {
        '& path': {
            fill: theme.colorPrimary
        }
    },
    iconShuttle: {
        position: 'absolute',
        top: '20px',
        left: '38px',
        height: '50px',
        width: '50px',
        background: white(0),
        border: '2px solid' + black(3),
        ...genStyles.borderRadius(50, '%'),
        '& path': {
            fill: theme.colorPrimary
        }
    },
    vehicle: {
        ...genStyles.flex,
        ...genStyles.column,
        ...genStyles.alignEnd,
        '& $title': {
            ...theme.textWeightSemibold
        },
        position: 'relative',   // To display above shuttle / person images
        zIndex: '1'
    },
    title: {
        ...genStyles.overflowEllipsis,
        maxWidth: '100%'
    },
    subtitle: {
        ...theme.textSizeCaption,
        ...theme.textColorGray,
        textDecoration: 'none'
    },
    provider: {
        ...genStyles.flex,
        ...genStyles.column,
        ...genStyles.alignEnd,
        marginTop: '10px',
        position: 'relative',   // To display above shuttle / person images
        zIndex: '1',
        minHeight: '64px'       // To make room for shuttle / person images
    },
    price: {
        ...genStyles.flex,
        ...genStyles.justifyEnd
    },
    separator: {
        height: '8px',
        background: black(5, theme.isDark),
        margin: '0 -16px 20px'
    },
    paySummary: {
        ...genStyles.flex,
        ...genStyles.column,
        '&>*:first-child': {
            ...theme.textColorGray
        },
        '&>*:last-child': {
            ...genStyles.fontL,
            ...theme.textWeightBold
        },
        marginBottom: '20px'
    },
    footer: {
        position: 'absolute',
        bottom: '0',
        left: '0',
        width: '100%',
        padding: '16px',
        ...genStyles.flex,
        ...genStyles.column,
        background: white(0, theme.isDark),
    }
});
