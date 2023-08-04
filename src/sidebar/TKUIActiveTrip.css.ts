import { colorWithOpacity, TKUITheme, white } from "../jss/TKUITheme";
import genStyles from "../css/GenStyle.css";

export const tKUIActiveTripDefaultStyle = (theme: TKUITheme) => ({
    main: {
        ...genStyles.flex,
        ...genStyles.column
    },
    activeTripHeader: {
        ...genStyles.flex,
        ...genStyles.alignCenter,
        ...genStyles.spaceBetween
    },
    activeTripTitle: {
        ...theme.textColorGray
    },
    info: {
        ...genStyles.flex,
        ...genStyles.alignCenter,
        paddingTop: '16px'
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
    contentInfo: {
        ...genStyles.flex,
        ...genStyles.column,
        marginTop: '20px',
        cursor: 'pointer'
    },
    status: {
        ...genStyles.alignSelfStart,
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
        padding: '1px 12px',
        marginBottom: '16px'
    },
    mode: {
        ...genStyles.flex,
        ...genStyles.alignCenter,
        minWidth: 0,            // This is so this div does not overflow through parents limits, but init's width is
        marginBottom: '16px',    // adjusted to fit, and so overflow ellipsis of child works (https://css-tricks.com/flexbox-truncated-text/).
        '& *:first-child': {
            marginRight: '10px'
        }
    }
});
