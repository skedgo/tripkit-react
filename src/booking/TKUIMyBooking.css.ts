import genStyles from "../css/GenStyle.css";
import { black, TKUITheme, white } from "../jss/TKUITheme";

export const tKUIMyBookingDefaultStyle = (theme: TKUITheme) => ({
    main: {
        position: 'relative',
        ...genStyles.flex,
        ...genStyles.column,
        border: '1px solid ' + black(4, theme.isDark),
        margin: '16px',
        ...genStyles.borderRadius(12)
    },
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
        paddingBottom: '10px'
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
    }
});
