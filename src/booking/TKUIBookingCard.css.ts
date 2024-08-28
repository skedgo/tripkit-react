import genStyles from "../css/GenStyle.css";
import { black, TKUITheme, white } from "../jss/TKUITheme";

export const tKUIBookingCardDefaultStyle = (theme: TKUITheme) => ({
    main: {
        ...genStyles.flex,
        ...genStyles.column,
        height: '100%'
    },
    loadingPanel: {
        ...genStyles.flex,
        ...genStyles.grow,
        ...genStyles.center,
        position: 'absolute',
        top: '0',
        backgroundColor: '#ffffffbf',
        height: '100%',
        width: '100%',
        zIndex: 5
    },
    // TODO: delete below   
    form: {
        ...genStyles.flex,
        ...genStyles.column,
        '&>*': {
            padding: '16px!important'
        },
        '&>*:not(:last-child)': {
            ...theme.divider
        }
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
    contentInfo: {
        ...genStyles.flex,
        ...genStyles.column,
        cursor: 'pointer'
    },
    header: {
        ...genStyles.flex,
        ...genStyles.alignCenter,
        ...genStyles.spaceBetween,
        ...theme.divider,
        marginBottom: '10px',
        paddingBottom: '10px',
        cursor: 'pointer'
    },
    status: {
        ...genStyles.alignSelfCenter,
        background: ({ activeTrip }) => {
            const status = activeTrip?.confirmation?.status?.value;
            switch (status) {
                case "ACCEPTED":
                    return theme.colorSuccess;
                case "USER_CANCELED":
                case "PROVIDER_CANCELED":
                    return theme.colorError;
                default:
                    return theme.colorPrimary
            }
        },
        ...genStyles.borderRadius(6),
        color: white(),
        padding: '1px 12px'
    },
    mode: {
        ...genStyles.flex,
        ...genStyles.alignCenter,
        minWidth: 0,            // This is so this div does not overflow through parents limits, but init's width is
        '& *:first-child': {    // adjusted to fit, and so overflow ellipsis of child works (https://css-tricks.com/flexbox-truncated-text/).
            marginRight: '10px'
        }
    },
    modeAndDate: {
        ...genStyles.flex,
        ...genStyles.column
    },
    modeTitle: {

    },
    date: {
        ...theme.textColorGray
    },
    type: {
        ...genStyles.flex,
        ...genStyles.alignCenter,
        ...theme.textColorGray
    },
    iconType: {
        height: '24px',
        width: '24px',
        marginRight: '10px',
        '& path': {
            fill: theme.colorPrimary
        }
    },
    fromTo: {
        cursor: 'pointer'
    }
});
